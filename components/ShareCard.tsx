import React, { useState } from 'react';

interface ShareCardProps {
  title: string;
  description?: string;
  coverUrl?: string;
  url?: string;
  onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ title, description, coverUrl, url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = `${title}\n${description || ''}\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareEitaa = () => {
    window.open(`https://eitaa.com/share/url?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[7000] bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 animate-[slideInUp_0.3s]" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {coverUrl && (
          <div className="flex justify-center mb-6">
            <img src={coverUrl} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt={title} />
          </div>
        )}

        <h3 className="text-sm font-black text-gray-800 text-center mb-1 line-clamp-2">{title}</h3>
        {description && <p className="text-[10px] text-gray-400 font-medium text-center mb-6 line-clamp-2">{description}</p>}

        <div className="grid grid-cols-4 gap-3 mb-6">
          <button onClick={handleShareTelegram} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
            <i className="fab fa-telegram-plane text-2xl text-blue-500"></i>
            <span className="text-[9px] font-black text-gray-600">تلگرام</span>
          </button>
          <button onClick={handleShareWhatsApp} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
            <i className="fab fa-whatsapp text-2xl text-green-500"></i>
            <span className="text-[9px] font-black text-gray-600">واتساپ</span>
          </button>
          <button onClick={handleShareTwitter} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 transition-colors">
            <i className="fab fa-twitter text-2xl text-sky-500"></i>
            <span className="text-[9px] font-black text-gray-600">توییتر</span>
          </button>
          <button onClick={handleShareEitaa} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
            <i className="fab fa-telegram-plane text-2xl text-indigo-500"></i>
            <span className="text-[9px] font-black text-gray-600">ایتا</span>
          </button>
        </div>

        <button onClick={handleCopyLink} className="w-full py-3 bg-gray-100 rounded-2xl text-xs font-black text-gray-700 flex items-center justify-center gap-2 active:scale-95 transition-all">
          <i className={copied ? 'fas fa-check text-primary' : 'fas fa-link'}></i>
          {copied ? 'کپی شد!' : 'کپی لینک'}
        </button>

        <button onClick={onClose} className="w-full py-3 mt-2 text-gray-400 text-xs font-black active:scale-95 transition-all">
          بستن
        </button>
      </div>
    </div>
  );
};

export default ShareCard;
