const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    isJidBroadcast,
    AnyMessageContent,
    prepareWAMessageMedia,
    areJidsSameUser,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys')
const { EventEmitter } = require('events');
EventEmitter.defaultMaxListeners = 0;

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const fs = require('fs')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const util = require('util')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const path = require('path')
const { File } = require('megajs')
const prefix = ('.')

// Owner Number
const ownerNumber = ['94722770762']

// ====================== SESSION DOWNLOADER (ADVANCED) ======================
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadMegaNode(node, targetPath) {
  if (node.directory) {
    ensureDirSync(targetPath);
    for (const child of (node.children || [])) {
      await downloadMegaNode(child, path.join(targetPath, child.name));
    }
    return;
  }
  ensureDirSync(path.dirname(targetPath));
  if (fs.existsSync(targetPath) && node.size) {
    if (fs.statSync(targetPath).size >= node.size) return;
  }
  await new Promise((resolve, reject) => {
    const stream = node.download();
    const w = fs.createWriteStream(targetPath);
    stream.on("error", reject);
    w.on("error", reject);
    w.on("finish", resolve);
    stream.pipe(w);
  });
}

async function loadSession() {
  let sessionId = config.SESSION_ID;
  const sessionsDir = path.join(__dirname, "sessions");
  ensureDirSync(sessionsDir);
  const credsPath = path.join(sessionsDir, "creds.json");

  if (fs.existsSync(credsPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(credsPath, "utf8"));
      if (existing && existing.noiseKey) {
        console.log("[SESSION] Valid creds.json found — skipping decode/download.");
        return true;
      }
    } catch {}
  }

  if (!sessionId) {
    console.log('[SESSION] Please add your session to SESSION_ID env !!');
    return false;
  }

  // Handle various prefixes and formats
  if (sessionId.startsWith("KAVI MD~")) {
    sessionId = "https://mega.nz/file/" + sessionId.slice(8);
    console.log("[SESSION] KAVI MD~ prefix detected → converting to MEGA link.");
  } else if (sessionId.startsWith("ck&")) {
    sessionId = "https://mega.nz/file/" + sessionId.slice(5);
    console.log("[SESSION] ranu& prefix detected → converting to MEGA link.");
  } else if (sessionId.startsWith("ckk&") && sessionId.length < 100) {
    sessionId = "https://mega.nz/file/" + sessionId.slice(6);
    console.log("[SESSION] ckk& short ID detected → converting to MEGA link.");
  }

  if (sessionId.startsWith("https://mega.nz") || sessionId.startsWith("mega://")) {
    try {
      console.log("[SESSION] Downloading session from MEGA...");
      const megaFile = File.fromURL(sessionId);
      await megaFile.loadAttributes();
      if (megaFile.directory) {
        await downloadMegaNode(megaFile, sessionsDir);
      } else {
        await new Promise((resolve, reject) => {
          const stream = megaFile.download();
          const w = fs.createWriteStream(credsPath);
          stream.on("error", reject);
          w.on("error", reject);
          w.on("finish", resolve);
          stream.pipe(w);
        });
      }
      console.log("SESSION DOWNLOADED COMPLETED ✅");
      return true;
    } catch (e) {
      console.log("[SESSION] MEGA download failed:", e.message);
      return false;
    }
  }

  try {
    let raw = sessionId.trim();
    for (const prefixKey of ["KAVI MD~","ck&","CK_","ckk&"]) {
      if (raw.startsWith(prefixKey)) { raw = raw.slice(prefixKey.length); break; }
    }
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const parsed  = JSON.parse(decoded);
    if (!parsed || !parsed.noiseKey) throw new Error("Missing noiseKey — not valid creds");
    fs.writeFileSync(credsPath, JSON.stringify(parsed, null, 2));
    console.log("[SESSION] Base64 session decoded → sessions/creds.json");
    console.log("SESSION DOWNLOADED COMPLETED ✅");
    return true;
  } catch (e) {
    console.log("[SESSION] Base64 decode failed:", e.message);
  }

  try {
    const parsed = JSON.parse(sessionId);
    if (parsed && parsed.noiseKey) {
      fs.writeFileSync(credsPath, JSON.stringify(parsed, null, 2));
      console.log("[SESSION] Raw JSON session saved.");
      console.log("SESSION DOWNLOADED COMPLETED ✅");
      return true;
    }
  } catch {}

  console.log("[SESSION] Could not load session.");
  return false;
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

async function connectToWA() {
console.log("CONNECTING CHETHMINA-MD 🔖..");
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
var { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        syncFullHistory: true,
        auth: state,
        version
        })
    
conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
connectToWA()
}
} else if (connection === 'open') {
console.log('♻️ INSTALLING PLUGINS FILES PLEASE WAIT... 🪄')
const path = require('path');
fs.readdirSync("./plugins/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() == ".js") {
require("./plugins/" + plugin);
}
});
console.log('PLUGINS FILES INSTALL SUCCESSFULLY ✅')
console.log('CHETHMINA-MD CONNECTED TO WHATSAPP ENJOY ✅')

let up = `.startnews 120363420145467503@newsletter`;
conn.sendMessage(conn.user.id, { image: { url: config.MENU_IMG }, caption: up })

}
})

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage')
            ? mek.message.ephemeralMessage.message
            : mek.message;

        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]);
            console.log(`Marked message from ${mek.key.remoteJid} as read.`);
        }

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
            await conn.readMessages([mek.key]);
            const mnyako = await jidNormalizedUser(conn.user.id);
            await conn.sendMessage(mek.key.remoteJid, { react: { key: mek.key, text: '👾' } }, { statusJidList: [mek.key.participant, mnyako] });
        }

        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
            const emojis = ['🤍', '❤️', '🧡', '💛', '💚', '💝', '💙', '💜', '💖', '💗'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.sendMessage(mek.key.remoteJid, {
                react: { text: randomEmoji, key: mek.key }
            }, { statusJidList: [mek.key.participant] });
        }

        const m = sms(conn, mek)
        var smg = m
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m.message.reactionMessage ? true : false
        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek })
        }

        conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            let mime = '';
            let res = await axios.head(url)
            mime = res.headers['content-type']
            if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
            }
            let type = mime.split("/")[0] + "Message";
            if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
            }
        }

        //__________________________________________ANTI DELETE_________________________________
    if (!m.id.startsWith("BAE5")) {
    const baseDir = 'message_data';
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }
    
    function loadChatData(remoteJid, messageId) {
      const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
      try {
        const data = fs.readFileSync(chatFilePath, 'utf8');
        return JSON.parse(data) || [];
      } catch (error) {
        return [];
      }
    }
    
    function saveChatData(remoteJid, messageId, chatData) {
      const chatDir = path.join(baseDir, remoteJid);
      if (!fs.existsSync(chatDir)) {
        fs.mkdirSync(chatDir, { recursive: true });
      }
      const chatFilePath = path.join(chatDir, `${messageId}.json`);
      try {
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
      } catch (error) {
        console.error('Error saving chat data:', error);
      }
    }
        
    function handleIncomingMessage(message) {
      const remoteJid = from;
      const messageId = message.key.id;
      const chatData = loadChatData(remoteJid, messageId);
      chatData.push(message);
      saveChatData(remoteJid, messageId, chatData);
    }
    
    const delfrom = config.DELETEMSGSENDTO !=='' ? config.DELETEMSGSENDTO + '@s.whatsapp.net': from
    function handleMessageRevocation(revocationMessage) {
    const remoteJid = from;
    const messageId = revocationMessage.msg.key.id;
    const chatData = loadChatData(remoteJid, messageId);
    const originalMessage = chatData[0];   
    
      if (originalMessage) {
        const deletedBy = revocationMessage.sender.split('@')[0];
        const sentBynn = originalMessage.key.participant ?? revocationMessage.sender;
        const sentBy = sentBynn.split('@')[0];
        if ( deletedBy.includes(botNumber) || sentBy.includes(botNumber) ) return;
        
        if(originalMessage.message && originalMessage.message.conversation && originalMessage.message.conversation !== ''){
          const messageText = originalMessage.message.conversation;
          if (isGroup && messageText.includes('chat.whatsapp.com')) return;
          var xx = '```';
          conn.sendMessage(delfrom, { text: `⁉️ *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_\n\n> 🔓 Message Text: ${xx}${messageText}${xx}` });
        } else if(originalMessage.msg && originalMessage.msg.type ==='MESSAGE_EDIT'){
          conn.sendMessage(delfrom, { text: `❌ *edited message detected* ${originalMessage.message.editedMessage.message.protocolMessage.editedMessage.conversation}` },{quoted: mek});
        } else {
          conn.sendMessage(delfrom, { text: `⁉️ *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_` });
        }
      }
    }
    
    if (mek.msg && mek.msg.type === 0) {
      handleMessageRevocation(mek);
    } else {
      handleIncomingMessage(mek);
    }
    }

        //________________________________________INBOX BLOCK_________________________________
        if (config.INBOX_BLOCK === "true" && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
            if (!mek.key.fromMe) {
                console.log(`Auto-block initiated for ${mek.key.remoteJid}...`);
                try {
                    await conn.sendMessage(mek.key.remoteJid, { text: "*Warning 1 ❗*" });
                    await conn.sendMessage(mek.key.remoteJid, { text: "*Warning 2 ❗*" });
                    await conn.sendMessage(mek.key.remoteJid, { text: "*Warning 3 ❗*" });
                    await conn.sendMessage(mek.key.remoteJid, { text: "*Blocked 🚫*" });
                    await conn.updateBlockStatus(mek.key.remoteJid, 'block');
                } catch (error) {
                    console.error(`Error during auto-block for ${mek.key.remoteJid}:`, error);
                }
                return;
            }
        }

        //______________________________________PUBLIC REACT_________________________________
        if (!isReact && senderNumber !== botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = ['😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖'];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        //_________________STATUS_REACT_FUNCTION_____________
        conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return ((decode.user && decode.server && decode.user + '@' + decode.server) || jid);
            } else return jid;
        };

        //____________________________________OWNER REACT_________________________________
        if (senderNumber.includes("94727163302")) {
            if (isReact) return
            m.react("👨‍💻")
        }

        //_________Ofline___________________
        if (config.ALWAYS_ONLINE === "false") {
            conn.sendPresenceUpdate('unavailable');
        }

        //___________________________________BOT WORK MODE_________________________________
        if (!isOwner && config.MODE === "private") return;
        if (!isOwner && isGroup && config.MODE === "inbox") return;
        if (!isOwner && !isGroup && config.MODE === "groups") return;

        //___________________________________COMMAND CHECK_________________________________
        const events = require('./command');
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    cmd.function(conn, mek, m, {
                        from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
                    });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }

        //_________________________________PLUGIN MAP_________________________________
        events.commands.map(async (command) => {
            if (body && command.on === "body") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (mek.q && command.on === "text") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            }
        });
    })
}

app.get("/", (req, res) => {
    res.send("CHETHMINA-MD CONNECTED ✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

setTimeout(async () => {
    await loadSession();
    connectToWA();
}, 4000);
