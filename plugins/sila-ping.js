const { cmd } = require('../command');

// Define combined fakevCard 
const fakevCard = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "© 𝐒𝐈𝐋𝐀-𝐌𝐃",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:𝐒𝐈𝐋𝐀 𝐌𝐃 𝐁𝐎𝐓\nORG:𝐒𝐈𝐋𝐀-𝐌𝐃;\nTEL;type=CELL;type=VOICE;waid=255789661031:+255789661031\nEND:VCARD`
    }
  }
};

cmd({
    pattern: "ping",
    desc: "Check bot speed",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const start = Date.now();
        
        // Send initial message
        const initialMsg = await conn.sendMessage(from, 
            { text: "𝐒𝐈𝐋𝐀-𝐌𝐃..." },
            { quoted: mek }
        );
        
        const end = Date.now();
        const latency = end - start;
        
        // Stylish ping response
        const text = 
`┏━❑ 𝐏𝐎𝐍𝐆 ━━━━━━━━━━━━━━
┃ ⚡ ${latency} ms
┃ 🚀 𝐒𝐈𝐋𝐀-𝐌𝐃 𝐁𝐎𝐓
┗━━━━━━━━━━━━━━━━━━━━━`;
        
        // Edit the message
        await conn.sendMessage(from, {
            text: text,
            edit: initialMsg.key,
            contextInfo: {
                externalAdReply: {
                    title: '𝐒𝐈𝐋𝐀-𝐌𝐃',
                    body: '𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚕𝚊 𝚃𝚎𝚌𝚑',
                    thumbnailUrl: 'https://files.catbox.moe/36vahk.png',
                    sourceUrl: 'https://github.com/Sila-Md/SILA-MD',
                    mediaType: 1
                }
            }
        });
        
    } catch (e) {
        console.log("Ping Error:", e);
    }
});
