import React, { useEffect, useRef, useCallback } from 'react';

interface SlideCanvasProps {
  htmlContent: string;
  zoom: number;
  isAutoLayout: boolean;
  onLayoutChange?: (layoutData: { elementOrder?: string[]; positions?: { [key: string]: { x: number; y: number } } }) => void;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({ htmlContent, zoom, isAutoLayout, onLayoutChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onLayoutChangeRef = useRef(onLayoutChange);

  useEffect(() => {
    onLayoutChangeRef.current = onLayoutChange;
  }, [onLayoutChange]);

  const injectDragScript = useCallback((html: string) => {
    const dragScript = `
      <script>
        (function() {
          console.log('🎯 Drag script loaded');

          let dragState = {
            isDragging: false,
            element: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
          };

          const isAutoLayout = ${isAutoLayout};

          function setupDraggables() {
            console.log('🔧 Setting up draggables, isAutoLayout:', isAutoLayout);
            const elements = document.querySelectorAll('[data-editable]');
            console.log('📦 Found elements:', elements.length);

            elements.forEach((el, index) => {
              console.log('✅ Setting up element', index, el.getAttribute('data-editable'));

              el.style.userSelect = 'none';
              el.style.transition = 'outline 0.2s';

              if (isAutoLayout) {
                el.style.cursor = 'move';
                el.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
              } else {
                el.style.cursor = 'grab';
                el.style.outline = '2px dashed rgba(34, 197, 94, 0.5)';
              }

              el.addEventListener('mouseenter', function() {
                if (!dragState.isDragging) {
                  this.style.outline = isAutoLayout
                    ? '2px solid rgba(59, 130, 246, 0.8)'
                    : '2px solid rgba(34, 197, 94, 0.8)';
                }
              });

              el.addEventListener('mouseleave', function() {
                if (!dragState.isDragging) {
                  this.style.outline = isAutoLayout
                    ? '2px dashed rgba(59, 130, 246, 0.5)'
                    : '2px dashed rgba(34, 197, 94, 0.5)';
                }
              });

              el.addEventListener('mousedown', function(e) {
                console.log('🖱️ Mousedown on', this.getAttribute('data-editable'));
                e.preventDefault();
                e.stopPropagation();

                const rect = this.getBoundingClientRect();
                this.style.cursor = 'grabbing';
                this.style.outline = '3px solid rgba(59, 130, 246, 1)';

                dragState = {
                  isDragging: true,
                  element: this,
                  startX: e.clientX,
                  startY: e.clientY,
                  offsetX: e.clientX - rect.left,
                  offsetY: e.clientY - rect.top
                };

                console.log('🚀 Drag started');
              });
            });

            document.addEventListener('mousemove', function(e) {
              if (!dragState.isDragging || !dragState.element) return;

              const element = dragState.element;
              const parent = element.parentElement;
              if (!parent) return;

              const parentRect = parent.getBoundingClientRect();

              if (isAutoLayout) {
                const mouseY = e.clientY;
                const siblings = Array.from(parent.children).filter(
                  child => child.hasAttribute('data-editable')
                );

                const currentIndex = siblings.indexOf(element);
                let targetIndex = currentIndex;

                siblings.forEach((sibling, index) => {
                  if (sibling === element) return;
                  const siblingRect = sibling.getBoundingClientRect();
                  const siblingCenter = siblingRect.top + siblingRect.height / 2;

                  if (mouseY < siblingCenter && index < currentIndex) {
                    targetIndex = Math.min(targetIndex, index);
                  } else if (mouseY > siblingCenter && index > currentIndex) {
                    targetIndex = Math.max(targetIndex, index);
                  }
                });

                if (targetIndex !== currentIndex) {
                  console.log('🔄 Reordering from', currentIndex, 'to', targetIndex);
                  if (targetIndex < currentIndex) {
                    parent.insertBefore(element, siblings[targetIndex]);
                  } else {
                    parent.insertBefore(element, siblings[targetIndex].nextSibling);
                  }

                  window.parent.postMessage({
                    type: 'LAYOUT_CHANGE',
                    data: {
                      elementOrder: Array.from(parent.children)
                        .filter(child => child.hasAttribute('data-editable'))
                        .map(child => child.getAttribute('data-editable'))
                    }
                  }, '*');
                }
              } else {
                const x = e.clientX - parentRect.left - dragState.offsetX;
                const y = e.clientY - parentRect.top - dragState.offsetY;

                element.style.position = 'absolute';
                element.style.left = x + 'px';
                element.style.top = y + 'px';
                element.style.zIndex = '1000';
              }
            });

            document.addEventListener('mouseup', function() {
              if (!dragState.isDragging) return;
              console.log('🛑 Drag ended');

              if (dragState.element) {
                const element = dragState.element;
                element.style.cursor = isAutoLayout ? 'move' : 'grab';
                element.style.outline = isAutoLayout
                  ? '2px dashed rgba(59, 130, 246, 0.5)'
                  : '2px dashed rgba(34, 197, 94, 0.5)';

                if (!isAutoLayout) {
                  const elementId = element.getAttribute('data-editable');
                  const x = parseFloat(element.style.left || '0');
                  const y = parseFloat(element.style.top || '0');

                  window.parent.postMessage({
                    type: 'LAYOUT_CHANGE',
                    data: {
                      positions: {
                        [elementId]: { x, y }
                      }
                    }
                  }, '*');
                }
              }

              dragState = {
                isDragging: false,
                element: null,
                startX: 0,
                startY: 0,
                offsetX: 0,
                offsetY: 0
              };
            });
          }

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupDraggables);
          } else {
            setupDraggables();
          }
        })();
      </script>
    `;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${dragScript}</body>`);
    } else {
      return html + dragScript;
    }
  }, [isAutoLayout]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LAYOUT_CHANGE' && onLayoutChangeRef.current) {
        console.log('📨 Received layout change:', event.data.data);
        onLayoutChangeRef.current(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    const htmlWithScript = injectDragScript(htmlContent);

    doc.open();
    doc.write(htmlWithScript);
    doc.close();

    console.log('🎨 Iframe content updated');
  }, [htmlContent, injectDragScript]);

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
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default SlideCanvas;
