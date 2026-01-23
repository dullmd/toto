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
    pattern: "mute",
    alias: ["silent", "quiet"],
    react: "🔇",
    desc: "Mute the group",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) return await conn.sendMessage(from, {
        text: `❌ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚏𝚘𝚛 𝚐𝚛𝚘𝚞𝚙𝚜\n\n> © Powered by Sila Tech`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    
    if (!isAdmins) return await conn.sendMessage(from, {
        text: `❌ 𝚈𝚘𝚞 𝚗𝚎𝚎𝚍 𝚝𝚘 𝚋𝚎 𝚊𝚗 𝚊𝚍𝚖𝚒𝚗 𝚝𝚘 𝚖𝚞𝚝𝚎\n\n> © Powered by Sila Tech`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    
    await conn.groupSettingUpdate(from, 'announcement');
    
    await conn.sendMessage(from, {
        text: `┏━❑ 𝐆𝐑𝐎𝐔𝐏 𝐌𝐔𝐓𝐄𝐃 ━━━━━━━━━
┃ ✅ 𝙶𝚛𝚘𝚞𝚙 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚖𝚞𝚝𝚎𝚍
┗━━━━━━━━━━━━━━━━━━━━

> © Powered by Sila Tech`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });

} catch (e) {
    if (e.message.includes('403') || e.message.includes('permission')) {
        await conn.sendMessage(from, {
            text: `❌ 𝙱𝚘𝚝 𝚗𝚎𝚎𝚍𝚜 𝚝𝚘 𝚋𝚎 𝚊𝚍𝚖𝚒𝚗 𝚏𝚒𝚛𝚜𝚝\n\n> © Powered by Sila Tech`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    } else {
        await conn.sendMessage(from, {
            text: `❌ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝚏𝚊𝚒𝚕𝚎𝚍\n\n> © Powered by Sila Tech`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    l(e);
}
});
