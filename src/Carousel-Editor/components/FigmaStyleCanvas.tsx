import React, { useRef, useState, useCallback, useEffect } from 'react';
import { EditableElementInfo } from '../types/carousel';
import { detectEditableElements, getElementStyles } from '../utils/elementDetector';

interface FigmaStyleCanvasProps {
  slides: Array<{ htmlContent: string; id: number }>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedElement: EditableElementInfo | null;
  onElementSelect: (element: EditableElementInfo | null) => void;
  onStyleChange?: (element: EditableElementInfo, styles: Record<string, string>) => void;
  onContentChange?: (element: EditableElementInfo, content: string) => void;
  currentSlideIndex: number;
  onSlideIndexChange: (index: number) => void;
}

const FigmaStyleCanvas: React.FC<FigmaStyleCanvasProps> = ({
  slides,
  zoom,
  onZoomChange,
  selectedElement,
  onElementSelect,
  onStyleChange,
  onContentChange,
  currentSlideIndex,
  onSlideIndexChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframesRef = useRef<Map<number, HTMLIFrameElement>>(new Map());
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineText, setInlineText] = useState('');
  const [editingElement, setEditingElement] = useState<EditableElementInfo | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  const lastClickedElementRef = useRef<EditableElementInfo | null>(null);

  const SLIDE_WIDTH = 1080;
  const SLIDE_HEIGHT = 1350;
  const SLIDE_SPACING = 40;

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.002;
      const newZoom = Math.max(0.1, Math.min(2, zoom + delta));
      onZoomChange(newZoom);
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [zoom, onZoomChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (e.button === 0 && (target.classList.contains('canvas-background') || target.classList.contains('canvas-content'))) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const startInlineEditing = useCallback((elementInfo: EditableElementInfo, slideIndex: number) => {
    const iframe = iframesRef.current.get(slides[slideIndex].id);
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const targetElement = doc.querySelector(elementInfo.selector) as HTMLElement;
    if (!targetElement) return;

    const currentText = targetElement.textContent || '';
    setInlineText(currentText);
    setIsEditingInline(true);
    setEditingElement({ ...elementInfo, slideIndex });
    onElementSelect({ ...elementInfo, slideIndex });
  }, [slides, onElementSelect]);

  const finishInlineEditing = useCallback(() => {
    if (editingElement && onContentChange) {
      onContentChange(editingElement, inlineText);
    }
    setIsEditingInline(false);
    setEditingElement(null);
  }, [editingElement, inlineText, onContentChange]);

  const handleElementClick = useCallback((elementInfo: EditableElementInfo, slideIndex: number) => {
    console.log('handleElementClick called for:', elementInfo.label, 'on slide', slideIndex);

    if (isEditingInline) {
      console.log('Ignoring click - editing inline');
      return;
    }

    if (lastClickedElementRef.current?.selector === elementInfo.selector) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
      lastClickedElementRef.current = elementInfo;
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      console.log('Click count:', clickCountRef.current);
      if (clickCountRef.current === 2 && elementInfo.type === 'text') {
        console.log('Double click detected - starting inline editing');
        startInlineEditing(elementInfo, slideIndex);
      } else {
        console.log('Single click - selecting element');
        onSlideIndexChange(slideIndex);
        const styles = getElementStyles(elementInfo.element);
        const updatedElementInfo = { ...elementInfo, slideIndex };
        onElementSelect(updatedElementInfo);
        if (onStyleChange) {
          onStyleChange(updatedElementInfo, styles);
        }
      }
      clickCountRef.current = 0;
      lastClickedElementRef.current = null;
    }, 300);
  }, [isEditingInline, onElementSelect, onStyleChange, onSlideIndexChange, startInlineEditing]);

  const setupSlideContent = useCallback((iframe: HTMLIFrameElement, htmlContent: string, slideIndex: number) => {
    if (!iframe?.contentWindow) return;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      const elements = detectEditableElements(doc);

      elements.forEach(elementInfo => {
        const element = doc.querySelector(elementInfo.selector) as HTMLElement;
        if (!element) return;

        element.style.cursor = 'pointer';
        element.style.transition = 'outline 0.2s ease';

        const updateHighlight = () => {
          const isSelected = selectedElement?.selector === elementInfo.selector && currentSlideIndex === slideIndex;
          if (isSelected) {
            element.style.outline = '3px solid #3B82F6';
            element.style.outlineOffset = '2px';
          } else {
            element.style.outline = 'none';
            element.style.outlineOffset = '0px';
          }
        };

        updateHighlight();

        const mouseEnterHandler = () => {
          if (!isEditingInline && !(selectedElement?.selector === elementInfo.selector && currentSlideIndex === slideIndex)) {
            element.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
            element.style.outlineOffset = '2px';
          }
        };

        const mouseLeaveHandler = () => {
          if (!(selectedElement?.selector === elementInfo.selector && currentSlideIndex === slideIndex)) {
            element.style.outline = 'none';
            element.style.outlineOffset = '0px';
          }
        };

        const clickHandler = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          handleElementClick(elementInfo, slideIndex);
        };

        element.addEventListener('mouseenter', mouseEnterHandler);
        element.addEventListener('mouseleave', mouseLeaveHandler);
        element.addEventListener('click', clickHandler);
      });
    }, 100);
  }, [selectedElement, isEditingInline, currentSlideIndex, handleElementClick]);

  useEffect(() => {
    slides.forEach((slide, index) => {
      const iframe = iframesRef.current.get(slide.id);
      if (iframe) {
        setupSlideContent(iframe, slide.htmlContent, index);
      }
    });
  }, [slides, setupSlideContent, selectedElement, currentSlideIndex]);

  const handleIframeRef = useCallback((iframe: HTMLIFrameElement | null, slideId: number) => {
    if (iframe) {
      iframesRef.current.set(slideId, iframe);
      const slide = slides.find(s => s.id === slideId);
      if (slide) {
        const slideIndex = slides.indexOf(slide);
        setupSlideContent(iframe, slide.htmlContent, slideIndex);
      }
    } else {
      iframesRef.current.delete(slideId);
    }
  }, [slides, setupSlideContent]);

  const focusOnSlide = useCallback((slideIndex: number) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const slideX = 100 + (slideIndex * (SLIDE_WIDTH * zoom + SLIDE_SPACING));
    const slideY = 100;

    const centerX = containerWidth / 2 - (SLIDE_WIDTH * zoom) / 2;
    const centerY = containerHeight / 2 - (SLIDE_HEIGHT * zoom) / 2;

    setPan({
      x: centerX - slideX,
      y: centerY - slideY,
    });
  }, [zoom, SLIDE_WIDTH, SLIDE_HEIGHT, SLIDE_SPACING]);

  useEffect(() => {
    if (selectedElement && selectedElement.slideIndex !== undefined) {
      focusOnSlide(selectedElement.slideIndex);
    }
  }, [selectedElement, focusOnSlide]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#1a1a1a] canvas-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <div
        className="absolute canvas-content"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          pointerEvents: isPanning ? 'none' : 'auto',
        }}
      >
        <div className="flex items-start canvas-content" style={{ gap: `${SLIDE_SPACING}px`, padding: '100px' }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-shrink-0"
              style={{
                width: SLIDE_WIDTH * zoom,
                height: SLIDE_HEIGHT * zoom,
              }}
            >
              <div
                className={`absolute -top-10 left-0 text-sm font-medium transition-colors ${
                  index === currentSlideIndex ? 'text-blue-400' : 'text-white/60'
                }`}
              >
                Slide {index + 1}
              </div>

              <div
                className={`relative rounded-lg overflow-hidden shadow-2xl transition-all ${
                  index === currentSlideIndex
                    ? 'ring-4 ring-blue-500'
                    : 'ring-2 ring-white/10 hover:ring-white/30'
                }`}
                style={{
                  width: SLIDE_WIDTH * zoom,
                  height: SLIDE_HEIGHT * zoom,
                }}
              >
                <iframe
                  ref={(el) => handleIframeRef(el, slide.id)}
                  className="w-full h-full border-0 bg-white"
                  style={{
                    width: `${SLIDE_WIDTH}px`,
                    height: `${SLIDE_HEIGHT}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    pointerEvents: isPanning ? 'none' : 'auto',
                  }}
                  sandbox="allow-same-origin allow-scripts"
                  title={`Slide ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditingInline && editingElement && (() => {
        const slideIndex = editingElement.slideIndex !== undefined ? editingElement.slideIndex : currentSlideIndex;
        const iframe = iframesRef.current.get(slides[slideIndex].id);
        if (!iframe) return null;

        const doc = iframe.contentDocument;
        if (!doc) return null;

        const element = doc.querySelector(editingElement.selector) as HTMLElement;
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();

        const slideX = 100 + (slideIndex * (SLIDE_WIDTH * zoom + SLIDE_SPACING));
        const slideY = 100;

        const absoluteX = pan.x + slideX + rect.left;
        const absoluteY = pan.y + slideY + rect.top;

        return (
          <textarea
            value={inlineText}
            onChange={(e) => setInlineText(e.target.value)}
            onBlur={finishInlineEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishInlineEditing();
              } else if (e.key === 'Escape') {
                setIsEditingInline(false);
                setEditingElement(null);
              }
            }}
            autoFocus
            style={{
              position: 'absolute',
              left: `${absoluteX}px`,
              top: `${absoluteY}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              border: '3px solid #10b981',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.3)',
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
          />
        );
      })()}

      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm space-y-1">
        <div>🖱️ Click + Drag to pan</div>
        <div>⌨️ Ctrl + Scroll to zoom</div>
        <div>🎯 Double-click text to edit</div>
      </div>
    </div>
  );
};

export default FigmaStyleCanvas;
