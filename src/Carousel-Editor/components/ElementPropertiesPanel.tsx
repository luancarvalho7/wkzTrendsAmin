import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { EditableElementInfo, SlideContent } from '../types/carousel';

interface ElementPropertiesPanelProps {
  selectedElement: EditableElementInfo | null;
  slideContent: SlideContent;
  onClose: () => void;
  onApplyStyle: (selector: string, property: string, value: string) => void;
  onApplyContent: (selector: string, content: string) => void;
  onBackgroundChange: (imageUrl: string, index: number) => void;
}

function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
    return '#000000';
  }

  if (rgb.startsWith('#')) {
    return rgb;
  }

  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return '#000000';
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  selectedElement,
  slideContent,
  onClose,
  onApplyStyle,
  onApplyContent,
  onBackgroundChange,
}) => {
  const [textContent, setTextContent] = useState('');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('24');
  const [fontWeight, setFontWeight] = useState('400');
  const [textAlign, setTextAlign] = useState('left');
  const [padding, setPadding] = useState('0px');
  const [margin, setMargin] = useState('0px');

  useEffect(() => {
    if (!selectedElement || !selectedElement.element) return;

    const element = selectedElement.element;
    const computed = window.getComputedStyle(element);

    setTextContent(element.textContent || '');
    setColor(rgbToHex(computed.color));
    setFontSize(parseInt(computed.fontSize).toString());
    setFontWeight(computed.fontWeight);
    setTextAlign(computed.textAlign);
    setPadding(computed.padding);
    setMargin(computed.margin);
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleTextChange = (value: string) => {
    setTextContent(value);
    onApplyContent(selectedElement.selector, value);
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    onApplyStyle(selectedElement.selector, 'color', value);
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    onApplyStyle(selectedElement.selector, 'fontSize', `${value}px`);
  };

  const handleFontWeightChange = (value: string) => {
    setFontWeight(value);
    onApplyStyle(selectedElement.selector, 'fontWeight', value);
  };

  const handleTextAlignChange = (value: string) => {
    setTextAlign(value);
    onApplyStyle(selectedElement.selector, 'textAlign', value);
  };

  const handlePaddingChange = (value: string) => {
    setPadding(value);
    onApplyStyle(selectedElement.selector, 'padding', value);
  };

  const handleMarginChange = (value: string) => {
    setMargin(value);
    onApplyStyle(selectedElement.selector, 'margin', value);
  };

  const isTextElement = selectedElement.type === 'text';
  const isBackgroundElement = selectedElement.type === 'background';

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 animate-slideIn overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Element Properties</h3>
          <p className="text-sm text-gray-400 mt-1">{selectedElement.label}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {isTextElement && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                placeholder="Enter text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Font Weight
              </label>
              <select
                value={fontWeight}
                onChange={(e) => handleFontWeightChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Align
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleTextAlignChange(align)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      textAlign === align
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Padding
              </label>
              <input
                type="text"
                value={padding}
                onChange={(e) => handlePaddingChange(e.target.value)}
                placeholder="e.g., 10px or 10px 20px"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Margin
              </label>
              <input
                type="text"
                value={margin}
                onChange={(e) => handleMarginChange(e.target.value)}
                placeholder="e.g., 10px or 10px 20px"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {isBackgroundElement && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Background Images
              </label>
              <div className="grid grid-cols-2 gap-3">
                {slideContent.imagem_fundo && (
                  <button
                    onClick={() => onBackgroundChange(slideContent.imagem_fundo, 0)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors group"
                  >
                    <img
                      src={slideContent.imagem_fundo}
                      alt="Background 1"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </button>
                )}
                {slideContent.imagem_fundo2 && (
                  <button
                    onClick={() => onBackgroundChange(slideContent.imagem_fundo2, 1)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors group"
                  >
                    <img
                      src={slideContent.imagem_fundo2}
                      alt="Background 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </button>
                )}
                {slideContent.imagem_fundo3 && (
                  <button
                    onClick={() => onBackgroundChange(slideContent.imagem_fundo3, 2)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors group"
                  >
                    <img
                      src={slideContent.imagem_fundo3}
                      alt="Background 3"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Images by Keyword
              </label>
              <input
                type="text"
                placeholder="Search for images..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Image search coming soon
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ElementPropertiesPanel;
