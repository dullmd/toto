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
    pattern: "tagall",
    alias: ["all", "everyone", "tagsemua", "alltag"],
    react: "📢",
    desc: "Tag all group members",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚘𝚗𝚕𝚢 𝚠𝚘𝚛𝚔𝚜 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Get all group members
    const members = participants.map(p => p.id);
    
    if (members.length === 0) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙽𝚘 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚏𝚘𝚞𝚗𝚍`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Create mention list
    let mentionText = `┏━❑ 𝐓𝐀𝐆𝐀𝐋𝐋 ━━━━━━━━\n┃ 📢 𝑻𝒂𝒈𝒈𝒊𝒏𝒈 𝒂𝒍𝒍 ${members.length} 𝒎𝒆𝒎𝒃𝒆𝒓𝒔\n┃\n`;
    
    // Add custom message if provided
    if (q && q.trim()) {
        mentionText += `┃ 𝑴𝒆𝒔𝒔𝒂𝒈𝒆: ${q.trim()}\n┃\n`;
    }

    // Add all mentions
    members.forEach((member, index) => {
        mentionText += `@${member.split('@')[0]}`;
        if (index < members.length - 1) mentionText += ' ';
        if ((index + 1) % 5 === 0) mentionText += '\n┃ ';
    });

    mentionText += `\n┗━━━━━━━━━━━━━━━━━━━━`;

    // Send message with mentions
    await conn.sendMessage(from, {
        text: mentionText,
        mentions: members,
        contextInfo: {
            ...getContextInfo({ sender: sender }),
            mentionedJid: members
        }
    }, { quoted: fakevCard });

} catch (e) {
    l(e);
    
    let errorMsg = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚞𝚊𝚐𝚐𝚒𝚗𝚐 𝚖𝚎𝚖𝚋𝚎𝚛𝚜';
    
    await conn.sendMessage(from, {
        text: errorMsg,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
}
});
