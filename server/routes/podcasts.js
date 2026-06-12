import { Router } from 'express';
import Podcast from '../models/Podcast.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, speaker, sort = '-createdAt' } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (category) filter.categories = category;
    if (speaker) filter.speakerId = speaker;

    const podcasts = await Podcast.find(filter)
      .populate('speakerId', 'name avatar role')
      .populate('authorId', 'name avatar role')
      .sort(sort);

    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate('speakerId', 'name avatar role')
      .populate('authorId', 'name avatar role');
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    res.json(podcast);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.post('/', requireAuth, requireRole('admin', 'author'), async (req, res) => {
  try {
    const podcast = new Podcast(req.body);
    await podcast.save();
    res.status(201).json(podcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireRole('admin', 'author'), async (req, res) => {
  try {
    const podcast = await Podcast.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    res.json(podcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const podcast = await Podcast.findByIdAndDelete(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.post('/:id/episodes', requireAuth, requireRole('admin', 'author'), async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    podcast.episodes.push(req.body);
    await podcast.save();
    res.json(podcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:podcastId/episodes/:episodeIndex', requireAuth, requireRole('admin', 'author'), async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.podcastId);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    const idx = parseInt(req.params.episodeIndex);
    if (idx < 0 || idx >= podcast.episodes.length) {
      return res.status(400).json({ error: 'ایندکس نامعتبر' });
    }
    podcast.episodes[idx] = { ...podcast.episodes[idx].toObject(), ...req.body };
    await podcast.save();
    res.json(podcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:podcastId/episodes/:episodeIndex', requireAuth, requireRole('admin', 'author'), async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.podcastId);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    const idx = parseInt(req.params.episodeIndex);
    if (idx < 0 || idx >= podcast.episodes.length) {
      return res.status(400).json({ error: 'ایندکس نامعتبر' });
    }
    podcast.episodes.splice(idx, 1);
    await podcast.save();
    res.json(podcast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    const identifier = req.body?.phoneNumber || req.ip || 'anonymous';
    if (!podcast.likedBy) podcast.likedBy = [];
    const idx = podcast.likedBy.indexOf(identifier);
    if (idx > -1) {
      podcast.likedBy.splice(idx, 1);
      podcast.likes = Math.max(0, (podcast.likes || 0) - 1);
    } else {
      podcast.likedBy.push(identifier);
      podcast.likes = (podcast.likes || 0) + 1;
    }
    await podcast.save();
    res.json({ likes: podcast.likes, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'مجموعه یافت نشد' });
    const { episodeIndex = 0 } = req.body;
    if (podcast.episodes[episodeIndex]) {
      podcast.episodes[episodeIndex].viewCount += 1;
      await podcast.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

export default router;
