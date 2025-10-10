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

  const SLIDE_WIDTH = 1080;
  const SLIDE_HEIGHT = 1920;
  const SLIDE_SPACING = 100;

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
    if (e.button === 0 && (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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

        const mouseEnterHandler = () => {
          if (!isEditingInline && selectedElement?.selector !== elementInfo.selector) {
            element.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
          }
        };

        const mouseLeaveHandler = () => {
          if (selectedElement?.selector !== elementInfo.selector) {
            element.style.outline = 'none';
          }
        };

        const clickHandler = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          onSlideIndexChange(slideIndex);

          const styles = getElementStyles(elementInfo.element);
          onElementSelect(elementInfo);
          if (onStyleChange) {
            onStyleChange(elementInfo, styles);
          }
        };

        element.addEventListener('mouseenter', mouseEnterHandler);
        element.addEventListener('mouseleave', mouseLeaveHandler);
        element.addEventListener('click', clickHandler);
      });
    }, 100);
  }, [selectedElement, isEditingInline, onElementSelect, onStyleChange, onSlideIndexChange]);

  useEffect(() => {
    slides.forEach((slide, index) => {
      const iframe = iframesRef.current.get(slide.id);
      if (iframe) {
        setupSlideContent(iframe, slide.htmlContent, index);
      }
    });
  }, [slides, setupSlideContent]);

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
        className="absolute"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div className="flex items-start" style={{ gap: `${SLIDE_SPACING}px`, padding: '100px' }}>
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
                className={`relative w-full h-full rounded-lg overflow-hidden shadow-2xl transition-all ${
                  index === currentSlideIndex
                    ? 'ring-4 ring-blue-500'
                    : 'ring-2 ring-white/10 hover:ring-white/30'
                }`}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: SLIDE_WIDTH,
                  height: SLIDE_HEIGHT,
                }}
              >
                <iframe
                  ref={(el) => handleIframeRef(el, slide.id)}
                  className="w-full h-full border-0 bg-white pointer-events-auto"
                  style={{
                    width: `${SLIDE_WIDTH}px`,
                    height: `${SLIDE_HEIGHT}px`,
                  }}
                  sandbox="allow-same-origin allow-scripts"
                  title={`Slide ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm space-y-1">
        <div>🖱️ Click + Drag to pan</div>
        <div>⌨️ Ctrl + Scroll to zoom</div>
        <div>🎯 Click element to select</div>
      </div>
    </div>
  );
};

export default FigmaStyleCanvas;
