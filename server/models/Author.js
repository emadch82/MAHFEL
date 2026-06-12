import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['master', 'secretary'], default: 'secretary' },
  coverImage: String,
}, { timestamps: true });

export default mongoose.model('Author', authorSchema);
