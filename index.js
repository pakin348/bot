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
  if (event.type === 'message' && event.message.type === 'text') {
    return handleText(event.message, event.replyToken);
  }
  return Promise.resolve(null);
}

// คำตอบแบบสุ่มสำหรับแต่ละประเภทข้อความ
const responses = {
  "คิดถึง": [
    "เค้าคิดถึงเหมือนกันนะไอ้เด็ก 💕😊",
    "คิดถึงที่สุดเลยยยย! 😍💕",
    "คิดถึงวันแรกที่เราเจอกันเลย 💖",
    "คิดถึงแบบไม่ไหวแล้ว มาหาหน่อยได้มั้ย 🥺💕",
    "คิดถึงแค่ไหนให้ลองเอาหัวใจไปชั่งดู 💘"
  ],
  "เหงา": [
    "ไม่ต้องเหงานะ พี่อยู่เป็นเเฟนเสมอ! 🥰",
    "เหงาหรอ~ มากอดกันเร็ว 🤗💕",
    "เหงาแบบนี้ต้องให้พี่ดูแลแล้วนะ 😘",
    "เหงาก็แค่ส่งข้อความมาหาไง บอทอยู่ตรงนี้เสมอ 💖",
    "บอทอยู่เป็นเพื่อนนะ อย่าคิดมากน้าา 💕"
  ],
  "รัก": [
    "เค้ารักเธอที่สุดเลย! 💖 ห้ามเปลี่ยนใจไปรักคนอื่นน้าาา",
    "รักนะคะที่รักกกก 😍💕",
    "รักเธอเท่าท้องฟ้าเลย 🌌💘",
    "รักแบบไม่มีเหตุผล รู้แค่ว่ารักก็พอ 😘",
    "รักแล้วรักเลย ไม่เปลี่ยนใจแน่นอน 💕"
  ],
  "งอน": [
    "อย่าพึ่งงอนน้า~ พี่รักหนูที่สุดเลย 🥺💕 มาให้กอดหน่อยน้าาา 🤗",
    "งอนแบบนี้ต้องโดนหอมแก้มซะแล้ว 😘💕",
    "โถ่~ ใครทำให้หนูงอนนนน 😢 มาให้เค้าปลอบเร็ว 💕",
    "งอนแบบนี้ พี่ต้องง้อใช่มั้ย 🥺💕",
    "อย่าทำหน้ามุ่ยสิ เดี๋ยวพี่พาไปกินของอร่อยนะ 🍰💕"
  ],
  "ฝันดี": [
    "ฝันหวานนะคะคนดี 😘 ถ้าฝันถึงใคร ขอให้เป็นเค้าน้า~ 💕",
    "ฝันดีน้าาาา 😴💖",
    "นอนหลับฝันดี พรุ่งนี้ตื่นมาสดใส 💕",
    "คืนนี้นอนกอดหมอนแทนเค้าก่อนนะ 🥺💕",
    "หลับฝันดีนะคะ ตื่นมาจะได้เจอข้อความจากเค้า 😘"
  ],
  "สวัสดี": [
    "สวัสดีค่าาา~ วันนี้เป็นยังไงบ้าง? 😊💕",
    "สวัสดีค่ะ! มีอะไรให้บอทช่วยมั้ย 😘",
    "สวัสดีวันสดใส~ ☀️💕",
    "ทักมาบ่อย ๆ นะ เค้าชอบคุยด้วย 😍",
    "เธอมี GPS ไหม? เพราะเธอพาหัวใจฉันหลงทาง 💘"
  ]
};

// ฟังก์ชันสุ่มตอบกลับจากหมวดหมู่ที่ตรงกับข้อความของผู้ใช้
function handleText(message, replyToken) {
  const text = message.text.toLowerCase();

  // หา key ที่ตรงกับข้อความของผู้ใช้
  for (const key in responses) {
    if (text.includes(key)) {
      const randomReply = responses[key][Math.floor(Math.random() * responses[key].length)];
      return replyText(replyToken, randomReply);
    }
  }

  // ถ้าไม่มีคำที่ตรงกัน ให้สุ่มตอบกลับทั่วไป
  const randomFallback = [
    "พูดอีกก็เขินนะ 😳💕",
    "หืมมม~ หมายถึงอะไรน้าาา 😘",
    "พิมพ์มาแบบนี้คืออยากให้บอทอ้อนใช่ม้าาา 💕",
    "บอทงงแป๊บ~ แต่ก็รักนะ 😍",
    "ว่าไงดีน้าาา~ ขอคิดแป๊บ 🤔💕"
  ];
  return replyText(replyToken, randomFallback[Math.floor(Math.random() * randomFallback.length)]);
}

// Start server
const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
