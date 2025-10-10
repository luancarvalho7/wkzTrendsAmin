import React from 'react';
import { SlideContent } from '../types/carousel';

interface ContentEditorProps {
  content: SlideContent;
  onContentChange: (key: keyof SlideContent, value: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onContentChange }) => {
  return (
    <div className="bg-black border-b border-white/20 p-4">
      <h3 className="text-sm font-medium text-white mb-3">Content</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">Title</label>
          <textarea
            value={content.title || ''}
            onChange={(e) => onContentChange('title', e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none placeholder-white/40"
            rows={3}
            placeholder="Enter slide title..."
          />
        </div>

        {content.subtitle !== undefined && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Subtitle</label>
            <textarea
              value={content.subtitle || ''}
              onChange={(e) => onContentChange('subtitle', e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none placeholder-white/40"
              rows={2}
              placeholder="Enter slide subtitle..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;
