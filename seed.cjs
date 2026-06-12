const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soha_db';

const PostSchema = new mongoose.Schema({
  author: String,
  authorAvatarUrl: String,
  text: String,
  isoDate: { type: String, default: () => new Date().toISOString() },
  likes: { type: Number, default: 0 },
  replyToId: Number,
  isEdited: { type: Boolean, default: false }
});

const Post = mongoose.model('Post', PostSchema);

const samplePosts = [
  {
    author: 'سها',
    authorAvatarUrl: '',
    text: 'سلام به همه! اولین پست در محفل سها 🎉',
    isoDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    likes: 5,
    replyToId: null,
    isEdited: false
  },
  {
    author: 'علی',
    authorAvatarUrl: '',
    text: 'این یک پست آزمایشی است. چه سایت قشنگی شده!',
    isoDate: new Date(Date.now() - 86400000).toISOString(),
    likes: 3,
    replyToId: null,
    isEdited: false
  },
  {
    author: 'مریم',
    authorAvatarUrl: '',
    text: 'سلام دوستان! من تازه به محفل ملحق شدم. امیدوارم روزهای خوبی داشته باشیم 🤗',
    isoDate: new Date().toISOString(),
    likes: 7,
    replyToId: null,
    isEdited: false
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ به دیتابیس متصل شدیم');

    await Post.deleteMany({});
    console.log('🗑️  پست‌های قبلی حذف شدند');

    const result = await Post.insertMany(samplePosts);
    console.log(`✅ ${result.length} پست با موفقیت اضافه شد`);

    await mongoose.disconnect();
    console.log('✅ اتصال قطع شد');
    process.exit(0);
  } catch (err) {
    console.error('❌ خطا:', err);
    process.exit(1);
  }
}

seed();
