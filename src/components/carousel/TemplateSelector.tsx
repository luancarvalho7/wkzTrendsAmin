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
    <div className="bg-black border-b border-white/20 p-4">
      <h3 className="text-sm font-medium text-white mb-3">Template</h3>
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
                ? 'border-white bg-white/20'
                : 'border-white/20 hover:border-white/40 bg-white/5'
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
