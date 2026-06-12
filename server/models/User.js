import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'author', 'admin'], default: 'user' },
  interests: [{ type: String }],
  securityKey: String,
  library: {
    podcasts: [{ type: String }],
    episodes: [{ podcastId: String, episodeIndex: Number }],
    videos: [{ type: String }],
    books: [{ type: Number }],
    notes: [{ type: Number }],
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('securityKey') || !this.securityKey) return next();
  this.securityKey = await bcrypt.hash(this.securityKey, 10);
  next();
});

userSchema.methods.compareSecurityKey = async function (candidateKey) {
  if (!this.securityKey) return false;
  return bcrypt.compare(candidateKey, this.securityKey);
};

export default mongoose.model('User', userSchema);
