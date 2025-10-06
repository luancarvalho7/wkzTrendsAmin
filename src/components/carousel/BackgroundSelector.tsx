import React, { useState } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { SlideContent } from '../../types/carousel';

interface BackgroundSelectorProps {
  slideContent: SlideContent;
  selectedIndex: number;
  onBackgroundChange: (imageUrl: string, index: number) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  slideContent,
  selectedIndex,
  onBackgroundChange,
}) => {
  const [customUrl, setCustomUrl] = useState('');

  const backgrounds = [
    { url: slideContent.imagem_fundo, index: 0 },
    { url: slideContent.imagem_fundo2, index: 1 },
    { url: slideContent.imagem_fundo3, index: 2 },
  ].filter((bg) => bg.url);

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      onBackgroundChange(customUrl, 3);
      setCustomUrl('');
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
        <ImageIcon className="w-4 h-4 mr-2" />
        Background Images
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {backgrounds.map((bg) => (
          <button
            key={bg.index}
            onClick={() => onBackgroundChange(bg.url!, bg.index)}
            className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
              selectedIndex === bg.index
                ? 'border-blue-500 ring-2 ring-blue-500/50'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <img
              src={bg.url}
              alt={`Background ${bg.index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3C/svg%3E';
              }}
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">Custom Image URL</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomUrl()}
          />
          <button
            onClick={handleCustomUrl}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSelector;
