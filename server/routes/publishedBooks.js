import { Router } from 'express';
import PublishedBook from '../models/PublishedBook.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (type) filter.type = type;

    const books = await PublishedBook.find(filter).sort('-createdAt');
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await PublishedBook.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'کتاب یافت نشد' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = new PublishedBook(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = await PublishedBook.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'کتاب یافت نشد' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const book = await PublishedBook.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'کتاب یافت نشد' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطای سرور' });
  }
});

export default router;
