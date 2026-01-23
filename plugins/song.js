const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
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

async function getYupraDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.success && res?.data?.data?.download_url) {
		return {
			download: res.data.data.download_url,
			title: res.data.data.title,
			thumbnail: res.data.data.thumbnail
		};
	}
	throw new Error('Yupra returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.dl) {
		return {
			download: res.data.dl,
			title: res.data.title,
			thumbnail: res.data.thumb
		};
	}
	throw new Error('Okatsu ytmp3 returned no download');
}

cmd({
	pattern: 'song',
	alias: ['silaplay', 'music', 'mp3'],
	react: '🎵',
	desc: 'Download songs from YouTube',
	category: 'downloader',
	filename: __filename
}, async (conn, mek, m, { from, sender, reply, q }) => {
	try {
		if (!q) {
			return reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ━━━━━━━━━
┃ 🎵 𝚂𝚎𝚊𝚛𝚌𝚑 𝚊 𝚜𝚘𝚗𝚐 𝚏𝚘𝚛 𝚖𝚎
┃
┃ 𝚃𝚢𝚙𝚎: .𝚜𝚘𝚗𝚐 𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎
┃
┃ 𝙴𝚡𝚊𝚖𝚙𝚕𝚎:
┃ .𝚜𝚘𝚗𝚐 𝙰𝚖𝚒𝚗𝙰𝚣𝚎𝚛
┗━━━━━━━━━━━━━━━━━━━━`);
		}

		let video;
		if (q.includes('youtube.com') || q.includes('youtu.be')) {
			video = { url: q };
		} else {
			const search = await yts(q);
			if (!search || !search.videos.length) {
				return reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝚂𝙾𝙽𝙶 𝚂𝙴𝙰𝚁𝙲𝙷 ━━━━━━━━━
┃ ❌ 𝙽𝚘 𝚊𝚞𝚍𝚒𝚘 𝚏𝚘𝚞𝚗𝚍
┃ 😭 𝚃𝚛𝚢 𝚊𝚗𝚘𝚝𝚑𝚎𝚛 𝚗𝚊𝚖𝚎
┗━━━━━━━━━━━━━━━━━━━━`);
			}
			video = search.videos[0];
		}

		// Downloading message
		const downloadMsg = await conn.sendMessage(from, {
			image: { url: video.thumbnail },
			caption: `🎵 *${video.title}*\n⏱ ${video.timestamp}\n\n𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐...`
		}, { quoted: mek });

		// Try Yupra primary, then Okatsu fallback
		let audioData;
		try {
			audioData = await getYupraDownloadByUrl(video.url);
		} catch (e1) {
			audioData = await getOkatsuDownloadByUrl(video.url);
		}

		const audioUrl = audioData.download || audioData.dl || audioData.url;

		// Download audio to buffer
		let audioBuffer;
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
			audioBuffer = Buffer.from(audioResponse.data);
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
			audioBuffer = Buffer.concat(chunks);
		}

		// Validate buffer
		if (!audioBuffer || audioBuffer.length === 0) {
			throw new Error('Downloaded audio buffer is empty');
		}

		// Detect file format
		const firstBytes = audioBuffer.slice(0, 12);
		const hexSignature = firstBytes.toString('hex');
		const asciiSignature = firstBytes.toString('ascii', 4, 8);

		let actualMimetype = 'audio/mpeg';
		let fileExtension = 'mp3';
		let detectedFormat = 'unknown';

		if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
			const ftypBox = audioBuffer.slice(4, 8).toString('ascii');
			if (ftypBox === 'ftyp') {
				detectedFormat = 'M4A/MP4';
				actualMimetype = 'audio/mp4';
				fileExtension = 'm4a';
			}
		}
		else if (audioBuffer.toString('ascii', 0, 3) === 'ID3' || 
		         (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)) {
			detectedFormat = 'MP3';
			actualMimetype = 'audio/mpeg';
			fileExtension = 'mp3';
		}
		else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') {
			detectedFormat = 'OGG/Opus';
			actualMimetype = 'audio/ogg; codecs=opus';
			fileExtension = 'ogg';
		}
		else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') {
			detectedFormat = 'WAV';
			actualMimetype = 'audio/wav';
			fileExtension = 'wav';
		}
		else {
			actualMimetype = 'audio/mp4';
			fileExtension = 'm4a';
			detectedFormat = 'Unknown (defaulting to M4A)';
		}

		// Convert to MP3 if needed
		let finalBuffer = audioBuffer;
		let finalMimetype = 'audio/mpeg';
		let finalExtension = 'mp3';

		if (fileExtension !== 'mp3') {
			try {
				finalBuffer = await toAudio(audioBuffer, fileExtension);
				if (!finalBuffer || finalBuffer.length === 0) {
					throw new Error('Conversion returned empty buffer');
				}
				finalMimetype = 'audio/mpeg';
				finalExtension = 'mp3';
			} catch (convErr) {
				throw new Error(`Failed to convert ${detectedFormat} to MP3: ${convErr.message}`);
			}
		}

		// Send audio
		await conn.sendMessage(from, {
			audio: finalBuffer,
			mimetype: finalMimetype,
			fileName: `${(audioData.title || video.title || 'song')}.${finalExtension}`,
			ptt: false
		}, { quoted: mek });

		// Cleanup temp files
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
							if (file.endsWith('.mp3') || file.endsWith('.m4a') || /^\d+\.(mp3|m4a)$/.test(file)) {
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

	} catch (err) {
		console.error('Song error:', err);
		reply(`┏━❑ 𝐒𝙸𝙻𝐀-𝐌𝐃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙴𝚁𝚁𝙾𝚁 ━━━━━━━━━
┃ ❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛
┗━━━━━━━━━━━━━━━━━━━━`);
	}
});
