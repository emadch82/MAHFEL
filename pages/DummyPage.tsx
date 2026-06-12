
import React from 'react';

interface DummyPageProps {
  title: string;
}

const DummyPage: React.FC<DummyPageProps> = ({ title }) => {
  return (
    <div className="p-4 min-h-screen">
      <div className="text-lg font-semibold mb-4">
        <span>{title}</span>
      </div>
      <div className="text-center py-20 text-text-secondary">
        <i className="fas fa-cogs text-4xl mb-4"></i>
        <p>این بخش به زودی اضافه خواهد شد</p>
      </div>
    </div>
  );
};

export default DummyPage;