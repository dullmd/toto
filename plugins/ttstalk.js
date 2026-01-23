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
    pattern: "ttstalk",
    alias: ["ttstalk", "ttst", "ttstalkuser"],
    react: "🎵",
    desc: "Get TikTok user profile information",
    category: "stalk",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚃𝚒𝚔𝚃𝚘𝚔 𝚞𝚜𝚎𝚛𝚗𝚊𝚖𝚎\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚝𝚝𝚜𝚝𝚊𝚕𝚔 𝚖𝚛𝚋𝚎𝚊𝚜𝚝`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call TikTok Stalk API
    const response = await axios.get(`https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q.trim())}`, {
        timeout: 30000
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    const data = response.data;
    
    if (!data.username) {
        throw new Error('User not found');
    }

    await conn.sendPresenceUpdate('paused', from);

    // Build user info message
    let userInfo = `┏━❑ 𝐓𝐈𝐊𝐓𝐎𝐊 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ━━━━━\n`;
    userInfo += `┃ 🎵 𝑼𝒔𝒆𝒓𝒏𝒂𝒎𝒆: ${data.username || 'N/A'}\n`;
    userInfo += `┃ 👤 𝑵𝒊𝒄𝒌𝒏𝒂𝒎𝒆: ${data.nickname || 'N/A'}\n`;
    userInfo += `┃ 👥 𝑭𝒐𝒍𝒍𝒐𝒘𝒆𝒓𝒔: ${data.followers || 'N/A'}\n`;
    userInfo += `┃ 👤 𝑭𝒐𝒍𝒍𝒐𝒘𝒊𝒏𝒈: ${data.following || 'N/A'}\n`;
    userInfo += `┃ 🎬 𝑽𝒊𝒅𝒆𝒐𝒔: ${data.videoCount || 'N/A'}\n`;
    userInfo += `┃ ❤️ 𝑳𝒊𝒌𝒆𝒔: ${data.likes || 'N/A'}\n`;
    userInfo += `┃ 💬 𝑪𝒐𝒎𝒎𝒆𝒏𝒕𝒔: ${data.commentCount || 'N/A'}\n`;
    userInfo += `┃ 📝 𝑩𝒊𝒐: ${(data.bio || 'N/A').substring(0, 100)}\n`;
    userInfo += `┃ ✔️ 𝑽𝒆𝒓𝒊𝒇𝒊𝒆𝒅: ${data.verified ? '✅ Yes' : '❌ No'}\n`;
    userInfo += `┃ 🔗 𝑷𝒓𝒐𝒇𝒊𝒍𝒆: ${data.profileUrl || 'N/A'}\n`;
    userInfo += `┗━━━━━━━━━━━━━━━━━━━━`;

    // Truncate if too long
    if (userInfo.length > 4096) {
        userInfo = userInfo.substring(0, 4090) + '...';
    }

    // Send profile avatar if available
    if (data.avatarUrl) {
        try {
            await conn.sendMessage(from, {
                image: { url: data.avatarUrl },
                caption: userInfo,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        } catch (imgError) {
            await conn.sendMessage(from, {
                text: userInfo,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        }
    } else {
        await conn.sendMessage(from, {
            text: userInfo,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚃𝚒𝚔𝚃𝚘𝚔 𝚍𝚊𝚝𝚊';
    
    if (e.message === 'User not found') {
        errorMsg = '❌ 𝚄𝚜𝚎𝚛 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍';
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
