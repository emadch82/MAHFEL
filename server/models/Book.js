import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  cover: { type: String, default: '' },
  relatedEpisodes: [{
    podcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' },
    episodeIndex: { type: Number, default: 0 },
  }],
  categories: [{ type: String }],
  addedDate: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

bookSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Book', bookSchema);
