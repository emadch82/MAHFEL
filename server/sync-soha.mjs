import mongoose from 'mongoose';
import Podcast from './models/Podcast.js';
import Author from './models/Author.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soha';
const DL_BASE = 'https://dl.soha-sima.ir';
const ARCHIVE = DL_BASE + '/%D8%A2%D8%B1%D8%B4%DB%8C%D9%88';
const WP_API = 'https://soha-sima.ir/wp-json/wp/v2';

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'SohaApp/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'SohaApp/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
};

const parseDirLinks = (html, baseUrl) => {
  const items = [];
  const regex = /<a href="([^"]+)">([^<]+)<\/a>\s+(\d{2}-[A-Za-z]{3}-\d{4}\s+\d{2}:\d{2})\s+(\d+|-\s*)/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const name = match[2].replace(/\/$/, '').trim();
    const date = match[3];
    if (name === '..' || name === '../') continue;
    const fullUrl = match[1].startsWith('http') ? match[1] : (baseUrl.endsWith('/') ? baseUrl + match[1] : baseUrl + '/' + match[1]);
    const sizeRaw = match[4].trim();
    const isDir = sizeRaw === '-' || sizeRaw === '';
    items.push({ href: fullUrl, name, date, isDir, sizeBytes: isDir ? 0 : parseInt(sizeRaw) || 0 });
  }
  return items;
};

const normalize = (s) => s.replace(/[؟?،,]/g, '').replace(/\u200C/g, ' ').replace(/\s+/g, ' ').trim();

const stripDateSuffix = (s) => {
  // Remove patterns like "- 23فروردین 1401", "20 اسفند 1401", "(5اسفند1402)"
  return s.replace(/[-–]\s*\d*\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)[\s\u200C]*\d*\s*$/i, '')
    .replace(/\s*\(\s*\d*\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)[\s\u200C]*\d*\s*\)\s*$/i, '')
    .replace(/\s*\d*\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)[\s\u200C]*\d*\s*$/i, '')
    .trim();
};

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const estimateDuration = (sizeBytes) => {
  if (!sizeBytes || sizeBytes <= 0) return '00:00';
  // Assume 128 kbps CBR (common for podcasts)
  const seconds = (sizeBytes * 8) / 128000;
  return formatDuration(seconds);
};

const cleanWpTitle = (title) => {
  let c = title.replace(/^[^/]+\/\s*/, '')
    .replace(/\s*\([\d\s\u06F0-\u06F9]+[^)]*\)\s*$/, '')
    .replace(/\s*[\d\s\u06F0-\u06F9]+\s*جلسه\s*$/, '')
    .trim();
  if (c.length < 3) c = title.replace(/^[^/]+\/\s*/, '').trim();
  return c;
};

const buildCoverMap = async () => {
  // Method 1: from MP3 URLs in post content
  const exactCoverMap = {};
  const exactTypeMap = {};
  const exactDescMap = {};

  // Method 2: from WP post titles (all posts, normalized)
  const wpEntries = []; // { normalizedKey, cleanTitle, rawTitle, cover, type, desc }

  let page = 1;
  while (true) {
    const res = await fetch(`${WP_API}/posts?_embed&per_page=100&page=${page}`, { headers: { 'User-Agent': 'SohaApp/1.0' } });
    if (!res.ok) break;
    const posts = await res.json();
    if (posts.length === 0) break;

    for (const p of posts) {
      const content = p.content.rendered;
      const media = p._embedded?.['wp:featuredmedia'];
      const cover = media?.[0]?.source_url;
      const prefix = p.title.rendered.match(/^([^/]+)/);
      const type = prefix ? prefix[1].trim() : 'عمومی';
      const desc = (p.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '');

      // Method 1: extract session dir from MP3 URL
      if (content.includes('.mp3') && cover) {
        const mp3Match = content.match(/href="([^"]+\.mp3)"/);
        if (mp3Match) {
          let url = mp3Match[1].replace(/&amp;/g, '&').replace('www.dl.soha-sima.ir', 'dl.soha-sima.ir').replace('http://', 'https://');
          const decoded = decodeURI(url);
          const parts = decoded.replace('https://dl.soha-sima.ir/', '').split('/');
          if (parts.length >= 4) {
            const sessionDir = parts[2];
            if (!exactCoverMap[sessionDir]) {
              exactCoverMap[sessionDir] = cover;
              exactTypeMap[sessionDir] = type;
              exactDescMap[sessionDir] = desc;
            }
          }
        }
      }

      // Method 2: store normalized title entry
      if (cover) {
        const clean = cleanWpTitle(p.title.rendered);
        const nkey = normalize(clean);
        wpEntries.push({ nkey, clean, raw: p.title.rendered, cover, type, desc });
      }
    }
    page++;
  }

  console.log(`Method 1 (MP3 URL): ${Object.keys(exactCoverMap).length} sessions`);
  console.log(`Method 2 (title entries): ${wpEntries.length} entries`);

  return { exactCoverMap, exactTypeMap, exactDescMap, wpEntries };
};

// Find best cover match for a session name using multiple strategies
const findCover = (sessionName, exactCoverMap, exactTypeMap, exactDescMap, wpEntries) => {
  // Strategy 1: exact name match (from MP3 URLs)
  if (exactCoverMap[sessionName]) return { cover: exactCoverMap[sessionName], type: exactTypeMap[sessionName] || 'عمومی', desc: exactDescMap[sessionName] || '' };

  const nName = normalize(sessionName);

  // Strategy 2: exact normalize match
  const exact2 = wpEntries.find(e => e.nkey === nName);
  if (exact2) return { cover: exact2.cover, type: exact2.type, desc: exact2.desc };

  // Strategy 3: remove (Speaker) suffix and try
  const noParen = sessionName.replace(/\s*\([^)]*\s*\)\s*$/, '').replace(/[؟?،,]/g, '').replace(/\u200C/g, ' ').replace(/\s+/g, ' ').trim();
  if (noParen !== nName) {
    const match3 = wpEntries.find(e => e.nkey === noParen);
    if (match3) return { cover: match3.cover, type: match3.type, desc: match3.desc };
  }

  // Strategy 4: directory is substring of WP clean title
  const match4 = wpEntries.find(e => e.nkey.includes(nName) && e.nkey.length > nName.length + 3);
  if (match4) return { cover: match4.cover, type: match4.type, desc: match4.desc };

  // Strategy 5: WP clean title is substring of directory
  const match5 = wpEntries.find(e => nName.includes(e.nkey) && nName.length > e.nkey.length + 3);
  if (match5) return { cover: match5.cover, type: match5.type, desc: match5.desc };

  // Strategy 6: search raw WP title for partial match
  const dirWords = sessionName.replace(/\s*\([^)]*\)/g, '').split(/\s+/).filter(w => w.length > 2);
  let best = null, bestScore = 0;
  for (const e of wpEntries) {
    const raw = e.raw;
    const matchCount = dirWords.filter(w => raw.includes(w)).length;
    if (matchCount > bestScore && matchCount >= Math.ceil(dirWords.length * 0.6)) {
      bestScore = matchCount;
      best = e;
    }
  }
  if (best) return { cover: best.cover, type: best.type, desc: best.desc };

  return null;
};

const sync = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  let author = await Author.findOne({ name: 'سرای هنر و اندیشه' });
  if (!author) {
    author = await Author.create({
      name: 'سرای هنر و اندیشه', avatar: '',
      bio: 'رسانه تخصصی تفکر و اندیشه', role: 'secretary',
    });
  }

  const { exactCoverMap, exactTypeMap, exactDescMap, wpEntries } = await buildCoverMap();

  console.log('\nCrawling directory listing...');
  const archiveHtml = await fetchText(ARCHIVE);
  const years = parseDirLinks(archiveHtml, ARCHIVE).filter(i => i.isDir && /^\d{4}$/.test(i.name));
  console.log(`Found ${years.length} years`);

  const allPodcasts = [];
  let totalEpisodes = 0;
  let withCover = 0, noCover = 0;
  const defaultCover = '';

  for (const year of years) {
    const yearNum = parseInt(year.name);
    const yearHtml = await fetchText(year.href);
    const sessions = parseDirLinks(yearHtml, year.href).filter(i => i.isDir && i.name !== '00 تک جلسه');
    const singleSessions = parseDirLinks(yearHtml, year.href).filter(i => i.isDir && i.name === '00 تک جلسه');

    for (const session of sessions) {
      const sessionHtml = await fetchText(session.href);
      const files = parseDirLinks(sessionHtml, session.href).filter(i => !i.isDir && i.name.endsWith('.mp3'));
      if (files.length === 0) continue;

      const result = findCover(session.name, exactCoverMap, exactTypeMap, exactDescMap, wpEntries);
      const cover = result?.cover;
      const type = result?.type || 'عمومی';
      const desc = result?.desc || '';

      if (cover) withCover++;
      else { noCover++; console.log(`  NO COVER: "${session.name}"`); }

      const episodes = files.map((f, i) => ({
        title: f.name.replace(/\.mp3$/i, '').replace(/^\d+\s*/, '').trim() || `جلسه ${i + 1}`,
        description: '', duration: estimateDuration(f.sizeBytes),
        audioUrl: f.href, date: f.date, isNew: false,
        cover: cover || undefined, viewCount: 0,
      }));

      const totalSeconds = episodes.reduce((sum, e) => {
        const [m, s] = (e.duration || '00:00').split(':').map(Number);
        return sum + m * 60 + s;
      }, 0);

      allPodcasts.push({
        title: session.name,
        description: desc,
        cover: cover || defaultCover,
        speakerId: author._id, duration: formatDuration(totalSeconds),
        episodes, year: yearNum,
        categories: ['صوت', type],
        isSquare: false,
      });
      totalEpisodes += episodes.length;
    }

    if (singleSessions.length > 0) {
      const singleHtml = await fetchText(singleSessions[0].href);
      const files = parseDirLinks(singleHtml, singleSessions[0].href).filter(i => !i.isDir && i.name.endsWith('.mp3'));
      for (const f of files) {
        const epTitle = f.name.replace(/\.mp3$/i, '').replace(/^\d+\s*/, '').trim();
        let cover = exactCoverMap[epTitle] || null;
        if (!cover) {
          const stripped = stripDateSuffix(epTitle);
          if (stripped !== epTitle) {
            const result = findCover(stripped, exactCoverMap, exactTypeMap, exactDescMap, wpEntries);
            if (result) cover = result.cover;
          }
        }
        if (cover) withCover++;
        else noCover++;
        allPodcasts.push({
          title: epTitle,
          description: '',
          cover: cover || defaultCover,
          speakerId: author._id, duration: estimateDuration(f.sizeBytes),
          episodes: [{ title: epTitle, description: '', duration: estimateDuration(f.sizeBytes), audioUrl: f.href, date: f.date, isNew: false, viewCount: 0 }],
          year: yearNum,
          categories: ['صوت', 'تک‌جلسه‌ای'],
          isSquare: false,
        });
        totalEpisodes++;
      }
    }
  }

  await Podcast.deleteMany({ categories: 'صوت' });
  const inserted = await Podcast.insertMany(allPodcasts);
  console.log(`\nDone! ${inserted.length} podcasts, ${totalEpisodes} episodes (${withCover} with cover, ${noCover} without)`);

  await mongoose.disconnect();
  process.exit(0);
};

sync().catch(e => { console.error('Sync error:', e); process.exit(1); });
