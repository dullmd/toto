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
    pattern: "youtube",
    alias: ["yt", "stalk", "ytstalk"],
    react: "🎥",
    desc: "Get YouTube channel information and latest videos",
    category: "stalk",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝚞𝚜𝚎𝚛𝚗𝚊𝚖𝚎\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚢𝚘𝚞𝚝𝚞𝚋𝚎 𝚖𝚛𝚋𝚎𝚊𝚜𝚝`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call YouTube Stalk API
    const response = await axios.get(`https://api.siputzx.my.id/api/stalk/youtube?username=${encodeURIComponent(q.trim())}`, {
        timeout: 30000
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    const data = response.data;
    
    if (!data.username) {
        throw new Error('Channel not found');
    }

    await conn.sendPresenceUpdate('paused', from);

    // Build channel info message
    let channelInfo = `┏━❑ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 ━━━━\n`;
    channelInfo += `┃ 📺 𝑼𝒔𝒆𝒓𝒏𝒂𝒎𝒆: ${data.username || 'N/A'}\n`;
    channelInfo += `┃ 📝 𝑫𝒊𝒔𝒑𝒍𝒂𝒚 𝑵𝒂𝒎𝒆: ${data.displayName || 'N/A'}\n`;
    channelInfo += `┃ 👥 𝑺𝒖𝒃𝒔𝒄𝒓𝒊𝒃𝒆𝒓𝒔: ${data.subscribers || 'N/A'}\n`;
    channelInfo += `┃ 🎬 𝑽𝒊𝒅𝒆𝒐𝒔: ${data.videoCount || 'N/A'}\n`;
    channelInfo += `┃ 📄 𝑫𝒆𝒔𝒄𝒓𝒊𝒑𝒕𝒊𝒐𝒏: ${(data.description || 'N/A').substring(0, 100)}\n`;
    channelInfo += `┃ 🔗 𝑪𝒉𝒂𝒏𝒏𝒆𝒍 𝑼𝑹𝑳: ${data.channelUrl || 'N/A'}\n`;
    channelInfo += `┗━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Build latest videos info
    channelInfo += `┏━❑ 𝐋𝐀𝐓𝐄𝐒𝐓 𝐕𝐈𝐃𝐄𝐎𝐒 ━━━━━━\n`;
    
    if (data.latestVideos && Array.isArray(data.latestVideos)) {
        data.latestVideos.forEach((video, index) => {
            channelInfo += `┃\n┃ 📹 𝑽𝒊𝒅𝒆𝒐 ${index + 1}:\n`;
            channelInfo += `┃ 🎞️ 𝑻𝒊𝒕𝒍𝒆: ${(video.title || 'N/A').substring(0, 50)}\n`;
            channelInfo += `┃ 👁️ 𝑽𝒊𝒆𝒘𝒔: ${video.views || 'N/A'}\n`;
            channelInfo += `┃ ⏱️ 𝑫𝒖𝒓𝒂𝒕𝒊𝒐𝒏: ${video.duration || 'N/A'}\n`;
            channelInfo += `┃ 🕐 𝑷𝒖𝒃𝒍𝒊𝒔𝒉𝒆𝒅: ${video.publishedTime || 'N/A'}\n`;
            channelInfo += `┃ 🔗 𝑳𝒊𝒏𝒌: ${video.videoUrl || 'N/A'}\n`;
        });
    } else {
        channelInfo += `┃ ❌ 𝑵𝒐 𝒗𝒊𝒅𝒆𝒐𝒔 𝒇𝒐𝒖𝒏𝒅\n`;
    }

    channelInfo += `┗━━━━━━━━━━━━━━━━━━━━`;

    // Truncate if too long
    if (channelInfo.length > 4096) {
        channelInfo = channelInfo.substring(0, 4090) + '...';
    }

    // Send channel avatar if available
    if (data.avatarUrl) {
        try {
            await conn.sendMessage(from, {
                image: { url: data.avatarUrl },
                caption: channelInfo,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        } catch (imgError) {
            await conn.sendMessage(from, {
                text: channelInfo,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        }
    } else {
        await conn.sendMessage(from, {
            text: channelInfo,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝚍𝚊𝚝𝚊';
    
    if (e.message === 'Channel not found') {
        errorMsg = '❌ 𝙲𝚑𝚊𝚗𝚗𝚎𝚕 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍';
    } else if (e.response?.status === 429) {
        errorMsg = '❌ 𝚁𝚊𝚝𝚎 𝚕𝚒𝚖𝚒𝚝𝚎𝚍 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛';
    } else if (e.response?.status === 500) {
        errorMsg = '❌ 𝙰𝙿𝙸 𝚜𝚎𝚛𝚟𝚎𝚛 𝚎𝚛𝚛𝚘𝚛';
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
