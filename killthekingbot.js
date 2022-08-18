import * as dotenv from 'dotenv'
dotenv.config()
import Telegraf from 'telegraf';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig.js';
import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

import Tracker from './db/models/Tracker.js';
import dbPagamento from './db/models/Pagamentos.js';
import dbWallets from './db/models/Wallets.js';
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
  let retorno = false;
  let address = 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?';
  address += 'collection_name=stondwarlord';
  address += '&limit=16';
  address += `&match_owner=${wallet}`;
  address += '&page=1';
  address += '&template_id=534153';

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
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

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      if (data.data?.[0]?.assets
        && parseInt(data.data[0].assets) > 0) {
        retorno = true;
      }
    })
    .catch(function (err) {
      console.log("Unable to fetch SWL-", err);
    });
  return retorno;
}

async function mintKillTracker(content, wallet, paymenttx) {
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
    try {
      trackerM[0].paymenttxid = paymenttx;
      trackerM[0].minttxid = result.transaction_id;
      trackerM[0].processed = true;

      await trackerM[0].save();
    } catch (error) {
      console.error('error database mint: ', error);
    }
    content.reply(`Tracker minted, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
  } catch (error) {
    console.error('error minting kill tracker: ', error);
    content.reply(`There was an error minting the tracker: ${error}`);
    return false;
  }
}

async function sendCoins(content, userinfo) {
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

    const newPagamento = new dbPagamento({
      messageid: content.update.message.forward_from.id,
      txid: result.transaction_id,
      messagedate: content.update.message.forward_date
    });

    try {
      await newPagamento.save();
    }
    catch (err) {
      console.log('err saving new payment', err);
      content.reply(`There was an error on your request - payment: ${err}`);
      return;
    }
    return result;
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

  await fetch(address)
    .then(response => response.json())
    .then(data => {
      if (data?.data?.[0]) {
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

    content.reply(`Tracker was altered, tx: \nhttps://wax.bloks.io/transaction/${result.transaction_id}`);
    const newPagamento = new dbPagamento({
      messageid: content.update.message.forward_from.id,
      txid: result.transaction_id,
      messagedate: content.update.message.forward_date
    });

    try {
      await newPagamento.save();
    }
    catch (err) {
      console.log('err saving new update', err);
      content.reply(`There was an error on your request - update: ${err}`);
      return;
    }
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
  const message = content.update.message;
  const from = message.from;
  const comando = message.text.toString().trim().split(/\s+/);
  let waxWallet = {};

  let dbW = await dbWallets.find({
    "$and": [
      { username: from.username },
    ]
  });

  if(dbW != "undefined" && dbW && dbW[0]){
    waxWallet = {
      username: dbW[0].username,
      wallet: dbW[0].wallet,
      db: true
    }
  }

  if (!waxWallet) {
    content.reply('You need to register first, use the /reguser command.');
    return;
  }

  let tracker = await Tracker.find({
    "$and": [
      { wallet: waxWallet.wallet },
      { processed: false }
    ]
  });

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
    retorno = 'Please, send 2 WAXP to the account: pqnomoneysys';
    retorno += `\nwith the memo: ${tracker[0]._id.replaceAll('-', '')}`;
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
  let waxWallet = {};

  let dbW = await dbWallets.find({
    "$and": [
      { username: from.username },
    ]
  });

  if(dbW != "undefined" && dbW && dbW[0]){
    waxWallet = {
      username: dbW[0].username,
      wallet: dbW[0].wallet,
      db: true
    }
  }

  if (!waxWallet) {
    content.reply('You need to register first, use the /reguser command.');
    return;
  }

  let tracker = await Tracker.find({
    "$and": [
      { wallet: waxWallet.wallet },
      { processed: false }
    ]
  });

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

  addKill(content, waxWallet.wallet, asset.assetID, qtd, killListFinal)
  return;
}

async function registrar_usuario(content) {
  console.log('registering user');
  const message = content.update.message;
  const from = message.from;
  const comando = message.text.toString().trim().split(/\s+/);
  let waxWallet = {};

  let dbW = await dbWallets.find({
    "$and": [
      { username: from.username },
    ]
  });

  if(dbW != "undefined" && dbW && dbW[0]){
    waxWallet = {
      username: dbW[0].username,
      wallet: dbW[0].wallet,
      db: true
    }
  }

  if (comando && !comando[1]) {
    content.reply('You must provide a valid WAX wallet like abcde.wam or a name with 12 chars. Type the command like /reguser abcde.wam.');
  } else if (comando[1] && (comando[1].length > 12 || comando[1].length < 1)) {
    content.reply('Invalid wallet format. Please provide a wam wallet or custom 12 or less chars wallet. Type the command like /reguser abcde.wam.');
  } else {
    if (!waxWallet) {
      const newWallet = new dbWallets({
        username: from.username,
        wallet: comando[1]
      });

      try {
        await newWallet.save();
      }
      catch (err) {
        console.log('err saving new wallet', err);
        content.reply(`There was an error on your request: ${err}`);
        return;
      }
      content.reply(`@${from.username} has been registered.`);
    } else {
      content.reply('User already registered.');
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
  const message = content.update.message;
  const from = content.update.message.from;
  const forward_from = content.update.message.forward_from;
  const msgtext = message.text;
  //console.log('content.update.message: ', content.update.message);

  let waxWallet = {};

  let dbW = await dbWallets.find({
    "$and": [
      { username: from.username },
    ]
  });

  if(dbW != "undefined" && dbW && dbW[0]){
    waxWallet = {
      username: dbW[0].username,
      wallet: dbW[0].wallet,
      db: true
    }
  }
  
  //registrar usuário
  if (msgtext.includes('/reguser', '/reguser@killthekingbot')) {
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

    retorno += `\n\nREMEMBER you must be registered with the bot to log kills. \nUse the command /reguser`;

    content.reply(retorno);
    return;
  }

  //buy tracker
  if (msgtext.includes('/buytracker', '/buytracker@killthekingbot')) {
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    buytracker(content);
    return;
  }

  //buy tracker
  if (msgtext.includes('/checkbuy', '/checkbuy@killthekingbot')) {
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    checkbuy(content);
    return;
  }

  if (msgtext.includes('/atualizarwar4', '/atualizarwar4@killthekingbot')) {
    if (message.chat.type !== "private") {
      content.reply(`${from.username}, please, use this command in a Private Message with the Bot.`);
      return;
    }

    atualizarwar4(content);
    return;
  }

  if (!msgtext.includes('has killed @')) {
    return;
  }

  if (msgtext.includes('has killed')) {
    //console.log('message: ', message);
    content.reply('Processing your request');
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
    let pago = {};

    let dbP = await dbPagamento.find({
      "$and": [
        { messagedate: originalDate },
      ]
    });

    if(dbP != "undefined" && dbP && dbP[0]){
      pago = {
        messageid: dbP[0].messageid,
        txid: dbP[0].txid,
        messagedate: dbP[0].messagedate,
        db: true
      }
    }
  
    if (!pago.txid) {
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`(1)Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
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
    let pago = {};

    let dbP = await dbPagamento.find({
      "$and": [
        { messagedate: originalDate },
      ]
    });

    if(dbP != "undefined" && dbP && dbP[0]){
      pago = {
        messageid: dbP[0].messageid,
        txid: dbP[0].txid,
        messagedate: dbP[0].messagedate,
        db: true
      }
    }

    if (!pago.txid) {
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`(2)Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }
    return
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
    && msgtext.includes('has killed @')) {
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
    let originalDate = content.update.message.forward_date;

    if (originalDate < 1659737117) {
      let ret = `${from.username}, fellow wizard, only new kills are allowed.`
      content.reply(ret);
      return;
    }

    let oponent = msgtext.substring(msgtext.indexOf('killed') + 7, 50);
    let pago = {};

    let dbP = await dbPagamento.find({
      "$and": [
        { messagedate: originalDate },
      ]
    });

    if(dbP != "undefined" && dbP && dbP[0]){
      pago = {
        messageid: dbP[0].messageid,
        txid: dbP[0].txid,
        messagedate: dbP[0].messagedate,
        db: true
      }
    }

    if (!pago.txid) {
      sendCoins(content, waxWallet);
      atualizarKill(content, waxWallet, oponent);
    } else {
      content.reply(`(3)Bounty on that kill already made. TX: \nhttps://wax.bloks.io/transaction/${pago.txid}`)
    }
  }
});

bot.startPolling();