import * as dotenv from 'dotenv'
dotenv.config()
import Telegraf from 'telegraf';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig.js';
import fetch from 'node-fetch';
import fs from 'fs';

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

  /*if(msgtext.includes('txt teste send coins #33')){
    let rawdata = fs.readFileSync('./db/wallets.json');
  wallets = JSON.parse(rawdata);

  let waxWallet = wallets.find(w => w.username === from.username);
    console.log('veio send 2')
    sendCoins2(content, waxWallet);
    return;
  }*/


  //registrar usuário
  if (msgtext.includes('/reguser')) {
    registrar_usuario(content);

    return;
  }

  if(!msgtext.includes('has killed @')){
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