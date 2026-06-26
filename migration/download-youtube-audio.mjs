// Downloads mp3 audio from a YouTube channel's playlists, one folder per playlist.
// Only playlists whose title starts with a number from 1 to 66 (followed by any text) are downloaded,
// e.g. "01 - Yaradılış Kitabı", "66 - Vəhy Kitabı".
// Files are named by position in the playlist: 01.mp3, 02.mp3, ... (001.mp3 if the playlist has 100+ videos).
//
// Usage:
//   node download-youtube-audio.mjs [--channel <url>] [--out <dir>] [--test [N]]
//                                    [--sleep-min <sec>] [--sleep-max <sec>]
//                                    [--cookies-from-browser <browser>] [--limit-rate <rate>]
//
// Examples:
//   node download-youtube-audio.mjs --test          # download 3 videos total, across playlists
//   node download-youtube-audio.mjs --test 10       # download 10 videos total
//   node download-youtube-audio.mjs                 # full run, all matching playlists

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_CHANNEL = 'https://www.youtube.com/@KitabShirketi';
const DEFAULT_OUT = path.join(__dirname, 'output', 'audio');

function parseArgs(argv) {
  const opts = {
    channel: DEFAULT_CHANNEL,
    out: DEFAULT_OUT,
    test: false,
    testLimit: 3,
    sleepMin: 4,
    sleepMax: 10,
    cookiesFromBrowser: null,
    cookies: null,
    limitRate: null,
    refreshList: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--channel':
        opts.channel = argv[++i];
        break;
      case '--out':
        opts.out = path.resolve(argv[++i]);
        break;
      case '--test':
        opts.test = true;
        if (argv[i + 1] && /^\d+$/.test(argv[i + 1])) opts.testLimit = parseInt(argv[++i], 10);
        break;
      case '--sleep-min':
        opts.sleepMin = parseInt(argv[++i], 10);
        break;
      case '--sleep-max':
        opts.sleepMax = parseInt(argv[++i], 10);
        break;
      case '--cookies-from-browser':
        opts.cookiesFromBrowser = argv[++i];
        break;
      case '--cookies':
        opts.cookies = path.resolve(argv[++i]);
        break;
      case '--limit-rate':
        opts.limitRate = argv[++i];
        break;
      case '--refresh-list':
        opts.refreshList = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.warn(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node download-youtube-audio.mjs [options]

  --channel <url>               Channel URL (default: ${DEFAULT_CHANNEL})
  --out <dir>                   Output directory (default: migration/output/audio)
  --test [N]                    Test run: download only N videos total (default 3)
  --sleep-min <sec>              Min seconds to sleep between video downloads (default 4)
  --sleep-max <sec>              Max seconds to sleep between video downloads (default 10)
  --cookies-from-browser <name>  Pass-through to yt-dlp, e.g. "chrome" / "firefox"
  --cookies <file>               Pass-through to yt-dlp: path to a cookies.txt file
  --limit-rate <rate>            Pass-through to yt-dlp, e.g. "1M"
  --refresh-list                 Ignore the cached playlist/video list and re-fetch from YouTube
`);
}

function sanitizeFilename(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Matches playlist titles starting with a number 1-66 followed by any text,
// e.g. "01 - Yaradılış Kitabı", "66 - Vəhy Kitabı".
function isNumberedPlaylist(title) {
  const m = title.match(/^(\d{1,2})\D.*\S/);
  if (!m) return false;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= 66;
}

function ytDlpJson(args) {
  const result = spawnSync('yt-dlp', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 256 });
  // yt-dlp can exit non-zero on partial warnings (e.g. some browser cookies failed to
  // decrypt) while still printing valid JSON on stdout, so only fail if stdout doesn't parse.
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`yt-dlp failed (${args.join(' ')}):\n${result.stderr}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSleepMs(min, max) {
  return (min + Math.random() * (max - min)) * 1000;
}

function cookieArgs(opts) {
  const args = [];
  if (opts.cookiesFromBrowser) args.push('--cookies-from-browser', opts.cookiesFromBrowser);
  if (opts.cookies) args.push('--cookies', opts.cookies);
  return args;
}

async function listPlaylists(channelUrl, opts) {
  const channelsJson = ytDlpJson([
    '--flat-playlist',
    '--dump-single-json',
    ...cookieArgs(opts),
    `${channelUrl.replace(/\/$/, '')}/playlists`,
  ]);
  return (channelsJson.entries || [])
    .filter((e) => e.title && isNumberedPlaylist(e.title))
    .map((e) => ({ title: e.title, url: e.url || `https://www.youtube.com/playlist?list=${e.id}` }));
}

function cachePath(opts) {
  return path.join(opts.out, '.video-list-cache.json');
}

// Caches each playlist's video list on disk, keyed by playlist URL, so re-running the
// script doesn't have to re-hit YouTube to figure out what's in each playlist — only the
// actual mp3 downloads (tracked separately via --download-archive) are ever skipped/redone.
function loadCache(opts) {
  try {
    return JSON.parse(readFileSync(cachePath(opts), 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(opts, cache) {
  writeFileSync(cachePath(opts), JSON.stringify(cache, null, 2));
}

async function listPlaylistVideos(playlistUrl, opts) {
  const playlistJson = ytDlpJson(['--flat-playlist', '--dump-single-json', ...cookieArgs(opts), playlistUrl]);
  return (playlistJson.entries || []).map((e) => ({
    id: e.id,
    title: e.title,
    url: e.url || `https://www.youtube.com/watch?v=${e.id}`,
  }));
}

function downloadAudio({ videoUrl, outputDir, filenameBase, archivePath, opts }) {
  return new Promise((resolve) => {
    const args = [
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--no-playlist',
      '--retries', '5',
      '--fragment-retries', '5',
      '--sleep-requests', '1',
      '--sleep-interval', String(opts.sleepMin),
      '--max-sleep-interval', String(opts.sleepMax),
      '--download-archive', archivePath,
      '-o', path.join(outputDir, `${filenameBase}.%(ext)s`),
    ];
    args.push(...cookieArgs(opts));
    if (opts.limitRate) args.push('--limit-rate', opts.limitRate);
    args.push(videoUrl);

    // yt-dlp can exit non-zero on partial warnings (e.g. some browser cookies failed to
    // decrypt) even though the audio download itself succeeded, so also look for the
    // success markers in its output rather than trusting the exit code alone.
    let output = '';
    const child = spawn('yt-dlp', args);
    child.stdout.on('data', (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
      process.stderr.write(chunk);
    });
    child.on('close', (code) => {
      const alreadyDownloaded = /has already been recorded in the archive/.test(output);
      const succeeded =
        code === 0 || alreadyDownloaded || /\[ExtractAudio] Destination|has already been downloaded/.test(output);
      resolve({ succeeded, alreadyDownloaded });
    });
    child.on('error', (err) => {
      console.error(`Failed to start yt-dlp: ${err.message}`);
      resolve({ succeeded: false, alreadyDownloaded: false });
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  mkdirSync(opts.out, { recursive: true });
  const cache = loadCache(opts);

  console.log(`Channel: ${opts.channel}`);
  console.log('Fetching playlists list...');
  const playlists = await listPlaylists(opts.channel, opts);
  console.log(`Found ${playlists.length} matching playlists (numbered 1-66).`);
  console.log(
    opts.test ? `TEST MODE: downloading ${opts.testLimit} video(s) total.` : 'Downloading all matching videos.'
  );

  let downloaded = 0;

  playlistLoop:
  for (const playlist of playlists) {
    if (opts.test && downloaded >= opts.testLimit) break;

    let videos;
    if (cache[playlist.url] && !opts.refreshList) {
      videos = cache[playlist.url].videos;
      console.log(`Using cached video list for: ${playlist.title} (${videos.length} videos)`);
    } else {
      console.log(`Listing videos for: ${playlist.title}`);
      videos = await listPlaylistVideos(playlist.url, opts);
      cache[playlist.url] = { title: playlist.title, videos };
      saveCache(opts, cache);
      await sleep(randomSleepMs(1, 3));
    }

    const padWidth = videos.length > 99 ? 3 : 2;
    const playlistDir = path.join(opts.out, sanitizeFilename(playlist.title));
    mkdirSync(playlistDir, { recursive: true });
    const archivePath = path.join(playlistDir, '.archive.txt');

    for (let idx = 0; idx < videos.length; idx++) {
      if (opts.test && downloaded >= opts.testLimit) break playlistLoop;

      const video = videos[idx];
      const number = String(idx + 1).padStart(padWidth, '0');
      downloaded++;

      console.log(`[${downloaded}] ${playlist.title} — ${number}.mp3 (${video.title})`);
      const { succeeded, alreadyDownloaded } = await downloadAudio({
        videoUrl: video.url,
        outputDir: playlistDir,
        filenameBase: number,
        archivePath,
        opts,
      });
      if (!succeeded) {
        console.warn(`  -> failed, skipping: ${video.title}`);
      }

      if (!alreadyDownloaded && !(opts.test && downloaded >= opts.testLimit)) {
        const delay = randomSleepMs(opts.sleepMin, opts.sleepMax);
        console.log(`  sleeping ${Math.round(delay / 1000)}s before next download...`);
        await sleep(delay);
      }
    }
  }

  console.log(`Done. Downloaded ${downloaded} video(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
