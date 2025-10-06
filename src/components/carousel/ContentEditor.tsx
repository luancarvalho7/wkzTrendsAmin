import React from 'react';
import { SlideContent } from '../../types/carousel';

interface ContentEditorProps {
  content: SlideContent;
  onContentChange: (key: keyof SlideContent, value: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onContentChange }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Content</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Title</label>
          <textarea
            value={content.title || ''}
            onChange={(e) => onContentChange('title', e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Enter slide title..."
          />
        </div>

        {content.subtitle !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Subtitle</label>
            <textarea
              value={content.subtitle || ''}
              onChange={(e) => onContentChange('subtitle', e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
