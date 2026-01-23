const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { toAudio } = require('../lib/converter');

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json, text/plain, */*'
	}
};

async function tryRequest(getter, attempts = 3) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await getter();
		} catch (err) {
			lastError = err;
			if (attempt < attempts) {
				await new Promise(r => setTimeout(r, 1000 * attempt));
			}
		}
	}
	throw lastError;
}

async function searchYouTubeYupra(query) {
	const apiUrl = `https://api.yupra.my.id/api/search/youtube?q=${encodeURIComponent(query)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.status && res?.data?.results?.length > 0) {
		return res.data.results;
	}
	throw new Error('No search results found');
}

async function getYupraDownload(youtubeUrl) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.success && res?.data?.data?.download_url) {
		return {
			download: res.data.data.download_url,
			title: res.data.data.title,
			thumbnail: res.data.data.thumbnail
		};
	}
	throw new Error('Download failed');
}

async function downloadAudio(audioUrl) {
	try {
		const audioResponse = await axios.get(audioUrl, {
			responseType: 'arraybuffer',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			decompress: true,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*',
				'Accept-Encoding': 'identity'
			}
		});
		return Buffer.from(audioResponse.data);
	} catch (e1) {
		const audioResponse = await axios.get(audioUrl, {
			responseType: 'stream',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*',
				'Accept-Encoding': 'identity'
			}
		});
		const chunks = [];
		await new Promise((resolve, reject) => {
			audioResponse.data.on('data', c => chunks.push(c));
			audioResponse.data.on('end', resolve);
			audioResponse.data.on('error', reject);
		});
		return Buffer.concat(chunks);
	}
}

function detectAudioFormat(buffer) {
	const firstBytes = buffer.slice(0, 12);
	const hexSignature = firstBytes.toString('hex');
	const asciiSignature = firstBytes.toString('ascii', 4, 8);

	let mimeType = 'audio/mpeg';
	let extension = 'mp3';
	let format = 'MP3';

	if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
		format = 'M4A/MP4';
		mimeType = 'audio/mp4';
		extension = 'm4a';
	}
	else if (buffer.toString('ascii', 0, 3) === 'ID3' || 
	         (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
		format = 'MP3';
		mimeType = 'audio/mpeg';
		extension = 'mp3';
	}
	else if (buffer.toString('ascii', 0, 4) === 'OggS') {
		format = 'OGG/Opus';
		mimeType = 'audio/ogg; codecs=opus';
		extension = 'ogg';
	}
	else if (buffer.toString('ascii', 0, 4) === 'RIFF') {
		format = 'WAV';
		mimeType = 'audio/wav';
		extension = 'wav';
	}

	return { mimeType, extension, format };
}

// Play command
cmd({
	pattern: 'play',
	alias: ['silaplay', 'music', 'mp3', 'musica', 'lagu', 'song', 'audio'],
	react: '🎵',
	desc: 'Search and play songs from YouTube',
	category: 'downloader',
	filename: __filename
}, async (conn, mek, m, { from, sender, reply, q }) => {
	try {
		if (!q) {
			return reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚖𝚞𝚜𝚒𝚌 𝚙𝚕𝚊𝚢𝚎𝚛 ━━━━━━━━━
┃ 🎵 𝚂𝚎𝚊𝚛𝚌𝚑 & 𝚙𝚕𝚊𝚢 𝚖𝚞𝚜𝚒𝚌 𝚏𝚛𝚘𝚖 𝚈𝚘𝚞𝚃𝚞𝚋𝚎
┃
┃ 𝚄𝚜𝚎: .𝚙𝚕𝚊𝚢 𝚜𝚘𝚗𝚐_𝚗𝚊𝚖𝚎
┃
┃ 𝙴𝚡𝚊𝚖𝚙𝚕𝚎𝚜:
┃ • .𝚙𝚕𝚊𝚢 𝙰𝚖𝚒𝚗𝙰𝚉𝚎𝚛𝚊
┃ • .𝚖𝚞𝚜𝚒𝚌 𝚋𝚕𝚒𝚗𝚍𝚒𝚗𝚐 𝚕𝚒𝚐𝚑𝚝𝚜
┃ • .𝚖𝚞𝚜𝚒𝚌𝚊 𝙰𝚕𝚊𝚗 𝚆𝚊𝚕𝚔𝚎𝚛 𝚏𝚊𝚍𝚎𝚍
┗━━━━━━━━━━━━━━━━━━━━`);
		}

		// Show search progress
		const searchMsg = await conn.sendMessage(from, {
			text: `🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚏𝚘𝚛 *${q}*...`
		}, { quoted: mek });

		// Search YouTube
		let results;
		try {
			results = await searchYouTubeYupra(q);
		} catch (searchErr) {
			await conn.sendMessage(from, { delete: searchMsg.key });
			return reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚜𝚎𝚊𝚛𝚌𝚑 𝚎𝚛𝚛𝚘𝚛 ━━━━━━━━━
┃ ❌ 𝙽𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚜 𝚏𝚘𝚞𝚗𝚍
┃ 𝚃𝚛𝚢 𝚖𝚘𝚛𝚎 𝚜𝚙𝚎𝚌𝚒𝚏𝚒𝚌 𝚔𝚎𝚢𝚠𝚘𝚛𝚍𝚜
┗━━━━━━━━━━━━━━━━━━━━`);
		}

		if (!results || results.length === 0) {
			await conn.sendMessage(from, { delete: searchMsg.key });
			return reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚜𝚎𝚊𝚛𝚌𝚑 ━━━━━━━━━
┃ ❌ 𝙽𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚜 𝚏𝚘𝚞𝚗𝚍
┗━━━━━━━━━━━━━━━━━━━━`);
		}

		// Use first result
		const video = results[0];

		// Build results list
		let resultsList = `┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚈𝚞𝚝𝚞𝚋𝚎 𝚂𝙴𝙰𝚁𝙲𝙷 ━━━━━━\n┃\n`;
		results.slice(0, 5).forEach((r, i) => {
			resultsList += `┃ 𝟷${i + 1} • ${r.title.substring(0, 40)}\n┃    ⏱ ${r.duration} • 👁 ${r.views}\n┃\n`;
		});
		resultsList += `┗━━━━━━━━━━━━━━━━━━━━━\n\n🎵 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝟷𝚘𝚙 𝚛𝚎𝚜𝚞𝚕𝚝...`;

		await conn.sendMessage(from, {
			text: resultsList,
			contextInfo: {
				mentionedJid: [sender],
				externalAdReply: {
					title: video.title,
					body: video.channel,
					mediaType: 'IMAGE',
					renderLargerThumbnail: true,
					thumbnail: video.thumbnail
				}
			}
		}, { quoted: mek });

		// Download audio
		try {
			const audioData = await getYupraDownload(video.url);
			
			// Download to buffer
			const audioBuffer = await downloadAudio(audioData.download);

			if (!audioBuffer || audioBuffer.length === 0) {
				throw new Error('Downloaded buffer is empty');
			}

			// Detect format
			const { mimeType, extension, format } = detectAudioFormat(audioBuffer);

			// Convert to MP3 if needed
			let finalBuffer = audioBuffer;
			let finalMimeType = 'audio/mpeg';
			let finalExtension = 'mp3';

			if (extension !== 'mp3') {
				try {
					finalBuffer = await toAudio(audioBuffer, extension);
					if (!finalBuffer || finalBuffer.length === 0) {
						throw new Error('Conversion returned empty');
					}
					finalMimeType = 'audio/mpeg';
					finalExtension = 'mp3';
				} catch (convErr) {
					finalBuffer = audioBuffer;
					finalMimeType = mimeType;
					finalExtension = extension;
				}
			}

			// Send audio
			await conn.sendMessage(from, {
				audio: finalBuffer,
				mimetype: finalMimeType,
				fileName: `${(audioData.title || video.title || 'song')}.${finalExtension}`,
				ptt: false,
				contextInfo: {
					externalAdReply: {
						title: audioData.title || video.title,
						body: video.channel,
						mediaType: 'IMAGE',
						thumbnail: audioData.thumbnail || video.thumbnail
					}
				}
			}, { quoted: mek });

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
								if (file.endsWith('.mp3') || file.endsWith('.m4a')) {
									fs.unlinkSync(filePath);
								}
							}
						} catch (e) {
							// Ignore
						}
					});
				}
			} catch (cleanupErr) {
				// Ignore
			}

		} catch (downloadErr) {
			console.error('Download error:', downloadErr);
			reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚎𝚛𝚛𝚘𝚛 ━━━━━━━━━
┃ ❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍
┃ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗
┗━━━━━━━━━━━━━━━━━━━━`);
		}

	} catch (err) {
		console.error('Play command error:', err);
		reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚖𝚞𝚜𝚒𝚌 𝚎𝚛𝚛𝚘𝚛 ━━━━━━━━━
┃ ❌ 𝚂𝚘𝚖𝚎𝚝𝚑𝚒𝚗𝚐 𝚠𝚎𝚗𝚝 𝚠𝚛𝚘𝚗𝚐
┃ 𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛
┗━━━━━━━━━━━━━━━━━━━━`);
	}
});