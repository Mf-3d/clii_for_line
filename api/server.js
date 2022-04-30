'use strict';

require('dotenv').config();
const env = process.env;
const axios = require('axios');
const express = require('express');
const line = require('@line/bot-sdk');
const clii_modules = require('./module')
const clii = require('./clii/module')
const PORT = env.PORT || 3000;
var version = '1.0.0-beta6';


const config = {
    channelSecret: env.Secret,
    channelAccessToken: env.AccessToken
};

const app = express();

var ready = true;


app.get('/', (req, res) => {
  if(ready === true){
    res.sendFile(__dirname + '/index.html');
  }
  else if(req.query.get == 'maintenance'){
    res.json({
      "status": ready
    });
  }
  else{
    res.sendFile(__dirname + '/no_ready.html');
  }
}); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    // //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
    // if(req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff'){
    //     res.send('BOTは動作中です (POST)');
    //     console.log('疎通確認用');
    //     return; 
    // }

    if(ready === true){
      Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
    }
});

app.get("/liff", function(req, res) {
  res.sendFile(__dirname + '/tos.html');
});

app.get("/tos", function(req, res) {
  res.sendFile(__dirname + '/liff.html');
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  var split_text = event.message.text.split(/\s+/);

  let replyText = '';
  
  var rnd = Math.floor( Math.random()*9 );
  var replyMark = '';
  if (rnd === 0) replyMark = "";

  //メッセージで変化する
  if (event.message.text.indexOf('...') !== -1) replyMark = "...";
  if (event.message.text.indexOf('//') !== -1) replyMark = "...//";

  //開発者用フラグ
  let replyFlag = '';
  if (split_text.indexOf('-v') !== -1) replyFlag = "フラグ機能は2022/01/21に廃止されました。\n詳しくはこちら → https://blog.mf7cli.ml/blog/20220121-1";
  if (split_text.indexOf('-help') !== -1) replyFlag = "フラグ機能は2022/01/21に廃止されました。\n詳しくはこちら → https://blog.mf7cli.ml/blog/20220121-1";

  //挨拶系
  if(event.message.text.indexOf('おはよう') !== -1){
    replyText = 'おはようございます';
  }
  if(event.message.text.indexOf('こんにちは') !== -1){
    replyText = 'こんにちは';
  }
  if(event.message.text.indexOf('こんばんは') !== -1){
    replyText = 'こんばんは';
  }

  //日常系
  if(event.message.text.indexOf('お風呂') !== -1){
    replyText = 'お風呂いってらしゃい';
  }
  if(event.message.text.indexOf('BOT') !== -1){
    replyText = '呼ばれたような気がした…';
  }
  if(event.message.text.indexOf('GitHub') !== -1){
    replyText = 'GitHubは大有名ですよね！\nプログラミングには必須です！';
  }
  if(event.message.text.indexOf('なんじゃ') !== -1){
    replyText =  '私にもわかりません…';
  }
  if(event.message.text.indexOf('おみくじ') !== -1){
    var rnd = Math.floor( Math.random()*6 );
    var omikuji;
    if (rnd === 0) omikuji = "大吉";
    if (rnd === 1) omikuji = "吉";
    if (rnd === 2) omikuji = "中吉";
    if (rnd === 3) omikuji = "小吉";
    if (rnd === 4) omikuji = "末吉";
    if (rnd === 5) omikuji = "凶";
    replyText = omikuji + 'です！';
  }
  if(event.message.text.indexOf('ふみ') !== -1){
    var rnd = Math.floor( Math.random()*6 );
    var omikuji;
    if (rnd === 0) omikuji = "「二階堂ふみ」が無性生殖したら合計で「四階堂ふみふみ」になるって魔？";
    if (rnd === 1) omikuji = "ひふみん";
    if (rnd === 2) omikuji = "不眠症です";
    if (rnd === 3) omikuji = "小吉";
    if (rnd === 4) omikuji = "末吉";
    if (rnd === 5) omikuji = "凶";

    replyText = omikuji + '！';
  }
  if(event.message.text.indexOf('愛はある') !== -1){
    var rnd = Math.floor( Math.random()*100 );
    replyText = 'そこに愛は' + rnd + '%あります';
  }
  if(event.message.text.indexOf('確率') !== -1){
    var rnd = Math.floor( Math.random()*100 );
    replyText = rnd + '%あります';
  }
  if(split_text[0] == 'run_clii'){
    var code = event.message.text.substr(event.message.text.indexOf('run_clii') + 9);
    try{
        clii.run_clii(code);
        replyText = clii_modules.replyText;
    }
    catch(e){
        replyText = code + '\n' + e;
    }
  }

  if(split_text[0] == 'this'){
    if(split_text[1] == 'version'){
      replyText = '(data)\n　Clii for LINE version : ' + version + '\n　CliiScript version : ' + clii.version;
    }

    if(split_text[1] == 'help'){
      replyText = '(data)\n　Program version : "this version"\n　Help : "this help"';
    }
  }

  //else{
  //  replyText = '私には'+event.message.text+'が分からないです...';
  //}
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText + replyMark +  replyFlag//実際に返信の言葉を入れる箇所
  });
}
// app.listen(PORT);
// console.log(`Server running at ${PORT}`);
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);