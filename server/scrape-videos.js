import { writeFileSync } from 'fs';

const SITEMAP_URL = 'https://soha-sima.ir/wp-sitemap-posts-post-1.xml';
const OUTPUT_FILE = 'E:\\soha\\server\\aparat-videos.json';
const DELAY_MS = 500;

const PATTERNS = [
  /\[aparat\]([a-zA-Z0-9]+)\[\/aparat\]/g,
  /aparat\.com\/video\/video\/embed\/videohash\/([a-zA-Z0-9]+)/g,
  /aparat\.com\/v\/([a-zA-Z0-9]+)/g,
  /data-video-hash="([a-zA-Z0-9]+)"/g,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AparatScraper/1.0)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

function extractVideoIds(html) {
  const ids = new Set();
  for (const pattern of PATTERNS) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      ids.add(match[1]);
    }
  }
  return ids;
}

async function getSitemapUrls() {
  const xml = await fetchWithRetry(SITEMAP_URL);
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function getVideoInfo(videoId) {
  const api = `https://www.aparat.com/etc/api/video/videohash/${videoId}`;
  const data = await fetchWithRetry(api);
  return JSON.parse(data);
}

async function main() {
  console.log('Fetching sitemap...');
  const urls = await getSitemapUrls();
  console.log(`Found ${urls.length} post URLs`);

  const allIds = new Set();
  const failed = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);
    try {
      const html = await fetchWithRetry(url);
      const ids = extractVideoIds(html);
      for (const id of ids) {
        allIds.add(id);
      }
      console.log(`  Found ${ids.size} video IDs: ${[...ids].join(', ') || 'none'}`);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      failed.push(url);
    }
    if (i < urls.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nTotal unique video IDs: ${allIds.size}`);
  if (failed.length) console.log(`Failed URLs: ${failed.length}`);

  const videos = [];
  const ids = [...allIds];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    console.log(`Fetching video info ${i + 1}/${ids.length}: ${id}`);
    try {
      const info = await getVideoInfo(id);
      videos.push(info);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      videos.push({ video: { videohash: id, title: null, error: e.message } });
    }
    if (i < ids.length - 1) await sleep(DELAY_MS);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(videos, null, 2), 'utf8');
  console.log(`\nSaved ${videos.length} videos to ${OUTPUT_FILE}`);
}

main().catch(console.error);
