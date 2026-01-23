const { cmd } = require('../command');
const axios = require('axios');

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

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402325089913@newsletter',
            newsletterName: '© 𝐒𝐈𝐋𝐀 𝐌𝐃',
            serverMessageId: 143,
        },
    };
};

cmd({
    pattern: "tts",
    alias: ["ttsgoogle", "speak", "voice"],
    react: "🔊",
    desc: "Convert text to speech using Google TTS",
    category: "tools",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚝𝚎𝚡𝚝\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚝𝚝𝚜 𝙷𝚎𝚕𝚕𝚘 𝚠𝚘𝚛𝚕𝚍`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Check text length
    if (q.trim().length > 200) {
        return await conn.sendMessage(from, {
            text: `❌ 𝚃𝚎𝚡𝚝 𝚝𝚘𝚘 𝚕𝚘𝚗𝚐 (𝚖𝚊𝚡 200 𝚌𝚑𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚜)`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call Google TTS API
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(q.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 30000
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    await conn.sendPresenceUpdate('paused', from);

    // Send audio
    await conn.sendMessage(from, {
        audio: response.data,
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎 𝚊𝚞𝚍𝚒𝚘';
    
    if (e.response?.status === 429) {
        errorMsg = '❌ 𝚁𝚊𝚝𝚎 𝚕𝚒𝚖𝚒𝚝𝚎𝚍 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛';
    } else if (e.response?.status === 500) {
        errorMsg = '❌ 𝚃𝚃𝚂 𝚜𝚎𝚛𝚟𝚎𝚛 𝚎𝚛𝚛𝚘𝚛';
    } else if (e.code === 'ECONNABORTED') {
        errorMsg = '❌ 𝚁𝚎𝚚𝚞𝚎𝚜𝚝 𝚝𝚒𝚖𝚎𝚘𝚞𝚝';
    }

    await conn.sendMessage(from, {
        text: errorMsg,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});
