import React, { useState, useEffect } from 'react';
import { MousePointer2, Image, Upload, Search } from 'lucide-react';
import { EditableElementInfo } from '../../types/carousel';
import ElementStyleEditor from './ElementStyleEditor';

interface ItemPropertiesPanelProps {
  selectedElement: EditableElementInfo | null;
  elementStyles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  onContentChange?: (content: string) => void;
}

const PRESET_BACKGROUNDS = [
  'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2025/01/Santos-Neymar-braco-Cruzado.jpg',
  'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1080',
  'https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg?auto=compress&cs=tinysrgb&w=1080',
];

const ItemPropertiesPanel: React.FC<ItemPropertiesPanelProps> = ({
  selectedElement,
  elementStyles,
  onStyleChange,
  onContentChange,
}) => {
  const [textContent, setTextContent] = useState('');
  const [imageSearch, setImageSearch] = useState('');

  useEffect(() => {
    if (selectedElement?.type === 'text') {
      setTextContent(selectedElement.element.textContent || '');
    }
  }, [selectedElement]);

  const handleTextChange = (value: string) => {
    setTextContent(value);
    if (onContentChange) {
      onContentChange(value);
    }
    if (selectedElement?.element) {
      selectedElement.element.textContent = value;
    }
  };

  const handleBackgroundChange = (url: string) => {
    onStyleChange('backgroundImage', `url("${url}")`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleBackgroundChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!selectedElement) {
    return (
      <div className="properties-panel w-80 bg-black border-l border-white/20 flex flex-col items-center justify-center p-8 text-center">
        <MousePointer2 className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-lg font-medium text-white/60 mb-2">No Element Selected</h3>
        <p className="text-sm text-white/40">
          Click on an element in the preview to edit its properties
        </p>
        <div className="mt-6 space-y-2 text-xs text-white/30">
          <p>• Single click to select</p>
          <p>• Double click text to edit inline</p>
          <p>• Press ESC to deselect</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel w-80 bg-black border-l border-white/20 flex flex-col overflow-y-auto">
      <div className="bg-black border-b border-white/20 px-4 py-3 sticky top-0 z-10">
        <h3 className="text-sm font-medium text-white">Element Properties</h3>
        <p className="text-xs text-white/50 mt-1">Selected: {selectedElement.label}</p>
        <div className="mt-2 text-xs text-white/40">
          <span className="font-mono bg-white/10 px-2 py-1 rounded">
            {selectedElement.type}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {selectedElement.type === 'text' && (
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Text Content
            </label>
            <textarea
              value={textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y"
              placeholder="Enter text content..."
            />
          </div>
        )}

        {selectedElement.type === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-3">
                Preset Backgrounds
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BACKGROUNDS.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleBackgroundChange(url)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-blue-500 transition-colors group"
                  >
                    <img
                      src={url}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Search Images
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  placeholder="Search Pexels..."
                  className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <p className="text-xs text-white/40 mt-2">
                Coming soon: Search free stock photos
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Upload Image
              </label>
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-lg hover:border-blue-500 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-white/40 group-hover:text-blue-500 mx-auto mb-1" />
                  <span className="text-xs text-white/40 group-hover:text-blue-500">
                    Click to upload
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Or paste URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = (e.target as HTMLInputElement).value;
                    if (url) {
                      handleBackgroundChange(url);
                    }
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-white/40 mt-1">Press Enter to apply</p>
            </div>
          </div>
        )}

        <ElementStyleEditor
          element={selectedElement}
          styles={elementStyles}
          onStyleChange={onStyleChange}
        />
      </div>
    </div>
  );
};

export default ItemPropertiesPanel;
