import React, { useEffect, useRef, useState } from 'react';

interface SlideCanvasProps {
  htmlContent: string;
  zoom: number;
  isAutoLayout: boolean;
  onLayoutChange?: (layoutData: { elementOrder?: string[]; positions?: { [key: string]: { x: number; y: number } } }) => void;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({ htmlContent, zoom, isAutoLayout, onLayoutChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          setupDragAndDrop(doc);
        }, 100);
      }
    }
  }, [htmlContent, isAutoLayout]);

  const setupDragAndDrop = (doc: Document) => {
    const draggableElements = doc.querySelectorAll('[data-editable]');

    draggableElements.forEach((element) => {
      const el = element as HTMLElement;
      el.style.cursor = 'move';
      el.style.userSelect = 'none';

      el.addEventListener('mousedown', (e: MouseEvent) => handleMouseDown(e, el, doc));
    });
  };

  const handleMouseDown = (e: MouseEvent, element: HTMLElement, doc: Document) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedElement(element);

    const rect = element.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return;

      const parent = element.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();

      if (isAutoLayout) {
        const mouseY = e.clientY - parentRect.top;
        const siblings = Array.from(parent.children).filter(
          (child) => child.hasAttribute('data-editable')
        ) as HTMLElement[];

        const currentIndex = siblings.indexOf(element);
        let targetIndex = currentIndex;

        siblings.forEach((sibling, index) => {
          if (sibling === element) return;
          const siblingRect = sibling.getBoundingClientRect();
          const siblingCenter = siblingRect.top + siblingRect.height / 2 - parentRect.top;

          if (mouseY < siblingCenter && index < currentIndex) {
            targetIndex = Math.min(targetIndex, index);
          } else if (mouseY > siblingCenter && index > currentIndex) {
            targetIndex = Math.max(targetIndex, index);
          }
        });

        if (targetIndex !== currentIndex) {
          if (targetIndex < currentIndex) {
            parent.insertBefore(element, siblings[targetIndex]);
          } else {
            parent.insertBefore(element, siblings[targetIndex].nextSibling);
          }

          if (onLayoutChange) {
            const newOrder = Array.from(parent.children)
              .filter((child) => child.hasAttribute('data-editable'))
              .map((child) => child.getAttribute('data-editable') || '');
            onLayoutChange({ elementOrder: newOrder });
          }
        }
      } else {
        const x = e.clientX - parentRect.left - dragStart.x;
        const y = e.clientY - parentRect.top - dragStart.y;

        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.zIndex = '1000';

        if (onLayoutChange) {
          const elementId = element.getAttribute('data-editable') || '';
          onLayoutChange({
            positions: {
              [elementId]: { x, y },
            },
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedElement(null);
      doc.removeEventListener('mousemove', handleMouseMove);
      doc.removeEventListener('mouseup', handleMouseUp);
    };

    doc.addEventListener('mousemove', handleMouseMove);
    doc.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-900 overflow-auto p-8">
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
        }}
      >
        <iframe
          ref={iframeRef}
          title="Slide Preview"
          className="bg-white rounded-lg shadow-2xl"
          style={{
            width: '1080px',
            height: '1350px',
            border: 'none',
          }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

export default SlideCanvas;
