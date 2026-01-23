const { cmd } = require('../command');
const axios = require('axios');
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

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json'
	}
};

async function downloadTikTok(url) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/tiktok?url=${encodeURIComponent(url)}`;
	const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
	
	if (res?.data?.status && res?.data?.result) {
		return {
			video: res.data.result.video || res.data.result.download || res.data.result.url,
			title: res.data.result.title || res.data.result.description || 'TikTok Video',
			author: res.data.result.author || res.data.result.creator || 'Unknown',
			thumbnail: res.data.result.thumbnail || res.data.result.cover,
			duration: res.data.result.duration || '0:00'
		};
	}
	throw new Error('Failed to download TikTok video');
}

async function downloadVideo(videoUrl) {
	try {
		const videoResponse = await axios.get(videoUrl, {
			responseType: 'arraybuffer',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			decompress: true,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*'
			}
		});
		return Buffer.from(videoResponse.data);
	} catch (e1) {
		const videoResponse = await axios.get(videoUrl, {
			responseType: 'stream',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*'
			}
		});
		const chunks = [];
		await new Promise((resolve, reject) => {
			videoResponse.data.on('data', c => chunks.push(c));
			videoResponse.data.on('end', resolve);
			videoResponse.data.on('error', reject);
		});
		return Buffer.concat(chunks);
	}
}

function isValidTikTokUrl(url) {
	return /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/.test(url);
}

// TikTok Download Command
cmd({
	pattern: 'tiktok',
	alias: ['tiktokdl', 'tt', 'ttvideo', 'ttdl', 'silatiktok', 'tikdl'],
	react: '🎵',
	desc: 'Download TikTok videos',
	category: 'downloader',
	filename: __filename
},
async (conn, mek, m, { from, sender, reply, q, l }) => {
	try {
		if (!q) {
			return reply(`┏━❑ SILA-MD TIKTOK DOWNLOADER ━━━━━━━━━
┃ 🎵 Download TikTok Videos
┃
┃ Usage: .tiktok URL of video
┃
┃ Aliases:
┃ • .tt
┃ • .ttdl
┃ • .tikdl
┃ • .tiktokdl
┃
┃ Examples:
┃ • .tiktok https://vt.tiktok.com/...
┃ • .tt https://www.tiktok.com/...
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		}

		// Check if valid TikTok URL
		if (!isValidTikTokUrl(q)) {
			return reply(`❌ Please provide a valid TikTok URL\n\nExample: vm.tiktok.com or vt.tiktok.com`, { quoted: fakevCard });
		}

		// Show download progress
		const progressMsg = await conn.sendMessage(from, {
			text: `⏳ Fetching TikTok video...\n🔍 Downloading video content...`
		}, { quoted: mek });

		try {
			// Download from Yupra API
			const tikData = await downloadTikTok(q.trim());

			if (!tikData.video) {
				await conn.sendMessage(from, { delete: progressMsg.key });
				return reply(`❌ Could not find video URL`, { quoted: fakevCard });
			}

			// Download video buffer
			const videoBuffer = await downloadVideo(tikData.video);

			if (!videoBuffer || videoBuffer.length === 0) {
				await conn.sendMessage(from, { delete: progressMsg.key });
				return reply(`❌ Failed to download video`, { quoted: fakevCard });
			}

			// Delete progress message
			await conn.sendMessage(from, { delete: progressMsg.key });

			// Send video
			await conn.sendMessage(from, {
				video: videoBuffer,
				mimetype: 'video/mp4',
				fileName: `${(tikData.title || 'tiktok_video').substring(0, 30)}.mp4`,
				caption: `🎵 *${tikData.title}*\n👤 ${tikData.author}\n⏱ ${tikData.duration}\n\n© Powered by Sila Tech`,
				contextInfo: getContextInfo(sender)
			}, { quoted: fakevCard });

			// Cleanup
			try {
				const tempDir = path.join(__dirname, '../temp');
				if (fs.existsSync(tempDir)) {
					const files = fs.readdirSync(tempDir);
					const now = Date.now();
					files.forEach(file => {
						const filePath = path.join(tempDir, file);
						try {
							const stats = fs.statSync(filePath);
							if (now - stats.mtimeMs > 10000) {
								if (file.endsWith('.mp4') || file.endsWith('.mkv')) {
									fs.unlinkSync(filePath);
								}
							}
						} catch (e) {
							// Ignore
						}
					});
				}
			} catch (cleanupErr) {
				// Ignore cleanup errors
			}

		} catch (downloadErr) {
			console.error('Download error:', downloadErr);
			await conn.sendMessage(from, { delete: progressMsg.key });
			reply(`┏━❑ DOWNLOAD ERROR ━━━━━━━━━
┃ ❌ Failed to download video
┃ Please try again later
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		}

	} catch (err) {
		console.error('TikTok command error:', err);
		reply(`┏━❑ TIKTOK DOWNLOADER ERROR ━━━━━━━
┃ ❌ An error occurred
┃ Please try again
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		if (l) l(err);
	}
});