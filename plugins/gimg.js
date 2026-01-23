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
    pattern: "gimg",
    alias: ["gsearch", "googleimg", "gimages"],
    react: "🖼️",
    desc: "Search images using Google Images",
    category: "tools",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚜𝚎𝚊𝚛𝚌𝚑 𝚚𝚞𝚎𝚛𝚢\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚐𝚒𝚖𝚐 𝚍𝚘𝚐𝚜`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call Google Image Search API
    const response = await axios.get(`https://api.siputzx.my.id/api/images?query=${encodeURIComponent(q.trim())}`, {
        timeout: 30000
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    const images = Array.isArray(response.data) ? response.data : response.data.images || response.data.results || response.data.data || [];
    
    if (images.length === 0) {
        throw new Error('No images found');
    }

    await conn.sendPresenceUpdate('paused', from);

    // Send info message
    const infoMsg = `🖼️ 𝑭𝒐𝒖𝒏𝒅 ${images.length} 𝒊𝒎𝒂𝒈𝒆𝒔 𝒇𝒐𝒓: "${q.trim()}"\n\n𝑺𝒆𝒏𝒅𝒊𝒏𝒈 𝒇𝒊𝒓𝒔𝒕 5 𝒊𝒎𝒂𝒈𝒆𝒔...`;
    
    await conn.sendMessage(from, {
        text: infoMsg,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });

    // Send up to 5 images
    const imagesToSend = images.slice(0, 5);
    
    for (let i = 0; i < imagesToSend.length; i++) {
        const image = imagesToSend[i];
        
        if (!image) continue;

        const imageUrl = typeof image === 'string' ? image : (image.url || image.image || image.src);
        
        if (!imageUrl) continue;

        try {
            let dimensions = '';
            if (typeof image === 'object' && (image.width || image.height)) {
                dimensions = `\n📐 ${image.width || '?'} x ${image.height || '?'}`;
            }

            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: `📷 𝑰𝒎𝒂𝒈𝒆 ${i + 1}/${imagesToSend.length}${dimensions}\n\n🔗 ${imageUrl}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            
            // Small delay between images
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (imgError) {
            // Continue to next image if this one fails
            console.error(`Failed to send image ${i + 1}:`, imgError.message);
        }
    }

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ 𝙴𝚛𝚛𝚘𝚛 𝚜𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚒𝚖𝚊𝚐𝚎𝚜';
    
    if (e.message === 'No images found') {
        errorMsg = '❌ 𝙽𝚘 𝚒𝚖𝚊𝚐𝚎𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚚𝚞𝚎𝚛𝚢';
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
