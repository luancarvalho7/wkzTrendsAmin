import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Image, Type, Layers } from 'lucide-react';
import { EditableElementInfo, EditorSlide } from '../types/carousel';

interface LayersPanelProps {
  slides: EditorSlide[];
  currentSlideIndex: number;
  selectedElement: EditableElementInfo | null;
  onSlideSelect: (index: number) => void;
  onElementSelect: (element: EditableElementInfo, slideIndex: number) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  slides,
  currentSlideIndex,
  selectedElement,
  onSlideSelect,
  onElementSelect,
}) => {
  const [expandedSlides, setExpandedSlides] = useState<Set<number>>(new Set([0]));

  const toggleSlide = (index: number) => {
    const newExpanded = new Set(expandedSlides);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSlides(newExpanded);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'title':
      case 'subtitle':
      case 'text':
        return <Type className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getElementsForSlide = (slide: EditorSlide, slideIndex: number): EditableElementInfo[] => {
    const elements: EditableElementInfo[] = [];

    if (slide.content.imagem_fundo || slide.content.imagem_fundo2 || slide.content.imagem_fundo3) {
      elements.push({
        label: 'Background Image',
        type: 'image',
        selector: '[data-editable="image"]',
        element: null as any,
        slideIndex,
      });
    }

    if (slide.content.title) {
      elements.push({
        label: 'Title',
        type: 'title',
        selector: '[data-editable="title"]',
        element: null as any,
        slideIndex,
      });
    }

    if (slide.content.subtitle) {
      elements.push({
        label: 'Subtitle',
        type: 'subtitle',
        selector: '[data-editable="subtitle"]',
        element: null as any,
        slideIndex,
      });
    }

    if (slide.content.text) {
      elements.push({
        label: 'Text',
        type: 'text',
        selector: '[data-editable="text"]',
        element: null as any,
        slideIndex,
      });
    }

    return elements;
  };

  const handleElementClick = (element: EditableElementInfo, slideIndex: number) => {
    onSlideSelect(slideIndex);
    onElementSelect(element, slideIndex);
  };

  return (
    <div className="w-full bg-black text-white">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white/80">Layers</h3>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {slides.map((slide, slideIndex) => {
          const isExpanded = expandedSlides.has(slideIndex);
          const isSlideActive = slideIndex === currentSlideIndex;
          const elements = getElementsForSlide(slide, slideIndex);

          return (
            <div key={slide.id} className="border-b border-white/5">
              <div
                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors ${
                  isSlideActive ? 'bg-blue-500/20' : ''
                }`}
                onClick={() => {
                  toggleSlide(slideIndex);
                  onSlideSelect(slideIndex);
                }}
              >
                <button
                  className="p-1 hover:bg-white/10 rounded mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlide(slideIndex);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-white/60" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-white/60" />
                  )}
                </button>
                <Layers className="w-4 h-4 text-white/60 mr-2" />
                <span className={`text-sm ${isSlideActive ? 'text-blue-400 font-medium' : 'text-white/80'}`}>
                  Slide {slideIndex + 1}
                </span>
              </div>

              {isExpanded && (
                <div className="pl-8">
                  {elements.map((element, idx) => {
                    const isElementSelected =
                      selectedElement?.type === element.type &&
                      selectedElement?.slideIndex === slideIndex;

                    return (
                      <div
                        key={`${slideIndex}-${element.type}-${idx}`}
                        className={`flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors ${
                          isElementSelected ? 'bg-blue-500/30' : ''
                        }`}
                        onClick={() => handleElementClick(element, slideIndex)}
                      >
                        <div className="text-white/60 mr-2">
                          {getElementIcon(element.type)}
                        </div>
                        <span
                          className={`text-sm ${
                            isElementSelected ? 'text-blue-400 font-medium' : 'text-white/70'
                          }`}
                        >
                          {element.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayersPanel;
