import React from 'react';
import { OutlineSection } from '../types';
import { Edit2, Check, Play } from 'lucide-react';

interface OutlineViewerProps {
    sections: OutlineSection[];
    onWriteSection: (section: OutlineSection) => void;
    currentWritingSectionId?: string;
}

const OutlineViewer: React.FC<OutlineViewerProps> = ({
    sections,
    onWriteSection,
    currentWritingSectionId
}) => {
    if (!sections || sections.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p>No outline generated yet.</p>
                <p className="text-sm mt-2">Use the Planning Agent to create one.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Outline</h3>
            <div className="space-y-3">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={`p-4 rounded-lg border ${section.status === 'done'
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : section.status === 'writing' || currentWritingSectionId === section.id
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Section {index + 1}
                                </span>
                                <h4 className="font-medium text-gray-900 dark:text-white">{section.title}</h4>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">{section.wordCount} words</span>
                                {section.status === 'done' ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <button
                                        onClick={() => onWriteSection(section)}
                                        disabled={section.status === 'writing' || !!currentWritingSectionId}
                                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${section.status === 'writing' || !!currentWritingSectionId
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'text-blue-600'
                                            }`}
                                        title="Write this section"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {section.keyPoints && section.keyPoints.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {section.keyPoints.map((point, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                        <span className="mr-1.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OutlineViewer;
