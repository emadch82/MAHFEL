import React from 'react';

interface FavoritesPageProps {
  onClose: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-background z-[1500] animate-fadeIn flex flex-col">
      <header className="flex-shrink-0 flex items-center p-3 border-b border-border-color bg-card-bg shadow-sm">
        <button onClick={onClose} className="text-text-secondary text-lg w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200">
          <i className="fas fa-arrow-right"></i>
        </button>
        <h2 className="font-bold text-lg mr-4">علاقه‌مندی‌ها</h2>
      </header>
      <main className="flex-grow overflow-y-auto p-4">
        <div className="text-center py-20 text-text-secondary">
          <i className="fas fa-heart text-4xl mb-4 text-primary"></i>
          <p>پادکست‌ها و ویدیوهایی که دوست داشتید اینجا نمایش داده می‌شوند.</p>
           <p className="text-sm mt-2">این بخش به زودی تکمیل خواهد شد.</p>
        </div>
      </main>
    </div>
  );
};

export default FavoritesPage;
