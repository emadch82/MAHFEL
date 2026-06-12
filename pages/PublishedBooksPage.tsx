import React from 'react';
import type { PublishedBook } from '../types';

const PublishedBookCard: React.FC<{ book: PublishedBook }> = ({ book }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200/80 shadow-custom w-full h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <img 
        src={book.cover} 
        alt={book.title} 
        className="w-24 h-36 object-cover rounded-lg flex-shrink-0 shadow-lg"
      />
      <div className="flex flex-col h-full text-right flex-1">
        <h4 className="font-bold text-base text-gray-800">{book.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{book.subtitle}</p>
        <p className="text-xs text-gray-500 line-clamp-2 my-2 flex-grow">{book.description}</p>
        <p className="text-sm font-semibold text-primary mt-auto">{book.authorName}</p>
      </div>
    </div>
  );
};

interface PublishedBooksPageProps {
  books: PublishedBook[];
  onClose: () => void;
}

const PublishedBooksPage: React.FC<PublishedBooksPageProps> = ({ books, onClose }) => {
  return (
    <div className="fixed inset-0 bg-background z-[1500] animate-slideInFromRight flex flex-col">
      <header className="flex-shrink-0 flex items-center p-3 border-b border-border-color bg-card-bg shadow-sm sticky top-0 z-10">
        <button onClick={onClose} className="text-text-secondary text-lg w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200">
          <i className="fas fa-arrow-right"></i>
        </button>
        <h2 className="font-bold text-lg mr-4">نشر هنر و اندیشه</h2>
      </header>
      <main className="flex-grow overflow-y-auto p-4">
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {books.map(book => (
              <PublishedBookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-text-secondary">
            <i className="fas fa-book-dead text-4xl mb-4"></i>
            <p>هنوز کتابی منتشر نشده است.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublishedBooksPage;