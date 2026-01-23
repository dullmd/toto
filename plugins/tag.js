const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const filePath = path.join(__dirname, '../temp/', `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

cmd({
    pattern: "tag",
    alias: ["tagg", "mention"],
    react: "📢",
    desc: "Tag a person or forward message with tag",
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

    if (!isBotAdmins) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚖𝚊𝚔𝚎 𝚝𝚑𝚎 𝚋𝚘𝚝 𝚊𝚗 𝚊𝚍𝚖𝚒𝚗 𝚏𝚒𝚛𝚜𝚝`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    if (!isAdmins) {
        const stickerPath = './assets/sticktag.webp';
        if (fs.existsSync(stickerPath)) {
            const stickerBuffer = fs.readFileSync(stickerPath);
            await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
        }
        return;
    }

    if (quoted) {
        const senderJid = quoted.sender;
        const replyMessage = quoted.message;
        let messageContent = {};

        // Handle image messages
        if (replyMessage.imageMessage) {
            const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
            messageContent = {
                image: fs.readFileSync(filePath),
                caption: (q || replyMessage.imageMessage.caption || '') + ` @${senderJid.split('@')[0]}`,
                mentions: [senderJid]
            };
        }
        // Handle video messages
        else if (replyMessage.videoMessage) {
            const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
            messageContent = {
                video: fs.readFileSync(filePath),
                caption: (q || replyMessage.videoMessage.caption || '') + ` @${senderJid.split('@')[0]}`,
                mentions: [senderJid]
            };
        }
        // Handle text messages
        else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
            const originalText = replyMessage.conversation || replyMessage.extendedTextMessage.text;
            messageContent = {
                text: originalText + `\n\n@${senderJid.split('@')[0]}`,
                mentions: [senderJid]
            };
        }
        // Handle document messages
        else if (replyMessage.documentMessage) {
            const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
            messageContent = {
                document: fs.readFileSync(filePath),
                fileName: replyMessage.documentMessage.fileName,
                caption: (q || '') + ` @${senderJid.split('@')[0]}`,
                mentions: [senderJid]
            };
        }

        if (Object.keys(messageContent).length > 0) {
            await conn.sendMessage(from, messageContent, { quoted: mek });
        }
    } else {
        return await conn.sendMessage(from, {
            text: `❌ 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊 𝚖𝚎𝚖𝚋𝚎𝚛 𝚘𝚛 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚘 𝚝𝚊𝚐 𝚝𝚑𝚎𝚖`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

} catch (e) {
    l(e);
    await conn.sendMessage(from, {
        text: `❌ 𝙴𝚛𝚛𝚘𝚛 𝚝𝚊𝚐𝚐𝚒𝚗𝚐`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
}
});
