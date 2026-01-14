const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402325089913@newsletter',
            newsletterName: ' 𝐒𝐈𝐋𝐀-𝐌𝐃',
            serverMessageId: 143,
        },
    };
};

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const groupMembersCount = metadata.participants.length;

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleTimeString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = 
`┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ━━━━━━━━━
┃ 👋 @${userName}
┃ 🎉 Member #${groupMembersCount}
┃ ⏰ ${timestamp}
┗━━━━━━━━━━━━━━━━━━━━

*𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚕𝚊-𝙼𝙳*`;

                await conn.sendMessage(update.id, {
                    text: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = 
`┏━❑ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━━━
┃ 👋 @${userName}
┃ 😔 Left the group
┃ ⏰ ${timestamp}
┗━━━━━━━━━━━━━━━━━━━━

*𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚕𝚊-𝙼𝙳*`;

                await conn.sendMessage(update.id, {
                    text: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `┏━❑ 𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐌𝐎𝐓𝐄 ━━━
┃ 🔻 @${userName}
┃ 👤 By @${demoter}
┃ ⏰ ${timestamp}
┗━━━━━━━━━━━━━━━━━━━━`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `┏━❑ 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐎𝐌𝐎𝐓𝐄 ━━━
┃ 🔼 @${userName}
┃ 👤 By @${promoter}
┃ ⏰ ${timestamp}
┗━━━━━━━━━━━━━━━━━━━━`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
