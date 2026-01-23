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

const getContextInfo = (sender) => {
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402325089913@newsletter',
            newsletterName: '© 𝐒𝐈𝐋𝐀 𝐌𝐃',
            serverMessageId: 143,
        },
    };
};

// Global config for chatbot
const chatbotConfig = {};
let chatbotState = {
    enabled: false,
    mode: 'both' // 'group', 'inbox', 'both'
};

// Cooldown for API calls (avoid rate limiting)
const userCooldown = new Map();
const COOLDOWN_MS = 2000; // 2 seconds between responses per user

async function askAI(text) {
    try {
        const response = await axios.get(
            `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(text)}`,
            { timeout: 30000 }
        );
        
        if (!response.data) {
            throw new Error('No response from API');
        }

        let aiResponse = response.data.response || response.data.result || response.data.data || response.data.message;
        
        if (!aiResponse) {
            return null;
        }

        // Truncate if too long
        if (aiResponse.length > 2048) {
            aiResponse = aiResponse.substring(0, 2045) + '...';
        }

        return aiResponse;
    } catch (err) {
        console.error('AI API Error:', err.message);
        return null;
    }
}

function shouldRespond(isGroup) {
    const { enabled, mode } = chatbotState;
    
    if (!enabled) return false;
    
    if (mode === 'group' && !isGroup) return false;
    if (mode === 'inbox' && isGroup) return false;
    
    return true;
}

function checkCooldown(sender) {
    const now = Date.now();
    const lastCall = userCooldown.get(sender) || 0;
    
    if (now - lastCall < COOLDOWN_MS) {
        return false;
    }
    
    userCooldown.set(sender, now);
    return true;
}

// Auto text handler for chatbot
cmd({
    on: 'text'
},
async (conn, mek, m, { from, sender, reply, body, isGroup, isBot, isCmd }) => {
    try {
        // Don't respond to bot messages or commands
        if (isBot || isCmd || body.startsWith('.')) {
            return;
        }

        // Check if chatbot should respond
        if (!shouldRespond(isGroup)) {
            return;
        }

        // Check cooldown to avoid API rate limiting
        if (!checkCooldown(sender)) {
            return;
        }

        // Don't respond to very short messages
        if (body.length < 3) {
            return;
        }

        // Skip bot's own messages
        if (mek.fromMe) {
            return;
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);

        // Get AI response
        const aiReply = await askAI(body);

        await conn.sendPresenceUpdate('paused', from);

        if (aiReply) {
            await conn.sendMessage(from, {
                text: aiReply
            }, { quoted: mek });
        }

    } catch (err) {
        console.error('Chatbot auto-response error:', err);
    }
});

// Chatbot control command
cmd({
    pattern: 'chatbot',
    alias: ['bot', 'ai-chat', 'autochat', 'silachat'],
    react: '💬',
    desc: 'Enable/disable auto-chatbot responses',
    category: 'tools',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, q, l, isOwner }) => {
    try {
        // Owner only
        if (!isOwner) {
            return reply('❌ Owner only command');
        }

        if (!q) {
            const status = chatbotState.enabled ? '✅ Enabled' : '❌ Disabled';
            const modeText = {
                'group': '👥 Groups only',
                'inbox': '💬 Inbox only',
                'both': '🔄 Groups & Inbox'
            };

            return reply(`┏━❑ CHATBOT STATUS ━━━━━━━━━
┃ Status: ${status}
┃ Mode: ${modeText[chatbotState.mode]}
┃
┃ Usage:
┃ • .chatbot on - Enable chatbot
┃ • .chatbot off - Disable chatbot
┃ • .chatbot group - Groups only
┃ • .chatbot inbox - Inbox only
┃ • .chatbot both - Groups & Inbox
┗━━━━━━━━━━━━━━━━━━━━`);
        }

        const action = q.trim().toLowerCase();

        if (action === 'on') {
            chatbotState.enabled = true;
            return reply('✅ Chatbot enabled\n\n' + (chatbotState.mode === 'both' ? 'Mode: Groups & Inbox' : chatbotState.mode === 'group' ? 'Mode: Groups only' : 'Mode: Inbox only'));
        }

        if (action === 'off') {
            chatbotState.enabled = false;
            return reply('❌ Chatbot disabled');
        }

        if (action === 'group') {
            chatbotState.mode = 'group';
            chatbotState.enabled = true;
            return reply('✅ Chatbot enabled for groups only');
        }

        if (action === 'inbox') {
            chatbotState.mode = 'inbox';
            chatbotState.enabled = true;
            return reply('✅ Chatbot enabled for inbox only');
        }

        if (action === 'both') {
            chatbotState.mode = 'both';
            chatbotState.enabled = true;
            return reply('✅ Chatbot enabled for groups & inbox');
        }

        reply('❌ Invalid action\n\nUse: on, off, group, inbox, or both');

    } catch (err) {
        console.error('Chatbot command error:', err);
        reply(`❌ Chatbot error occurred`);
        if (l) l(err);
    }
});