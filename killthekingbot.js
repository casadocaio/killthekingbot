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


async function atualizarwar4(content) {
  content.reply('blza, vlew, flow');
  return
  //console.log('entrou addKill');
  try {
    const result = await apiRpc.transact(
      {
        actions: [
          {
            account: 'atomicassets',
            name: "setassetdata",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              authorized_editor: auth,
              asset_owner: 'jx.aw.wam',
              asset_id: 1099812067884,
              new_mutable_data: [
                {
                  "key": "kills", "value": ["uint64", 24]
                },
                {
                  "key": "Kill List", "value": ["string", '@War4luv: 18;@AssassinTime14: 1;@UmeshTechYT: 1;@ReverseSlide: 1;@INSANELY_INSANE: 2;@kalpeshdave: 1;']
                }
              ]
            },
          },
        ],
      },
      TAPOS
    );
    //console.log('result tokens: ', result);
    content.reply(`Tracker was altered, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
    return result;
  } catch (error) {
    console.error('error altering kill tracker: ', error);
    content.reply(`There was an error altering the tracker: ${error}`);
    return false;
  }
}

async function verifySWL(wallet) {
  console.log('entrou verify');
  let retorno = false;
  let address = 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?';
  address += 'collection_name=stondwarlord';
  address += '&limit=16';
  address += `&match_owner=${wallet}`;
  address += '&page=1';
  address += '&template_id=534153';

  //##debug_verify
  //console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      //console.log('SWL: ', data);
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
        //console.log('verificado = true');
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
  //console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      console.log('SWL: ', data);
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
        //console.log('verificado = true');
        retorno = true;
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch SWL-", err);
    });

  return retorno;
}

async function mintKillTracker(content, wallet, paymenttx) {
  //console.log('wallet: ', wallet);
  //console.log('paymenttx: ', paymenttx);
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
    //console.log('trackerM:', trackerM[0]);
    try {
      trackerM[0].paymenttxid = paymenttx;
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
  //console.log('entrou send coins 2');
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

async function getTracker(wallet, oponent) {
  let retorno = {
    assetID: 0,
    kills: 0,
    killList: ''
  };
  let address = 'https://wax.api.atomicassets.io/atomicmarket/v1/assets?';
  address += 'collection_name=killthekingx';
  address += '&limit=10';
  address += `&owner=${wallet}`;
  address += '&page=1';
  address += '&template_id=568875';
  address += '&order=asc';

  //##debug_verify
  //console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      //console.log('tracker: ', data.data[0].data);
      if (data?.data?.[0]) {
        //retorno = data.data[0].asset_id;
        retorno = {
          assetID: data.data[0].asset_id,
          kills: data.data[0].data.kills ? data.data[0].data.kills : 1,
          killList: data.data[0].data['Kill List'] ? data.data[0].data['Kill List'] : `${oponent}: 1;`
        }
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch TRACKER-", err);
    });

  return retorno;
}

async function addKill(content, wallet, assetID, qtd, killList) {
  //console.log('entrou addKill');
  try {
    const result = await apiRpc.transact(
      {
        actions: [
          {
            account: 'atomicassets',
            name: "setassetdata",
            authorization: [
              {
                actor: auth,
                permission: "active",
              },
            ],
            data: {
              authorized_editor: auth,
              asset_owner: wallet,
              asset_id: assetID,
              new_mutable_data: [
                {
                  "key": "kills", "value": ["uint64", qtd]
                },
                {
                  "key": "Kill List", "value": ["string", killList]
                }
              ]
            },
          },
        ],
      },
      TAPOS
    );
    //console.log('result tokens: ', result);
    content.reply(`Tracker was altered, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
    return result;
  } catch (error) {
    console.error('error altering kill tracker: ', error);
    content.reply(`There was an error altering the tracker: ${error}`);
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
  //console.log('address:', address);

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      //console.log('verificação: ', data.actions[0].act.data);
      if (data.actions?.[0]?.act?.data
        && parseInt(data.actions[0].act.data.amount) === 2
        && data.actions[0].act.data.from === wallet) {
        //console.log('verificado = true');
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

  //console.log('tracker: ', tracker);
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
  let retorno = '';

  if (!tracker[0].paymenttxid) {
    retorno = 'Please, send 2 WAXP to the account: **pqnomoneysys**';
    retorno += `\nwith the memo: **${tracker[0]._id.replaceAll('-', '')}**`;
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

  //console.log('tracker check: ', tracker);
  if (!tracker[0]) {
    content.reply(`${from.username} sorry wizard, can\'t find your request or you don't have any pending buy, please use the command: /buytracker`);
    return;
  }
  let retorno = 'meh';

  let verificacao = await verifyTX(tracker[0]._id.replaceAll('-', ''), waxWallet.wallet);

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

async function atualizarKill(content, waxWallet, oponent) {
  let asset = await getTracker(waxWallet.wallet, oponent);

  if (asset.assetID === 0) {
    return;
  }

  //console.log('asset', asset);
  //let oponent = '@War4luv';
  let existOponente = false;
  let qtd = parseInt(asset.kills) + 1;
  let killList = asset.killList.split(";").filter(Boolean);
  let newKillList = killList.map(kill => {
    if (kill.includes(oponent)) {
      existOponente = true;
      let alterar = kill.split(" ");
      alterar[1] = parseInt(alterar[1]) + 1;
      return alterar[0].toString() + ' ' + alterar[1].toString() + ';';
    } else {
      return kill + ';';
    }
  })

  if (!existOponente) {
    newKillList.push(`${oponent}: 1;`);
  }

  let killListFinal = '';
  newKillList.forEach(kill => {
    killListFinal += kill.toString();
  });

  //console.log('qtd', qtd);
  //console.log('killListFinal',killListFinal);

  addKill(content, waxWallet.wallet, asset.assetID, qtd, killListFinal)

  return;
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
  let retorno = `Welcome fellow wizard.\n${from.first_name}, start by using the reguser slash command with your wallet OR buytracker command.`;
  retorno += '\nYou must forward the messages where you killed somebody in the NW Battle Room.';
  retorno += '\nUse the /buy command to know how to get your Kill Tracker.';
  content.reply(retorno);
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

  let rawdata = fs.readFileSync('./db/wallets.json');
  wallets = JSON.parse(rawdata);
  let waxWallet = wallets.find(w => w.username === from.username);
  

  //registrar usuário
  if (msgtext.includes('/reguser')) {
    registrar_usuario(content);

    return;
  }

  if (msgtext === '/buy' || msgtext === '/buy@killthekingbot') {
    let retorno = `Hi there fellow wizard @${from.username}.`;
    retorno += `\nTo get the tracker you have some options:`;
    retorno += `\n1 - Get it from my listings, that way you can choose the mint number.`;
    retorno += `\nAH listings: https://wax.atomichub.io/profile/pqnomoneysys#listings`;

    retorno += `\n\n2 - Get it from waxdao drops at: \nhttps://waxdao.io/drops/122`;

    retorno += `\n\n3 - You can DM the bot and use the Slash comand buytracker and follow the instructions.`;

    content.reply(retorno);

    return;
  }

  

  //increase tracker
  /*if (msgtext.includes('/increase')) {
    //console.log('entrou buy');
    //console.log('message:', message);
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    let asset = await getTracker(waxWallet.wallet);

    if (asset.assetID === 0) {
      return;
    }

    console.log('asset', asset);

    let oponent = '@War4luv';

    let qtd = parseInt(asset.kills) + 1;
    let killList = asset.killList.split(";");
    let newKillList = killList.map(kill => {
      if (kill.includes(oponent)) {
        let alterar = kill.split(" ");
        alterar[1] = parseInt(alterar[1]) + 1;
        return alterar[0].toString() + ' ' + alterar[1].toString() + ';';
      } else {
        return kill;
      }
    })

    let killListFinal = '';
    newKillList.forEach(kill => {
      killListFinal += kill.toString();
    });

    //console.log('qtd', qtd);
    //console.log('killListFinal',killListFinal);

    addKill(waxWallet.wallet, asset.assetID, qtd, killListFinal)

    return;
  }*/

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

  if (msgtext.includes('/atualizarwar4')) {
    //console.log('entrou check');
    //console.log('message:', message);
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    atualizarwar4(content);

    return;
  }

  console.log('ver');
  //let isSWL = false;
  //isSWL = await verifySWL(waxWallet.wallet);
  //console.log('ver2');

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

  if (msgtext.startsWith(`@${from.username}`)
  && msgtext.endsWith(`killed @${from.username}`)) {
    let ret = `${from.username} nice try wizard, but you can\'t claim anything on yourself.`
    content.reply(ret);
    return;
  }

  

  if (forward_from
    && forward_from.is_bot
    && msgtext.startsWith(`@${from.username}`)
    && !msgtext.endsWith(`@${from.username}`)
    && msgtext.includes('has killed')
    && from.username.includes(waxWallet.username)
    && !verifySWL(waxWallet.wallet)
  ) {
    let originalDate = content.update.message.forward_date;

    if (originalDate < 1659737117) {
      let ret = `${from.username}, fellow wizard, only new kills are allowed.`
      content.reply(ret);
      return;
    }
    let oponent = msgtext.substring(msgtext.indexOf('killed') + 7, 50);
    let rawdataMensagem = fs.readFileSync('./db/payments.json');
    let payments = JSON.parse(rawdataMensagem);
    let pago = payments.find(p => p.messagedate === originalDate);
    if (!pago) {
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }
    return
  }

  if (forward_from
    && forward_from.is_bot
    && msgtext.startsWith(`@${from.username}`)
    && !msgtext.endsWith(`@${from.username}`)
    && msgtext.includes('has killed')
    && from.username.includes(waxWallet.username)
    && !msgtext.endsWith('@War4luv')
  ) {
    let originalDate = content.update.message.forward_date;

    if (originalDate < 1659737117) {
      let ret = `${from.username}, fellow wizard, only new kills are allowed.`
      content.reply(ret);
      return;
    }
    let oponent = msgtext.substring(msgtext.indexOf('killed') + 7, 50);
    let rawdataMensagem = fs.readFileSync('./db/payments.json');
    let payments = JSON.parse(rawdataMensagem);
    let pago = payments.find(p => p.messagedate === originalDate);
    if (!pago) {
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }
    return
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
    let oponent = msgtext.substring(msgtext.indexOf('killed') + 7, 50);

    let pago = payments.find(p => p.messagedate === originalDate);
    if (!pago) {
      sendCoins(content, waxWallet);
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }
  }
});

bot.startPolling();