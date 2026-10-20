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

// Session ID Handling
//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
    const sessdata = config.SESSION_ID.replace("KAVI MD~", '');
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.download((err, data) => {
        if (err) throw err
        fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
            console.log("SESSION DOWNLOADED COMPLETED ✅")
        })
    })
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
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log("Connection closed due to: ", lastDisconnect?.error);

            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => {
                    connectToWA();
                }, 4000);
            } else {
                console.log("Session logged out, please update SESSION_ID.");
            }
        } else if (connection === 'open') {
            console.log('♻️ INSTALLING PLUGINS FILES PLEASE WAIT... 🪄')
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

    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                    decode.server &&
                    decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };

    conn.ev.on('messages.upsert', async (mek) => {
        try {
            mek = mek.messages[0]
            if (!mek || !mek.message) return

            mek.message = (getContentType(mek.message) === 'ephemeralMessage')
                ? mek.message.ephemeralMessage.message
                : mek.message;

            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key]);
            }

            if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([mek.key]);
                const mnyako = await jidNormalizedUser(conn.user.id);
                const emojis = ['🤍', '❤️', '🧡', '💛', '💚', '💝', '💙', '💜', '💖', '💗'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, mnyako] });
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
            const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => { }) : ''
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

                const delfrom = config.DELETEMSGSENDTO !== '' ? config.DELETEMSGSENDTO + '@s.whatsapp.net' : from
                function handleMessageRevocation(revocationMessage) {
                    const remoteJid = from;
                    const messageId = revocationMessage.msg.key.id;
                    const chatData = loadChatData(remoteJid, messageId);
                    const originalMessage = chatData[0]

                    if (originalMessage) {
                        const deletedBy = revocationMessage.sender.split('@')[0];
                        const sentBynn = originalMessage.key.participant ?? revocationMessage.sender;
                        const sentBy = sentBynn.split('@')[0];
                        if (deletedBy.includes(botNumber) || sentBy.includes(botNumber)) return;

                        var xx = '```'
                        if (originalMessage.message && originalMessage.message.conversation && originalMessage.message.conversation !== '') {
                            const messageText = originalMessage.message.conversation;
                            if (isGroup && messageText.includes('chat.whatsapp.com')) return;
                            conn.sendMessage(delfrom, { text: `⁉️ *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_\n\n> 🔓 Message Text: ${xx}${messageText}${xx}` });
                        } else if (originalMessage.type === 'imageMessage') {
                            async function imageMessageRetrive() {
                                var nameJpg = getRandom('');
                                const ml = sms(conn, originalMessage)
                                let buff = await ml.download(nameJpg)
                                let fileType = require('file-type');
                                let type = fileType.fromBuffer(buff);
                                await fs.promises.writeFile("./" + type.ext, buff);
                                if (originalMessage.message.imageMessage.caption) {
                                    await conn.sendMessage(delfrom, { image: fs.readFileSync("./" + type.ext), caption: `⁉️ *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_\n\n> 🔓 Message Text: ${originalMessage.message.imageMessage.caption}` })
                                } else {
                                    await conn.sendMessage(delfrom, { image: fs.readFileSync("./" + type.ext), caption: `⁉️ *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_` })
                                }
                            }
                            imageMessageRetrive()
                        }
                    }
                }

                if (mek.msg && mek.msg.type === 0) {
                    handleMessageRevocation(mek);
                } else {
                    handleIncomingMessage(mek);
                }
            }

            //__________________________________________STATUS DOWNLOAD_________________________________
            if (["send", "Send", "Seve", "Ewpm", "ewpn", "Dapan", "dapan", "oni", "Oni", "save", "Save", "ewanna", "Ewanna", "ewam", "Ewam", "sv", "Sv", "දාන්න", "එවම්න"].includes(body)) {
                const data = JSON.stringify(mek.message, null, 2);
                const jsonData = JSON.parse(data);
                const isStatus = jsonData.extendedTextMessage?.contextInfo?.remoteJid;
                if (isStatus && m.quoted) {
                    const getExtension = (buffer) => {
                        const magicNumbers = { jpg: 'ffd8ffe0', png: '89504e47', mp4: '00000018' };
                        const magic = buffer.toString('hex', 0, 4);
                        return Object.keys(magicNumbers).find(key => magicNumbers[key] === magic) || 'jpg';
                    };

                    if (m.quoted.type === 'imageMessage') {
                        var nameJpg = getRandom('');
                        let buff = await m.quoted.download(nameJpg);
                        let ext = getExtension(buff);
                        await fs.promises.writeFile("./" + ext, buff);
                        const caption = m.quoted.imageMessage.caption || '';
                        await conn.sendMessage(from, { image: fs.readFileSync("./" + ext), caption: caption });
                    } else if (m.quoted.type === 'videoMessage') {
                        var nameJpg = getRandom('');
                        let buff = await m.quoted.download(nameJpg);
                        let ext = getExtension(buff);
                        await fs.promises.writeFile("./" + ext, buff);
                        const caption = m.quoted.videoMessage.caption || '';
                        await conn.sendMessage(from, { video: fs.readFileSync("./" + ext), caption: caption, mimetype: "video/mp4" }, { quoted: mek });
                    }
                }
            }

            //________________________________________INBOX BLOCK_________________________________
            if (config.INBOX_BLOCK === "true" && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
                if (!mek.key.fromMe) {
                    try {
                        await conn.sendMessage(mek.key.remoteJid, { text: "*Blocked 🚫*" });
                        await conn.updateBlockStatus(mek.key.remoteJid, 'block');
                    } catch (error) {
                        console.error(`Error during auto-block:`, error);
                    }
                    return;
                }
            }

            //______________________________________PUBLIC REACT_________________________________
            if (!isReact && senderNumber !== botNumber && config.AUTO_REACT === 'true') {
                const reactions = ['😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖'];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }

            //_________Offline___________________
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
                }
            });

        } catch (err) {
            console.error('Error in message handler:', err);
        }
    })
}

app.get("/", (req, res) => {
    res.send("CHETHMINA-MD CONNECTED✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

setTimeout(() => {
    connectToWA();
}, 4000);
