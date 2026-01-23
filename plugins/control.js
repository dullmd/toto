const { cmd } = require('../command');
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

const getContextInfo = (sender) => ({
    mentionedJid: [sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402325089913@newsletter',
        newsletterName: '© 𝐒𝐈𝐋𝐀 𝐌𝐃',
        serverMessageId: 143,
    },
});

const CREATOR = '255789661031@s.whatsapp.net';
const OWNERS_FILE = path.join(__dirname, '../data', 'owners.json');
const CONFIG_ENV = path.join(__dirname, '../config.env');

const getOwners = () => {
    try {
        return fs.existsSync(OWNERS_FILE) ? JSON.parse(fs.readFileSync(OWNERS_FILE, 'utf-8')) : [CREATOR];
    } catch (e) {
        console.error('Error reading owners:', e);
        return [CREATOR];
    }
};

const isOwner = (jid) => getOwners().includes(jid);

const getConfig = (key) => {
    try {
        if (fs.existsSync(CONFIG_ENV)) {
            const content = fs.readFileSync(CONFIG_ENV, 'utf-8');
            const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
            return match ? match[1] : null;
        }
    } catch (e) {
        console.error('Error reading config:', e);
    }
    return null;
};

const setConfig = (key, value) => {
    try {
        let content = '';
        if (fs.existsSync(CONFIG_ENV)) {
            content = fs.readFileSync(CONFIG_ENV, 'utf-8');
            const regex = new RegExp(`^${key}=.*$`, 'm');
            content = regex.test(content) ? content.replace(regex, `${key}=${value}`) : content + `\n${key}=${value}`;
        } else {
            content = `${key}=${value}`;
        }
        fs.writeFileSync(CONFIG_ENV, content);
        return true;
    } catch (e) {
        console.error('Error writing config:', e);
        return false;
    }
};

const toggleConfig = (key) => {
    const current = (getConfig(key) || 'false').toLowerCase();
    const newValue = current === 'true' ? 'false' : 'true';
    return setConfig(key, newValue) ? newValue : null;
};

const FEATURES = {
    'auto_typing': 'AUTO_TYPING',
    'auto_reply': 'AUTO_REPLY',
    'auto_react': 'AUTO_REACT',
    'read_message': 'READ_MESSAGE',
    'always_online': 'ALWAYS_ONLINE',
    'anti_call': 'ANTI_CALL',
    'anti_delete': 'ANTI_DELETE',
    'anti_bad': 'ANTI_BAD',
    'auto_status_seen': 'AUTO_STATUS_SEEN',
    'auto_sticker': 'AUTO_STICKER',
    'auto_recording': 'AUTO_RECORDING',
    'welcome': 'WELCOME',
    'admin_events': 'ADMIN_EVENTS'
};

cmd({
    pattern: "settings",
    alias: ["control", "silacontrol", "feature", "toggle", "config"],
    react: "⚙️",
    desc: "Bot settings - toggle features on/off",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, l, q, sender }) => {
    try {
        if (!isOwner(sender)) {
            return await conn.sendMessage(from, {
                text: `❌ 𝙾𝚗𝚕𝚢 𝚋𝚘𝚝 𝚘𝚠𝚗𝚎𝚛𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚝𝚑𝚒𝚜\n\n© Powered by Sila Tech`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }

        if (!q || !q.trim()) {
            let list = `┏━━━ 𝐁𝐎𝐓 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 ━━━━\n`;
            list += `┃ ⚙️ 𝑨𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆 𝑭𝒆𝒂𝒕𝒖𝒓𝒆𝒔:\n┃\n`;
            
            for (const [name, key] of Object.entries(FEATURES)) {
                const status = (getConfig(key) || 'false').toLowerCase() === 'true' ? '✅' : '❌';
                list += `┃ ${status} ${name}\n`;
            }
            
            list += `┃\n┣━━━━━━━━━━━━━━━━━━━━\n`;
            list += `┃ 📝 𝑻𝒐 𝒕𝒐𝒈𝒈𝒍𝒆:\n`;
            list += `┃ .𝒔𝒆𝒕𝒕𝒊𝒏𝒈𝒔 𝒇𝒆𝒂𝒕𝒖𝒓𝒆_𝒏𝒂𝒎𝒆\n`;
            list += `┃\n┃ 𝑬𝒙𝒂𝒎𝒑𝒍𝒆:\n`;
            list += `┃ .𝒔𝒆𝒕𝒕𝒊𝒏𝒈𝒔 𝒂𝒖𝒕𝒐_𝒓𝒆𝒑𝒍𝒚\n`;
            list += `┗━━━━━━━━━━━━━━━━━━━━`;

            return await conn.sendMessage(from, {
                text: list,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }

        const feature = q.trim().toLowerCase();
        const configKey = FEATURES[feature];

        if (!configKey) {
            let suggestions = `❌ 𝑭𝒆𝒂𝒕𝒖𝒓𝒆 '${feature}' 𝒏𝒐𝒕 𝒇𝒐𝒖𝒏𝒅\n\n`;
            suggestions += `𝑨𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆 𝒇𝒆𝒂𝒕𝒖𝒓𝒆𝒔:\n`;
            for (const name of Object.keys(FEATURES)) {
                suggestions += `• ${name}\n`;
            }
            suggestions += `\n© Powered by Sila Tech`;

            return await conn.sendMessage(from, {
                text: suggestions,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }

        const newStatus = toggleConfig(configKey);
        if (newStatus) {
            const statusText = newStatus === 'true' ? '✅ ENABLED' : '❌ DISABLED';
            const icon = newStatus === 'true' ? '🟢' : '🔴';
            
            await conn.sendMessage(from, {
                text: `┏━━━ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 ━━━\n┃\n┃ ${icon} 𝑭𝒆𝒂𝒕𝒖𝒓𝒆:\n┃ 📌 ${feature.toUpperCase()}\n┃\n┃ 𝑺𝒕𝒂𝒕𝒖𝒔:\n┃ ${statusText}\n┃\n┗━━━━━━━━━━━━━━━━━━━━\n\n© Powered by Sila Tech`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        } else {
            await conn.sendMessage(from, {
                text: `❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚞𝚙𝚍𝚊𝚝𝚎 𝚜𝚎𝚝𝚝𝚒𝚗𝚐\n\n© Powered by Sila Tech`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }
    } catch (e) {
        console.error('Settings command error:', e);
        try {
            await conn.sendMessage(from, {
                text: `❌ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝚎𝚛𝚛𝚘𝚛: ${e.message}\n\n© Powered by Sila Tech`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        } catch (sendErr) {
            console.error('Failed to send error message:', sendErr);
        }
        if (l) l(e);
    }
});
