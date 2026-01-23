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

async function downloadInstagram(url) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/Instagram?url=${encodeURIComponent(url)}`;
	const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
	
	if (res?.data?.status && res?.data?.result) {
		const result = res.data.result;
		return {
			media: result.url || result.download || result.media,
			title: result.title || result.caption || 'Instagram Post',
			author: result.author || result.username || 'Unknown',
			thumbnail: result.thumbnail || result.image,
			type: result.type || 'image',
			mediaArray: result.urls || result.media_urls || (result.url ? [result.url] : [])
		};
	}
	throw new Error('Failed to download Instagram media');
}

async function downloadMedia(mediaUrl) {
	try {
		const mediaResponse = await axios.get(mediaUrl, {
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
		return Buffer.from(mediaResponse.data);
	} catch (e1) {
		const mediaResponse = await axios.get(mediaUrl, {
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
			mediaResponse.data.on('data', c => chunks.push(c));
			mediaResponse.data.on('end', resolve);
			mediaResponse.data.on('error', reject);
		});
		return Buffer.concat(chunks);
	}
}

function isValidInstagramUrl(url) {
	return /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)/.test(url);
}

function detectMediaType(buffer) {
	const firstBytes = buffer.slice(0, 12).toString('hex');
	
	// Check for JPEG
	if (firstBytes.startsWith('ffd8ff')) {
		return { type: 'image/jpeg', extension: 'jpg' };
	}
	// Check for PNG
	if (firstBytes.startsWith('89504e47')) {
		return { type: 'image/png', extension: 'png' };
	}
	// Check for GIF
	if (buffer.toString('ascii', 0, 3) === 'GIF') {
		return { type: 'image/gif', extension: 'gif' };
	}
	// Check for MP4/video
	if (buffer.toString('ascii', 4, 8) === 'ftyp') {
		return { type: 'video/mp4', extension: 'mp4' };
	}
	
	// Default to image
	return { type: 'image/jpeg', extension: 'jpg' };
}

// Instagram Download Command
cmd({
	pattern: 'instagram',
	alias: ['ig', 'igdl', 'insta', 'instagram-dl', 'silaig', 'instagdl'],
	react: '📸',
	desc: 'Download Instagram posts and reels',
	category: 'downloader',
	filename: __filename
},
async (conn, mek, m, { from, sender, reply, q, l }) => {
	try {
		if (!q) {
			return reply(`┏━❑ SILA-MD INSTAGRAM DOWNLOADER ━━━━━━━━━
┃ 📸 Download Instagram Posts & Reels
┃
┃ Usage: .instagram URL of post or reel
┃
┃ Aliases:
┃ • .ig
┃ • .igdl
┃ • .insta
┃ • .instagdl
┃
┃ Supported:
┃ • Posts
┃ • Reels
┃ • Carousel (multiple media)
┃
┃ Examples:
┃ • .instagram https://www.instagram.com/p/...
┃ • .ig https://www.instagram.com/reel/...
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		}

		// Check if valid Instagram URL
		if (!isValidInstagramUrl(q)) {
			return reply(`❌ Please provide a valid Instagram URL\n\nExample: instagram.com/p/... or instagram.com/reel/...`, { quoted: fakevCard });
		}

		// Show download progress
		const progressMsg = await conn.sendMessage(from, {
			text: `⏳ Fetching Instagram media...\n🔍 Processing your post...`
		}, { quoted: mek });

		try {
			// Download from Yupra API
			const igData = await downloadInstagram(q.trim());

			if (!igData.media && (!igData.mediaArray || igData.mediaArray.length === 0)) {
				await conn.sendMessage(from, { delete: progressMsg.key });
				return reply(`❌ Could not find media URL`, { quoted: fakevCard });
			}

			const mediaUrls = igData.mediaArray && igData.mediaArray.length > 0 
				? igData.mediaArray 
				: [igData.media];

			// Delete progress message
			await conn.sendMessage(from, { delete: progressMsg.key });

			// Download and send first media (for carousel, send first item)
			const firstMediaUrl = mediaUrls[0];
			const mediaBuffer = await downloadMedia(firstMediaUrl);

			if (!mediaBuffer || mediaBuffer.length === 0) {
				return reply(`❌ Failed to download media`, { quoted: fakevCard });
			}

			// Detect media type
			const { type: mimeType, extension } = detectMediaType(mediaBuffer);
			const isVideo = mimeType.startsWith('video');

			if (isVideo) {
				// Send as video
				await conn.sendMessage(from, {
					video: mediaBuffer,
					mimetype: 'video/mp4',
					fileName: `instagram_reel.mp4`,
					caption: `📸 *${igData.title}*\n👤 ${igData.author}\n\n© Powered by Sila Tech`,
					contextInfo: getContextInfo(sender)
				}, { quoted: fakevCard });
			} else {
				// Send as image
				await conn.sendMessage(from, {
					image: mediaBuffer,
					mimetype: mimeType,
					fileName: `instagram_post.${extension}`,
					caption: `📸 *${igData.title}*\n👤 ${igData.author}\n\n© Powered by Sila Tech`,
					contextInfo: getContextInfo(sender)
				}, { quoted: fakevCard });
			}

			// If carousel with multiple items, send info
			if (mediaUrls.length > 1) {
				await conn.sendMessage(from, {
					text: `📂 This post has ${mediaUrls.length} items\n\nShowing first item only`,
					contextInfo: getContextInfo(sender)
				}, { quoted: fakevCard });
			}

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
								if (file.endsWith('.mp4') || file.endsWith('.jpg') || file.endsWith('.png')) {
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
┃ ❌ Failed to download media
┃ Please try again later
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		}

	} catch (err) {
		console.error('Instagram command error:', err);
		reply(`┏━❑ INSTAGRAM DOWNLOADER ERROR ━━━━━━━
┃ ❌ An error occurred
┃ Please try again
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
		if (l) l(err);
	}
});