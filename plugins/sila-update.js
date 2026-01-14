// plugins/update.js
const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

cmd({
  pattern: "update",
  alias: ["updatenow", "sync"],
  use: ".update",
  desc: "Update the bot to the latest version.",
  category: "system",
  react: "🔄",
  filename: __filename
},
async (conn, mek, m, { from, quoted, q, react, reply, setCommitHash, getCommitHash }) => {
  try {
    // Send initial message
    await reply("🔍 𝙲𝚑𝚎𝚌𝚔𝚒𝚗𝚐 𝚏𝚘𝚛 𝚞𝚙𝚍𝚊𝚝𝚎𝚜...");

    // repo settings
    const repoOwner = "dullmd";
    const repoName = "toto";
    const branch = "main";
    const apiCommitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${branch}`;
    const zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/${branch}.zip`;

    // fetch latest commit info
    const { data: commitData } = await axios.get(apiCommitUrl, { headers: { "User-Agent": "node.js" } });
    const latestCommitHash = commitData.sha;

    // fallback commit storage
    const commitFile = path.join(process.cwd(), ".last_update_commit");

    const fallbackGet = async () => {
      try {
        if (fs.existsSync(commitFile)) return fs.readFileSync(commitFile, "utf8").trim();
      } catch (e) { /* ignore */ }
      return null;
    };
    const fallbackSet = async (h) => {
      try { fs.writeFileSync(commitFile, String(h), "utf8"); } catch (e) { console.error("Could not save commit hash:", e); }
    };

    const readCurrent = (typeof getCommitHash === "function") ? await getCommitHash() : await fallbackGet();

    if (readCurrent && readCurrent === latestCommitHash) {
      return reply("✅ 𝙱𝚘𝚝 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚘𝚗 𝚝𝚑𝚎 𝚕𝚊𝚝𝚎𝚜𝚝 𝚟𝚎𝚛𝚜𝚒𝚘𝚗!");
    }

    // Display commit info
    const authorName = "sila";
    const authorEmail = "silatrix22@gmail.com";
    const commitDate = new Date(commitData.commit.author.date).toLocaleString();
    const commitMessage = commitData.commit.message || "";

    await reply(
`🔄 𝚄𝚙𝚍𝚊𝚝𝚒𝚗𝚐 𝚋𝚘𝚝...

*𝙲𝚘𝚖𝚖𝚒𝚝 𝙳𝚎𝚝𝚊𝚒𝚕𝚜:*
👤 ${authorName} (${authorEmail})
📅 ${commitDate}
💬 ${commitMessage}`);

    // download ZIP to temp
    const zipPath = path.join(__dirname, "..", `${repoName}-${branch}.zip`);
    const tmpExtract = path.join(__dirname, "..", "latest_update_tmp");

    const zipRes = await axios.get(zipUrl, { responseType: "arraybuffer", headers: { "User-Agent": "node.js" } });
    fs.writeFileSync(zipPath, zipRes.data);

    // extract
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tmpExtract, true);

    // source folder inside extracted zip
    const sourcePath = path.join(tmpExtract, `${repoName}-${branch}`);
    const destinationPath = path.join(process.cwd());

    // copy while skipping sensitive/local files
    copyFolderSync(sourcePath, destinationPath, [
      "config.js",
      "config.env",
      "app.json",
      ".env",
      "session.data.json",
      "session.json",
      "session",
      "storage.json",
      "node_modules",
    ]);

    // persist commit hash
    if (typeof setCommitHash === "function") {
      try { await setCommitHash(latestCommitHash); } catch (e) { console.error("setCommitHash error:", e); }
    } else {
      await fallbackSet(latestCommitHash);
    }

    // cleanup
    try { fs.unlinkSync(zipPath); } catch (e) {}
    try { fs.rmSync(tmpExtract, { recursive: true, force: true }); } catch (e) {}

    await reply("✅ 𝚄𝚙𝚍𝚊𝚝𝚎 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚎! 𝙱𝚘𝚝 𝚠𝚒𝚕𝚕 𝚛𝚎𝚜𝚝𝚊𝚛𝚝 𝚜𝚘𝚘𝚗...");

    // restart after delay
    setTimeout(() => {
      try { process.exit(0); } catch (e) { /* ignore */ }
    }, 1500);

  } catch (error) {
    console.error("Update error:", error);
    reply("❌ 𝚄𝚙𝚍𝚊𝚝𝚎 𝙵𝚊𝚒𝚕𝚎𝚍. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚍𝚎𝚙𝚕𝚘𝚢 𝚖𝚊𝚗𝚞𝚊𝚕𝚕𝚢.");
  }
});

// copy helper
function copyFolderSync(source, target, skipList = []) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  for (const item of fs.readdirSync(source)) {
    if (skipList.includes(item)) {
      console.log(`Skipping ${item} (preserve local).`);
      continue;
    }

    const src = path.join(source, item);
    const dest = path.join(target, item);
    const stat = fs.lstatSync(src);

    if (stat.isDirectory()) {
      copyFolderSync(src, dest, skipList);
    } else {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
}
