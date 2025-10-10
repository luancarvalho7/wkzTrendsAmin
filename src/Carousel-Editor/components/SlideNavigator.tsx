import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditorSlide } from '../types/carousel';

interface SlideNavigatorProps {
  slides: EditorSlide[];
  currentIndex: number;
  onSlideChange: (index: number) => void;
}

const SlideNavigator: React.FC<SlideNavigatorProps> = ({ slides, currentIndex, onSlideChange }) => {
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSlideChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      onSlideChange(currentIndex + 1);
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-medium">
          Slide {currentIndex + 1} of {slides.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideChange(index)}
            className={`relative aspect-[9/16] rounded overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-blue-500 ring-2 ring-blue-500/50'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <span className="text-white text-lg font-bold">{index + 1}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center truncate">
              {slide.content.title || 'Untitled'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlideNavigator;
