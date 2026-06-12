import React, { useState, useEffect } from 'react';

interface PdfViewerProps {
  fileUrl: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black/70 z-[2000] flex items-center justify-center animate-fadeIn p-4" onClick={onClose}>
      <div 
        className="bg-card-bg rounded-lg shadow-2xl w-full h-full max-w-4xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex justify-between items-center p-3 border-b border-border-color bg-background">
          <h3 className="font-bold text-text-primary text-base">فایل ضمیمه</h3>
          <button onClick={onClose} className="text-text-secondary text-lg w-8 h-8 rounded-full transition-colors hover:bg-gray-200 active:bg-gray-300">
            <i className="fas fa-times"></i>
          </button>
        </header>
        <main className="flex-grow relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
              <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
              <p>در حال بارگذاری فایل...</p>
            </div>
          )}
          {loadError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary text-center p-4">
                <i className="fas fa-exclamation-triangle text-3xl mb-3 text-red-500"></i>
                <p className="font-semibold">خطا در بارگذاری پیش‌نمایش</p>
                <p className="text-sm mb-4">ممکن است فایل مورد نظر خصوصی باشد یا با نمایشگر سازگار نباشد.</p>
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95"
                >
                    باز کردن در پنجره جدید
                </a>
            </div>
          )}
          <iframe
            src={viewerUrl}
            title="PDF Viewer"
            className="w-full h-full"
            style={{ visibility: isLoading || loadError ? 'hidden' : 'visible' }}
            onLoad={handleLoadSuccess}
            frameBorder="0"
          ></iframe>
        </main>
      </div>
    </div>
  );
};

export default PdfViewer;