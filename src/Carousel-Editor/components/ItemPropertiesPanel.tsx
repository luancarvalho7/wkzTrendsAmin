import React, { useState, useEffect } from 'react';
import { MousePointer2, Image, Upload, Search } from 'lucide-react';
import { EditableElementInfo, SlideContent } from '../types/carousel';
import ElementStyleEditor from './ElementStyleEditor';

interface ItemPropertiesPanelProps {
  selectedElement: EditableElementInfo | null;
  slideContent: SlideContent;
  elementStyles: Record<string, string>;
  selectedBackgroundIndex: number;
  onContentChange: (key: string, value: string) => void;
  onBackgroundChange: (imageUrl: string, index: number) => void;
  onStyleChange: (property: string, value: string) => void;
}

const ItemPropertiesPanel: React.FC<ItemPropertiesPanelProps> = ({
  selectedElement,
  slideContent,
  elementStyles,
  selectedBackgroundIndex,
  onContentChange,
  onBackgroundChange,
  onStyleChange,
}) => {
  const [textContent, setTextContent] = useState('');
  const [imageSearch, setImageSearch] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (selectedElement?.type === 'text') {
      setTextContent(selectedElement.element.textContent || '');
    }
  }, [selectedElement]);

  const handleTextChange = (value: string) => {
    setTextContent(value);
    if (selectedElement?.type === 'text') {
      onContentChange('text', value);
    } else if (selectedElement?.type === 'title') {
      onContentChange('title', value);
    } else if (selectedElement?.type === 'subtitle') {
      onContentChange('subtitle', value);
    }
  };

  const handleBackgroundImageChange = (url: string, index: number) => {
    onBackgroundChange(url, index);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleBackgroundImageChange(dataUrl, selectedBackgroundIndex);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearch = async () => {
    if (!imageSearch.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(imageSearch)}&per_page=6&orientation=portrait`,
        {
          headers: {
            Authorization: 'YOUR_PEXELS_API_KEY',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const imageUrls = data.photos.map((photo: any) => photo.src.large);
        setSearchResults(imageUrls);
      } else {
        console.error('Failed to search images');
      }
    } catch (error) {
      console.error('Error searching images:', error);
    } finally {
      setIsSearching(false);
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

        {(selectedElement.type === 'background' || selectedElement.type === 'image') && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-3">
                Available Backgrounds
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slideContent.imagem_fundo && (
                  <button
                    onClick={() => handleBackgroundImageChange(slideContent.imagem_fundo, 0)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors group ${
                      selectedBackgroundIndex === 0 ? 'border-blue-500' : 'border-white/10 hover:border-blue-500'
                    }`}
                  >
                    <img
                      src={slideContent.imagem_fundo}
                      alt="Background 1"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                  </button>
                )}
                {slideContent.imagem_fundo2 && (
                  <button
                    onClick={() => handleBackgroundImageChange(slideContent.imagem_fundo2, 1)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors group ${
                      selectedBackgroundIndex === 1 ? 'border-blue-500' : 'border-white/10 hover:border-blue-500'
                    }`}
                  >
                    <img
                      src={slideContent.imagem_fundo2}
                      alt="Background 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                  </button>
                )}
                {slideContent.imagem_fundo3 && (
                  <button
                    onClick={() => handleBackgroundImageChange(slideContent.imagem_fundo3, 2)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors group ${
                      selectedBackgroundIndex === 2 ? 'border-blue-500' : 'border-white/10 hover:border-blue-500'
                    }`}
                  >
                    <img
                      src={slideContent.imagem_fundo3}
                      alt="Background 3"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                  </button>
                )}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleImageSearch();
                    }
                  }}
                  placeholder="Search keywords..."
                  className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <button
                onClick={handleImageSearch}
                disabled={!imageSearch.trim() || isSearching}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              {searchResults.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {searchResults.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleBackgroundImageChange(url, selectedBackgroundIndex);
                        setSearchResults([]);
                        setImageSearch('');
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-blue-500 transition-colors group"
                    >
                      <img
                        src={url}
                        alt={`Search result ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-white/40 mt-2">
                Note: Pexels API key required
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
                      handleBackgroundImageChange(url, selectedBackgroundIndex);
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
