import React from 'react';
import { motion } from 'framer-motion';

interface TemplateSelectorProps {
  currentTemplate: string;
  onTemplateChange: (templateId: string) => void;
  isLoading: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onTemplateChange,
  isLoading,
}) => {
  const templates = ['1', '2', '3', '4', '5', '6'];

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Template</h3>
      <div className="grid grid-cols-6 gap-2">
        {templates.map((templateId) => (
          <motion.button
            key={templateId}
            onClick={() => onTemplateChange(templateId)}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative aspect-square rounded-lg border-2 transition-all ${
              currentTemplate === templateId
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
              {templateId}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
