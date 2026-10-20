


const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ckk&H4sIAAAAAAAAA5VUTZOiSBT8L3XVGAUEwYiOWAREUFAURN3YQwkFlvIlVYA44X/fwJ6e6cPubO+teFTky5eZr76DLMcELVALJt9BUeIaUtQdaVsgMAHTKopQCfoghBSCCWjUTaGEjXnIXc4Jm2AQlw7lTG3PIO7wIOrxIPLRzd1vNPkNPPugqE4JDn4DGDSrwV6Dw5CNhQ2B1/y8cE/igBSqP040PHbrIHLP5aGWR2/g2SFCXOIs1oozSlEJkwVq1xCXX6Pf2urUwtKKse7u8Xg7+rOps/YeFqNLVaPLJmf57m109Y/s4Wv0BezfsJA6OypSc3uSlvve9s5FDvEiSXSTnspa6mMhWDHO3+kTHGcoNEKUUUzbL+vumTvPYjFpRG7KeeKsOU3dAyKb+UgZXga9sbcO9JzFmaKNvkZ8Gbm3ld6jQphypmBb8zM8qMbeXTJmO92lmuD60+2JC6/Y+Ex8XX5k5fp/dO+t9iuVLPfpoSePyHyruD4f1ZVyKq6MyGqDUe2NzcCaQ936Gv2DbBhZ1oyKJJlulgbX7itT3F0v1Zr2hmQmCzwqcK15YvyJPqRV+TuWNfI1JRQuxt1YIrF1gqje3lqWoy7jH0e+M9hNHXu0iiuzWggJUgMlGvA5KeW9/1iokdgUrpee212r6Wc99BRhOK7OzdtroitqjRBMmGcflCjGhJaQ4jx71YZsH8Cw3qKgRPQlLxhL58WJ34iRf4FxBpfO1lva+uWxYAJOLu6CCWdbW6jrhy+/gT4oyjxAhKBwjgnNy9ZChMAYETD5868+yNCdvhvXteOYPohwSaiXVUWSw/DD1Y+fMAjyKqPbNguU7oBKMBn+KiNKcRaTTscqg2VwxjVSzpASMIlgQtDPCVGJQjChZYV+bq2Sh53wts7aG3sngT5IX4bgEEyANBqLosSKnChMeOYP8q3pUGFRfMsQBX2QvG6NREEaM+x4zEsSx3cXu/rzJ78OLkQU4oSACVDsVZaVjaZZrcTZB12XnVhWYhn8mucjGO/C76x8u+Zm4sZKm5szc6GKjMCE68MmeSS2uz+1QXMNM/vqxG//ANKlSNnPN2N+vZwprXdIqQwfib7iD+JS6SV8u4V4KGpOT+V36lLh8fAkIyYtdj3TH/Ycfbu3NXN4vYnaPa2Wjt3ujto1keO3rluIahygz81Oc2Q4gpPNlvHMcEhdlFWhnz3xbkeJhOyhd0K8LCO22iI5r/lUtY4b7S6dLsV9VnvTbD4WRnZ4zo7DyLeadKxwTO/ivEf2tTLJj6cKv8LUOdV9Rhi9Nj+DnX//6dw77y5fw2f/E8SPp+Rf1nG6cxfaRbpHmmuSxXXqsTGH54p/YbVjwLsew4qZZc6Pj6NmgOfzrz4oEkijvEzBBMAsLHMcgj4o86oLrJFF+W+aKfLVUJ141g2eQELlX0vg4hQRCtMCTJixxI5Ebshyz78BKOCq/joHAAA=",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "false",
MODE: process.env.MODE || "public",
AUTO_VOICE: process.env.AUTO_VOICE || "false",
AUTO_STICKER: process.env.AUTO_STICKER || "false",
AUTO_REPLY: process.env.AUTO_REPLY || "true",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/M5DfjJ1h/x.jpg",
MENU_IMG: process.env.MENU_IMG || "https://i.ibb.co/M5DfjJ1h/x.jpg",
IMG_URL: process.env.IMG_URL || "https://i.ibb.co/M5DfjJ1h/x.jpg",
ALIVE_MSG: process.env.ALIVE_MSG || "*😎 Hey How are you? 👻*\n\n*👊 CK Whatsapp Bot Alive Now..!*\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*",
ANTI_LINK: process.env.ANTI_LINK || "true",
ANTI_BAD: process.env.ANTI_BAD || "true",
PREFIX: process.env.PREFIX || ".",
FAKE_RECORDING: process.env.FAKE_RECORDING || "false",
FAKE_TYPING: process.env.FAKE_TYPING || "false",
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
CURRENT_STATUS: process.env.CURRENT_STATUS || "true",
AUTO_REACT: process.env.AUTO_REACT || "false",
HEART_REACT: process.env.HEART_REACT || "false",
OWNER_REACT: process.env.OWNER_REACT || "true",
BOT_NAME: process.env.BOT_NAME || "CK BOT",
OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39", // omdbapi.com
ANTI_DELETE: process.env.ANTI_DELETE || "true",
DELETEMSGSENDTO: process.env.DELETEMSGSENDTO === undefined ? '' : process.env.DELETEMSGSENDTO,
INBOX_BLOCK: process.env.INBOX_BLOCK || "false",
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "false",
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
LANGUAGE: process.env.LANGUAGE || "sinhala",
LOGO: process.env.LOGO || "https://i.ibb.co/M5DfjJ1h/x.jpg",
};
