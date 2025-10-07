import React, { useEffect, useRef } from 'react';

interface SlideCanvasProps {
  htmlContent: string;
  zoom: number;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({ htmlContent, zoom }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

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
