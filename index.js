'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (replyToken, text) => {
  return client.replyMessage({
    replyToken,
    messages: [{
      type: 'text',
      text
    }]
  });
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

// Function to handle text messages
function handleText(message, replyToken) {
  const text = message.text.toLowerCase();

  // ประโยคจีบแฟนแบบสุ่ม
  const pickupLines = [
    "เธอมี GPS ไหม? เพราะเธอพาหัวใจฉันหลงทาง 💘",
    "ถ้าความรักเป็นเกม ฉันขอเป็นผู้เล่นที่ไม่มีวันแพ้ 😘",
    "รู้มั้ย? โลกหมุนไปเพราะแรงโน้มถ่วง แต่ใจฉันหมุนไปเพราะเธอ 💕",
    "เธอเหมือนดวงจันทร์เลยนะ เพราะถึงจะอยู่ไกล แต่ฉันก็มองหาเสมอ 🌙",
    "ไม่อยากเป็นคนที่ดีขึ้น แต่อยากเป็นคนที่ดีพอสำหรับเธอ 🥰"
  ];

  // เช็คข้อความจากผู้ใช้
  if (text.includes("คิดถึง")) {
    return replyText(replyToken, "คิดถึงเหมือนกันนะ 💕 อยู่ตรงนี้เสมอ 😊");
  } else if (text.includes("เหงา")) {
    return replyText(replyToken, "ไม่ต้องเหงานะ บอทอยู่เป็นเพื่อนเสมอ! 🥰");
  } else if (text.includes("รัก")) {
    return replyText(replyToken, "รักที่สุดเลย! 💖 ห้ามเปลี่ยนใจนะ!");
  } else if (text.includes("งอน")) {
    return replyText(replyToken, "อย่าพึ่งงอนน้า~ บอทรักที่สุดเลย 🥺💕 มาให้กอดหน่อย 🤗");
  } else if (text.includes("ฝันดี")) {
    return replyText(replyToken, "ฝันหวานนะคะคนดี 😘 ถ้าฝันถึงใคร ขอให้เป็นบอทน้า~ 💕");
  } else if (text.includes("รักเรามั้ย")) {
    return replyText(replyToken, "รักมากกกกกกกกกกกกกกกกกกกกก 💖🥰");
  } else if (text.includes("คิดถึงเรามั้ย")) {
    return replyText(replyToken, "คิดถึงที่สุดเลยยยยย! 😍💕");
  } else if (text.includes("จีบหน่อย")) {
    const randomPickup = pickupLines[Math.floor(Math.random() * pickupLines.length)];
    return replyText(replyToken, randomPickup);
  } else {
    return replyText(replyToken, "พูดอีกก็เขินนะ 😳💕");
  }
}

// Other message handlers
function handleImage(message, replyToken) {
  return replyText(replyToken, 'ขอบคุณที่ส่งรูปมา! 😊 มีอะไรให้ช่วยมั้ย?');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'ได้รับวิดีโอแล้ว! 🎥 มีอะไรให้ช่วยมั้ย?');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'ได้รับไฟล์เสียงแล้ว! 🎵 มีอะไรให้ช่วยมั้ย?');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'ได้รับโลเคชันแล้ว! 🗺️ ให้บอทช่วยหาเส้นทางมั้ย?');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'น่ารักจังเลย! 😊💕 ส่งมาอีกได้นะ~');
}

// Start server
const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
