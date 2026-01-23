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
    pattern: "github",
    alias: ["gh", "githubstalk", "ghuser"],
    react: "🐙",
    desc: "Get GitHub user profile information",
    category: "stalk",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝙶𝚒𝚝𝙷𝚞𝚋 𝚞𝚜𝚎𝚛𝚗𝚊𝚖𝚎\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚐𝚒𝚝𝚑𝚞𝚋 𝚝𝚘𝚛𝚟𝚊𝚕𝚍𝚜`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call GitHub Stalk API
    const response = await axios.get(`https://api.siputzx.my.id/api/stalk/github?user=${encodeURIComponent(q.trim())}`, {
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
    let userInfo = `┏━❑ 𝐆𝐈𝐓𝐇𝐔𝐁 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ━━━━━━\n`;
    userInfo += `┃ 🐙 𝑼𝒔𝒆𝒓𝒏𝒂𝒎𝒆: ${data.username || 'N/A'}\n`;
    userInfo += `┃ 👤 𝑵𝒂𝒎𝒆: ${data.name || 'N/A'}\n`;
    userInfo += `┃ 📝 𝑩𝒊𝒐: ${(data.bio || 'N/A').substring(0, 80)}\n`;
    userInfo += `┃ 📍 𝑳𝒐𝒄𝒂𝒕𝒊𝒐𝒏: ${data.location || 'N/A'}\n`;
    userInfo += `┃ 🔗 𝑾𝒆𝒃𝒔𝒊𝒕𝒆: ${data.website || 'N/A'}\n`;
    userInfo += `┃ 📧 𝑬𝒎𝒂𝒊𝒍: ${data.email || 'Private'}\n`;
    userInfo += `┃ 👥 𝑭𝒐𝒍𝒍𝒐𝒘𝒆𝒓𝒔: ${data.followers || '0'}\n`;
    userInfo += `┃ 👤 𝑭𝒐𝒍𝒍𝒐𝒘𝒊𝒏𝒈: ${data.following || '0'}\n`;
    userInfo += `┃ 📦 𝑹𝒆𝒑𝒐𝒔𝒊𝒕𝒐𝒓𝒊𝒆𝒔: ${data.repos || '0'}\n`;
    userInfo += `┃ ⭐ 𝑷𝒖𝒃𝒍𝒊𝒄 𝑮𝒊𝒔𝒕𝒔: ${data.publicGists || '0'}\n`;
    userInfo += `┃ 🏢 𝑪𝒐𝒎𝒑𝒂𝒏𝒚: ${data.company || 'N/A'}\n`;
    userInfo += `┃ ✔️ 𝑽𝒆𝒓𝒊𝒇𝒊𝒆𝒅: ${data.verified ? '✅ Yes' : '❌ No'}\n`;
    userInfo += `┃ 🔒 𝑷𝒓𝒊𝒗𝒂𝒕𝒆: ${data.private ? '🔒 Yes' : '🔓 No'}\n`;
    userInfo += `┃ 📅 𝑪𝒓𝒆𝒂𝒕𝒆𝒅: ${data.createdAt || 'N/A'}\n`;
    userInfo += `┃ ✏️ 𝑼𝒑𝒅𝒂𝒕𝒆𝒅: ${data.updatedAt || 'N/A'}\n`;
    userInfo += `┃ 🔗 𝑷𝒓𝒐𝒇𝒊𝒍𝒆 𝑳𝒊𝒏𝒌: ${data.profileUrl || `https://github.com/${data.username}`}\n`;
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
    
    let errorMsg = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝙶𝚒𝚝𝙷𝚞𝚋 𝚍𝚊𝚝𝚊';
    
    if (e.message === 'User not found') {
        errorMsg = '❌ 𝚄𝚜𝚎𝚛 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍';
    } else if (e.response?.status === 429) {
        errorMsg = '❌ 𝚁𝚊𝚝𝚎 𝚕𝚒𝚖𝚒𝚝𝚎𝚍 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛';
    } else if (e.response?.status === 404) {
        errorMsg = '❌ 𝚐𝚒𝚝𝙷𝚞𝚋 𝚞𝚜𝚎𝚛 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍';
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
