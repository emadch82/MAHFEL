import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  embedId: { type: String, required: true },
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  viewCount: { type: Number, default: 0 },
  uploadDate: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  categories: [{ type: String }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  fullText: { type: String, default: '' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Video', videoSchema);
