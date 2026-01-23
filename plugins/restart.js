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
    pattern: "restart",
    desc: "Restart the bot",
    category: "main",
    react: "🔄",
    filename: __filename,
    owner: true
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const restartMessage = 
`┏━❑ 𝐑𝐄𝐒𝐓𝐀𝐑𝐓 ━━━━━━━━━
┃ 🔄 Bot is restarting now...
┃ ⏳ Please wait a moment...
┃ 💚 Coming back online soon!
┗━━━━━━━━━━━━━━━━━━━━`;
        
        await conn.sendMessage(from, 
            { text: restartMessage },
            { quoted: fakevCard }
        );
        
        // Wait a moment before restarting
        setTimeout(() => {
            console.log('🔄 Bot is restarting...');
            process.exit(0);
        }, 2000);
        
    } catch (e) {
        reply("❌ Error during restart: " + e.message);
    }
});
