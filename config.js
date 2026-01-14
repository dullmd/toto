const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
SESSION_ID: process.env.SESSION_ID || "SILA;;;LAtlnSAT#xT3SB1_5UhE-ndzKD61JuIElzNMlpiRIa00-jOpdKUA",
// 𝖆𝖉𝖉 𝖞𝖔𝖚𝖗 𝖘𝖊𝖘𝖘𝖎𝖔𝖓 𝖎𝖉
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
// 𝗺𝗮𝗸𝗲 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝘀𝘁𝗮𝘁𝘂𝘀 𝗮𝘂𝘁𝗼 𝘀𝗲𝗲𝗻
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
// 𝗺𝗮𝗸𝗲 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝗿𝗲𝗽𝗹𝘆 𝗼𝗻 𝘀𝘁𝗮𝘁𝘂𝘀
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// 𝗮𝗻𝘁𝗶𝗰𝗮𝗹𝗹 𝗼𝗻/𝗼𝗳𝗳
ANTI_CALL: process.env.ANTI_CALL || "false",
// 𝗺𝗮𝗸𝗲 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶𝗰𝗮𝗹𝗹
CUSTOM_STATUS_EMOJIS: process.env.CUSTOM_STATUS_EMOJIS || "❤️,✨,🔥,💯,✅,👑",
// 𝘀𝘁𝗮𝘁𝘂𝘀 𝗿𝗲𝗮𝗰𝘁𝗶𝗼𝗻 𝗲𝗺𝗼𝗷𝗶𝘀
AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*𝐒𝐈𝐋𝐀-𝐌𝐃 𝐕𝐈𝐄𝐖𝐄𝐃✅*",
// 𝗮𝘂𝘁𝗼 𝗿𝗲𝗽𝗹𝘆 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗼𝗻 𝘀𝘁𝗮𝘁𝘂𝘀
ANTI_DELETE: process.env.ANTI_DELETE || "false",
// 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶 𝗱𝗲𝗹𝗲𝘁𝗲
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
// 𝗰𝗵𝗮𝗻𝗴𝗲 𝘁𝗼 '𝗦𝗮𝗺𝗲' 𝗳𝗼𝗿 𝗿𝗲𝘀𝗲𝗻𝗱 𝗶𝗻 𝘀𝗮𝗺𝗲 𝗰𝗵𝗮𝘁
WELCOME: process.env.WELCOME || "false",
// 𝘁𝗿𝘂𝗲 𝗶𝗳 𝘄𝗮𝗻𝘁 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 & 𝗴𝗼𝗼𝗱𝗯𝘆𝗲 𝗺𝘀𝗴𝘀 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀
ADMIN_EVENTS: process.env.ADMIN_EVENTS || "true",
// 𝘁𝗿𝘂𝗲 𝘁𝗼 𝗻𝗼𝘁𝗶𝗳𝘆 𝗼𝗻 𝗺𝗲𝗺𝗯𝗲𝗿 𝗽𝗿𝗼𝗺𝗼𝘁𝗲/𝗱𝗲𝗺𝗼𝘁𝗲
LINK_WHITELIST: "youtube.com,github.com",
LINK_ACTION: "mute", // "𝗸𝗶𝗰𝗸", "𝗺𝘂𝘁𝗲", 𝗼𝗿 "𝗻𝗼𝗻𝗲"
LINK_WARN_LIMIT: 3, // 𝗪𝗮𝗿𝗻𝗶𝗻𝗴𝘀 𝗯𝗲𝗳𝗼𝗿𝗲 𝗮𝗰𝘁𝗶𝗼𝗻
ANTI_LINK: process.env.ANTI_LINK || "false",
// 𝗺𝗮𝗸𝗲 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗶𝗻 𝗴𝗿𝗼𝘂𝗽𝘀
MENTION_REPLY: process.env.MENTION_REPLY || "false",
// 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝘃𝗼𝗶𝗰𝗲 𝗿𝗲𝗽𝗹𝘆 𝘄𝗵𝗲𝗻 𝗺𝗲𝗻𝘁𝗶𝗼𝗻𝗲𝗱
MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/36vahk.png",
// 𝗰𝘂𝘀𝘁𝗼𝗺 𝗺𝗲𝗻𝘂 & 𝗺𝗲𝗻𝘁𝗶𝗼𝗻 𝗿𝗲𝗽𝗹𝘆 𝗶𝗺𝗮𝗴𝗲
PREFIX: process.env.PREFIX || ".",
// 𝗯𝗼𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗽𝗿𝗲𝗳𝗶𝘅

AUTO_BIO: process.env.AUTO_BIO || "true",
TIME_ZONE: process.env.TIME_ZONE || "Africa/Dar_es_Salaam",  // 𝗖𝗵𝗮𝗻𝗴𝗲 𝘁𝗼 𝘆𝗼𝘂𝗿 𝘁𝗶𝗺𝗲𝘇𝗼𝗻𝗲
// 𝗮𝘂𝘁𝗼-𝗯𝗶𝗼 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀

BOT_NAME: process.env.BOT_NAME || "𝐒𝐈𝐋𝐀-𝐌𝐃",
// 𝗯𝗼𝘁 𝗻𝗮𝗺𝗲 𝗳𝗼𝗿 𝗺𝗲𝗻𝘂
STICKER_NAME: process.env.STICKER_NAME || "𝐒𝐈𝐋𝐀-𝐌𝐃",
// 𝘀𝘁𝗶𝗰𝗸𝗲𝗿 𝗽𝗮𝗰𝗸 𝗻𝗮𝗺𝗲
CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
// 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗰𝘂𝘀𝘁𝗼𝗺 𝗲𝗺𝗼𝗷𝗶 𝗿𝗲𝗮𝗰𝘁
CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
// 𝗰𝘂𝘀𝘁𝗼𝗺 𝗿𝗲𝗮𝗰𝘁 𝗲𝗺𝗼𝗷𝗶𝘀
DELETE_LINKS: process.env.DELETE_LINKS || "true",
// 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆 𝗱𝗲𝗹𝗲𝘁𝗲 𝗹𝗶𝗻𝗸𝘀 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗿𝗲𝗺𝗼𝘃𝗶𝗻𝗴 𝗺𝗲𝗺𝗯𝗲𝗿
OWNER_NUMBER: process.env.OWNER_NUMBER || "255789661031",
// 𝗯𝗼𝘁 𝗼𝘄𝗻𝗲𝗿 𝗻𝘂𝗺𝗯𝗲𝗿
OWNER_NAME: process.env.OWNER_NAME || "𝐒𝐈𝐋𝐀-𝐌𝐃",
// 𝗯𝗼𝘁 𝗼𝘄𝗻𝗲𝗿 𝗻𝗮𝗺𝗲
DESCRIPTION: process.env.DESCRIPTION || "*> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡*",
// 𝗯𝗼𝘁 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/36vahk.png",
// 𝗮𝗹𝗶𝘃𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗶𝗺𝗮𝗴𝗲
LIVE_MSG: process.env.LIVE_MSG || "> 𝐒𝐈𝐋𝐀-𝐌𝐃",
// 𝗮𝗹𝗶𝘃𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲
READ_MESSAGE: process.env.READ_MESSAGE || "false",
// 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝗿𝗲𝗮𝗱 𝗺𝘀𝗴𝘀
AUTO_REACT: process.env.AUTO_REACT || "false",
// 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝗿𝗲𝗮𝗰𝘁 𝗼𝗻 𝗮𝗹𝗹 𝗺𝘀𝗴𝘀
ANTI_BAD: process.env.ANTI_BAD || "true",
// 𝗳𝗮𝗹𝘀𝗲/𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶 𝗯𝗮𝗱 𝘄𝗼𝗿𝗱𝘀
MODE: process.env.MODE || "public",
// 𝘀𝗲𝘁 𝗯𝗼𝘁 𝗺𝗼𝗱𝗲: 𝗽𝘂𝗯𝗹𝗶𝗰-𝗽𝗿𝗶𝘃𝗮𝘁𝗲-𝗶𝗻𝗯𝗼𝘅-𝗴𝗿𝗼𝘂𝗽
SRIHUB_API: process.env.SRIHUB_API || "dew_5H5Dbuh4v7NbkNRmI0Ns2u2ZK240aNnJ9lnYQXR9",
// 𝘀𝗿𝗶𝗵𝘂𝗯 𝗮𝗽𝗶 𝗸𝗲𝘆
AUTO_STICKER: process.env.AUTO_STICKER || "false",
// 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝘀𝘁𝗶𝗰𝗸𝗲𝗿𝘀
AUTO_REPLY: process.env.AUTO_REPLY || "true",
// 𝘁𝗿𝘂𝗲/𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝘁𝗲𝘅𝘁 𝗿𝗲𝗽𝗹𝘆
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
// 𝗺𝗮𝗸𝗲 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝗹𝘄𝗮𝘆𝘀 𝗼𝗻𝗹𝗶𝗻𝗲
PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
// 𝗺𝗮𝗸𝗲 𝗳𝗮𝗹𝘀𝗲 𝗳𝗼𝗿 𝗽𝗿𝗶𝘃𝗮𝘁𝗲 𝗺𝗼𝗱𝗲
AUTO_TYPING: process.env.AUTO_TYPING || "true",
// 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝘀𝗵𝗼𝘄 𝘁𝘆𝗽𝗶𝗻𝗴
READ_CMD: process.env.READ_CMD || "false",
// 𝘁𝗿𝘂𝗲 𝗶𝗳 𝘄𝗮𝗻𝘁 𝘁𝗼 𝗺𝗮𝗿𝗸 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗮𝘀 𝗿𝗲𝗮𝗱
DEV: process.env.DEV || "255789661031",
// 𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 𝘄𝗵𝗮𝘁𝘀𝗮𝗽𝗽 𝗻𝘂𝗺𝗯𝗲𝗿
ANTI_VV: process.env.ANTI_VV || "true",
// 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝗻𝘁𝗶 𝗼𝗻𝗰𝗲 𝘃𝗶𝗲𝘄
AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
// 𝗺𝗮𝗸𝗲 𝗶𝘁 𝘁𝗿𝘂𝗲 𝗳𝗼𝗿 𝗮𝘂𝘁𝗼 𝗿𝗲𝗰𝗼𝗿𝗱𝗶𝗻𝗴
};
