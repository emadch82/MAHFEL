import { Router } from 'express';
import { Readable } from 'stream';

const router = Router();

const ALLOWED_HOSTS = ['dl.soha-sima.ir'];

router.get('/audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
      const parsed = new URL(url);
      if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        return res.status(403).json({ error: 'Forbidden host' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const range = req.headers.range;
    const fetchOpts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };

    if (range) {
      fetchOpts.headers['Range'] = range;
    }

    const originRes = await fetch(url, fetchOpts);

    if (!originRes.ok && originRes.status !== 206) {
      return res.status(originRes.status).json({ error: 'Failed to fetch audio' });
    }

    const contentType = originRes.headers.get('content-type') || 'audio/mpeg';
    const contentLength = originRes.headers.get('content-length');
    const contentRange = originRes.headers.get('content-range');

    if (range && originRes.status === 206) {
      res.status(206);
      if (contentRange) res.set('Content-Range', contentRange);
    }

    res.set('Content-Type', contentType);
    if (contentLength) res.set('Content-Length', contentLength);
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');

    const stream = Readable.fromWeb(originRes.body);
    stream.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error' });
    }
  }
});

export default router;
