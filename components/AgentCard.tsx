import React from 'react';
import { AgentTask } from '../types';
import { CheckCircle, Clock, AlertCircle, Loader2, FileText, PenTool, Search } from 'lucide-react';

interface AgentCardProps {
    task: AgentTask;
    onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ task, onClick }) => {
    const getIcon = () => {
        switch (task.type) {
            case 'plan':
                return <Search className="w-5 h-5 text-blue-500" />;
            case 'write':
                return <PenTool className="w-5 h-5 text-purple-500" />;
            case 'continue':
                return <FileText className="w-5 h-5 text-green-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case 'done':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'running':
                return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getLabel = () => {
        switch (task.type) {
            case 'plan':
                return 'Planning Agent';
            case 'write':
                return 'Writing Agent';
            case 'continue':
                return 'Continuation Agent';
            default:
                return 'Agent';
        }
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-3 cursor-pointer hover:shadow-md transition-shadow ${task.status === 'running' ? 'border-blue-300 dark:border-blue-800' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    {getIcon()}
                    <span className="font-medium text-gray-900 dark:text-gray-100">{getLabel()}</span>
                </div>
                {getStatusIcon()}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
                {task.status === 'running' && (
                    <span className="text-blue-600 dark:text-blue-400">Working...</span>
                )}
                {task.status === 'done' && (
                    <span className="text-green-600 dark:text-green-400">Completed</span>
                )}
                {task.status === 'error' && (
                    <span className="text-red-600 dark:text-red-400">Failed</span>
                )}
                {task.status === 'pending' && (
                    <span>Queued</span>
                )}
            </div>

            {task.type === 'write' && task.payload.sectionTitle && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    Section: {task.payload.sectionTitle}
                </div>
            )}
        </div>
    );
};

export default AgentCard;
