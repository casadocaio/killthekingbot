import * as dotenv from 'dotenv'
dotenv.config()
import Telegraf from 'telegraf';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig.js';
import fetch from 'node-fetch';
import fs from 'fs';
import mongoose from 'mongoose';
//import { uuid } from 'uuidv4';
import { v4 as uuid } from 'uuid';

import Tracker from './db/models/Tracker.js';
import connecteToDatabase from './db/database.js';

const signatureProvider = new JsSignatureProvider([process.env.WAXKEY]);
const auth = 'pqnomoneysys'

const rpc = new JsonRpc("https://wax.greymass.com", {
  fetch,
});

const apiRpc = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder(),
});

const TAPOS = {
  blocksBehind: 3,
  expireSeconds: 30,
};

connecteToDatabase();

//iniciando bot
const bot = new Telegraf(process.env.TOKEN);

/*async function sendCoins(content, userinfo, acc, amount) {
  try {
    const result = await apiRpc.transact(
      {
        actions: [
          {
            account: acc,
            name: "transfer",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              from: auth,
              to: userinfo.wallet,
              quantity: amount,
              memo: `Congrats on killing War4Luv - ${content.update.message.forward_date}`
            },
          },
        ],
      },
      TAPOS
    );
    console.log('result tokens: ', result);
    content.reply(`Congrats on killing War4luv, prize sent, tx: \nhttps://wax.bloks.io/transaction/${result.processed.id}`);
    let rawdataMensagem = fs.readFileSync('./db/payments.json');
    let payments = JSON.parse(rawdataMensagem);
    payments.push({
      messageid: content.update.message.forward_from.id,
      txid: result.processed.id,
      messagedate: content.update.message.forward_date
    })
    let data = JSON.stringify(payments);
    fs.writeFileSync('./db/payments.json', data);
    return result;
    //return result;
  } catch (error) {
    console.error('error sending tokens: ', error);
    content.reply(`Ops, problem sending the prize, error: \n${error}`);
    return false;
  }
}*/

async function verifySWL(wallet) {
  let retorno = false;
  let address = 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?';
  address += 'collection_name=stondwarlord';
  address += '&limit=16';
  address += `&match_owner=${wallet}`;
  address += '&page=1';
  address += '&template_id=534153';

  //##debug_verify
  console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      console.log('SWL: ', data);
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
        console.log('verificado = true');
        retorno = true;
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch SWL-", err);
    });


  return retorno;
}

async function verifyKillTracker(wallet) {
  let retorno = false;
  let address = 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?';
  address += 'collection_name=killthekingx';
  address += '&limit=16';
  address += `&match_owner=${wallet}`;
  address += '&page=1';
  address += '&template_id=568875';

  //##debug_verify
  console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      console.log('SWL: ', data);
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
        console.log('verificado = true');
        retorno = true;
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch SWL-", err);
    });

  return retorno;
}

async function mintKillTracker(content, wallet, paymenttx) {
  console.log('wallet: ', wallet);
  console.log('paymenttx: ', paymenttx);
  try {
    const result = await apiRpc.transact(
      {
        actions: [
          {
            account: "atomicassets",
            name: "mintasset",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              authorized_minter: auth,
              collection_name: 'killthekingx',
              schema_name: 'killtracker',
              template_id: '568875',
              new_asset_owner: wallet,
              immutable_data: [],
              mutable_data: [{
                key: "kills",
                value: ["uint64", 1]
              }],
              tokens_to_back: []
            },
          },
        ],
      },
      TAPOS
    );
    console.log('result mint kill tracker: ', result);
    let trackerM = await Tracker.find({
      "$and": [
        { wallet: wallet },
        { processed: false },
      ]
    });
    console.log('trackerM:', trackerM[0]);
    try {
      trackerM[0].paymenttxid  = paymenttx;
      trackerM[0].minttxid = result.transaction_id;
      trackerM[0].processed = true;

      await trackerM[0].save();
    } catch (error) {
      console.error('error database mint: ', error);
    }
  
    content.reply(`Tracker minted, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
    //return result;
  } catch (error) {
    console.error('error minting kill tracker: ', error);
    content.reply(`There was an error minting the tracker: ${error}`);
    return false;
  }
}

async function sendCoins(content, userinfo) {
  console.log('entrou send coins 2');
  try {
    const result = await apiRpc.transact(
      {
        actions: [
          {
            account: 'eosio.token',
            name: "transfer",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              from: auth,
              to: userinfo.wallet,
              quantity: '0.10000000 WAX',
              memo: `Congrats on killing War4Luv - ${content.update.message.forward_date}`
            },
          },
          {
            account: 'mdcryptonfts',
            name: "transfer",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              from: auth,
              to: userinfo.wallet,
              quantity: '5 WOJAK',
              memo: `Congrats on killing War4Luv - ${content.update.message.forward_date}`
            },
          },
          {
            account: 'niftywizards',
            name: "transfer",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              from: auth,
              to: userinfo.wallet,
              quantity: '5.0000 DUST',
              memo: `Congrats on killing War4Luv - ${content.update.message.forward_date}`
            },
          },
          {
            account: 'leefmaincorp',
            name: "transfer",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              from: auth,
              to: userinfo.wallet,
              quantity: '5.0000 LEEF',
              memo: `Congrats on killing War4Luv - ${content.update.message.forward_date}`
            },
          },
        ],
      },
      TAPOS
    );
    console.log('result tokens: ', result);
    content.reply(`Congrats on killing War4luv, prize sent, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
    let rawdataMensagem = fs.readFileSync('./db/payments.json');
    let payments = JSON.parse(rawdataMensagem);
    payments.push({
      messageid: content.update.message.forward_from.id,
      txid: result.transaction_id,
      messagedate: content.update.message.forward_date
    })
    let data = JSON.stringify(payments);
    fs.writeFileSync('./db/payments.json', data);
    return result;
    //return result;
  } catch (error) {
    console.error('error sending tokens: ', error);
    content.reply(`Ops, problem sending the prize, error: \n${error}`);
    return false;
  }
}

async function verifyTX(memo, wallet) {
  let retorno = {
    ok: false,
    tx: ''
  };
  let address = 'https://api.waxsweden.org:443/v2/history/get_actions?';
  address += `@transfer.memo=${memo}`;
  address += '&account=pqnomoneysys';
  address += `&limit=1`;

  //##debug_verify
  console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      //console.log('verificação: ', data.actions[0].act.data);
      if (data.actions?.[0]?.act?.data
        && parseInt(data.actions[0].act.data.amount) === 2
        && data.actions[0].act.data.from === wallet) {
        console.log('verificado = true');
        retorno = {
          ok: true,
          tx: data.actions[0].trx_id
        }
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch Buy TX-", err);
    });


  return retorno;
}

async function buytracker(content) {
  //console.log('buying tracker');
  const message = content.update.message;
  const from = message.from;
  const comando = message.text.toString().trim().split(/\s+/);
  let rawdata = fs.readFileSync('./db/wallets.json');
  let wallets = JSON.parse(rawdata);
  let waxWallet = wallets.find(w => w.username === from.username);

  let tracker = await Tracker.find({
    "$and": [
      { wallet: waxWallet.wallet },
      { processed: false }
    ]
  });

  console.log('tracker: ', tracker);
  if (!tracker[0]) {
    const newTracker = new Tracker({
      _id: uuid(),
      createdat: new Date(),
      updatedat: new Date(),
      wallet: waxWallet.wallet,
      paymenttxid: '',
      minttxid: '',
      processed: false
    });
    try {
      await newTracker.save();
      tracker = [newTracker];
    }
    catch (err) {
      console.log('err', err);
      content.reply(`There was an erro on your request: ${err}`);
      return;
    }
  }
  let retorno ='';

  if (!tracker[0].paymenttxid) {
  retorno = 'Please, send 2 WAXP to the account: **pqnomoneysys**';
  retorno += `\nwith the memo: **${tracker[0]._id.replaceAll('-','')}**`;
  retorno += '\n\nPlease note that anything besides 2 wax will be lost.';
  retorno += '\nYou must send the exact memo when sending the coins.';
  retorno += '\nAfter sending the coins use the command: /checkbuy';
  } else {
    retorno = 'Payment already made, please, use /checkbuy command.';
  }

  content.reply(retorno);
  return;
};

async function checkbuy(content) {
  console.log('checking buying tracker');
  const message = content.update.message;
  const from = message.from;
  const comando = message.text.toString().trim().split(/\s+/);
  let rawdata = fs.readFileSync('./db/wallets.json');
  let wallets = JSON.parse(rawdata);
  let waxWallet = wallets.find(w => w.username === from.username);

  let tracker = await Tracker.find({
    "$and": [
      { wallet: waxWallet.wallet },
      { processed: false }
    ]
  });

  console.log('tracker check: ', tracker);
  if (!tracker[0]) {
    content.reply(`${from.username} sorry wizard, can\'t find your request or you don't have any pending buy, please use the command: /buytracker`);
    return;
  }
  let retorno ='meh';

  let verificacao = await verifyTX(tracker[0]._id.replaceAll('-',''), waxWallet.wallet);

  if (verificacao.ok) {
    await mintKillTracker(content, waxWallet.wallet, verificacao.tx);
    retorno = `${from.username} tracker minted to your wallet, check in a few minutes.`;
  } else {
    retorno = 'There was a problem, i can\'t find your transaction.';
    retorno += '\nDid you send from your wallet?';
    retorno += '\nDid you send exactly 2 wax?';
  }

  content.reply(retorno);
  return;
};


function registrar_usuario(content) {
  console.log('registering user');
  const message = content.update.message;
  const from = message.from;
  const comando = message.text.toString().trim().split(/\s+/);


  let rawdata = fs.readFileSync('./db/wallets.json');
  let wallets = JSON.parse(rawdata);

  let waxWallet = wallets.find(w => w.username === from.username);


  if (comando && !comando[1]) {
    content.reply('You must provide a valid WAX wallet like abcde.wam or a name with 12 chars. Type the command like /reguser abcde.wam.');
  } else if (comando[1] && (comando[1].length > 12 || comando[1].length < 1)) {
    content.reply('Invalid wallet format. Please provide a wam wallet or custom 12 or less chars wallet. Type the command like /reguser abcde.wam.');
  } else {
    if (!waxWallet) {
      wallets.push({
        username: from.username,
        wallet: comando[1]
      })
      let data = JSON.stringify(wallets);
      fs.writeFileSync('./db/wallets.json', data);
      content.reply('user registered.');
    } else {
      content.reply('user already registered.');
    }
  }
  return;
};

bot.start(content => {
  const from = content.update.message.from
  content.reply(`Welcome fellow wizard.\n${from.first_name}, start by using the reguser slash command with your wallet.`
  )
});

bot.on('text', async (content, next) => {
  //console.log('content: ', content);

  const message = content.update.message;
  const from = content.update.message.from;
  const forward_from = content.update.message.forward_from;
  const msgtext = message.text;
  let wallets = []
  //console.log('from: ', from);
  console.log('content.update.message: ', content.update.message);

  //registrar usuário
  if (msgtext.includes('/reguser')) {
    registrar_usuario(content);

    return;
  }

  //buy tracker
  if (msgtext.includes('/buytracker')) {
    //console.log('entrou buy');
    //console.log('message:', message);
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    buytracker(content);

    return;
  }

  //buy tracker
  if (msgtext.includes('/checkbuy')) {
    //console.log('entrou check');
    //console.log('message:', message);
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    checkbuy(content);

    return;
  }

  /*
  if (msgtext.includes('##debug_verify')) {
    let wallets1 = []
    let rawdata1 = fs.readFileSync('./db/wallets.json');
  wallets1 = JSON.parse(rawdata1);

  let waxWallet1 = wallets1.find(w => w.username === from.username);
    console.log('verificando: ', await verifySWL('.o4qw.wam'));

    return;
  }*/

  if (!msgtext.includes('has killed @')) {
    return;
  }

  if (msgtext.includes('has killed')) {
    console.log('message: ', message);
  }

  if (msgtext.includes('has killed')
    && (!forward_from
      || !forward_from.is_bot)) {
    let ret = `${from.username} fellow wizard, i got you trying to steal me, i\'ve got my eyes on you.`
    content.reply(ret);
    return;
  }

  if (msgtext.includes('has killed')
    && !msgtext.endsWith('@War4luv')) {
    let ret = `${from.username} fellow wizard, only kills on War4luv are accepted at the moment.`
    content.reply(ret);
    return;
  }

  //simple tease
  if (message.text.includes('you know')) {
    content.reply('I\'ll search that on my scrolls');
  }

  if (from.username.includes('War4luv')) {
    content.reply('Nice try King, but You can\'t collect a bounty on yourself.');
    return;
  }

  let rawdata = fs.readFileSync('./db/wallets.json');
  wallets = JSON.parse(rawdata);

  let waxWallet = wallets.find(w => w.username === from.username);

  if (!waxWallet) {
    let ret = `${from.username} is not registered yet, use the reguser command with your wax wallet.`
    content.reply(ret);
    return;
  }

  if (!msgtext.startsWith(`@${from.username}`)
    && msgtext.includes('has killed @War4luv')) {
    let ret = `${from.username} nice try wizard, but you can only claim bounties on your kills.`
    content.reply(ret);
    return;
  }

  if (!verifySWL(waxWallet.wallet)) {
    let ret = `${from.username} you must be a Stoned War Lord to be able to claim bounties.`
    content.reply(ret);
    return;
  }

  if (forward_from
    && forward_from.is_bot
    && msgtext.includes('has killed @War4luv')
    && msgtext.includes(waxWallet.username)
    && from.username.includes(waxWallet.username)
  ) {
    let rawdataMensagem = fs.readFileSync('./db/payments.json');
    let payments = JSON.parse(rawdataMensagem);
    let originalDate = content.update.message.forward_date;

    if (originalDate < 1659737117) {
      let ret = `${from.username}, fellow wizard, only new kills are allowed.`
      content.reply(ret);
      return;
    }

    let pago = payments.find(p => p.messagedate === originalDate);
    if (!pago) {
      sendCoins(content, waxWallet);

    } else {
      content.reply(`Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }

  }
});

bot.startPolling();