import React from 'react';
import { AgentTask, OutlineSection } from '../types';
import AgentCard from './AgentCard';
import { Sparkles, Activity } from 'lucide-react';

interface AgentManagerPanelProps {
    tasks: AgentTask[];
    isProcessing: boolean;
    onGenerateOutline: () => void;
    hasOutline: boolean;
}

const AgentManagerPanel: React.FC<AgentManagerPanelProps> = ({
    tasks,
    isProcessing,
    onGenerateOutline,
    hasOutline
}) => {
    const activeTasks = tasks.filter(t => t.status === 'running' || t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'error').slice(0, 5); // Show last 5

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-80 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                <div className="flex items-center space-x-2 mb-1">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Manager</h2>
                </div>
                <p className="text-xs text-gray-500">Orchestrate your AI writing team</p>
            </div>

            <div className="p-4 space-y-6 flex-1">
                {/* Actions */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</h3>

                    {!hasOutline && (
                        <button
                            onClick={onGenerateOutline}
                            disabled={isProcessing}
                            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-white font-medium transition-all ${isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Outline</span>
                        </button>
                    )}
                </div>

                {/* Active Agents */}
                {activeTasks.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Active Agents</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{activeTasks.length}</span>
                        </h3>
                        <div className="space-y-2">
                            {activeTasks.map(task => (
                                <AgentCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}

                {/* History */}
                {completedTasks.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                        <div className="space-y-2">
                            {completedTasks.map(task => (
                                <AgentCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}

                {tasks.length === 0 && !hasOutline && (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No agents active.</p>
                        <p className="text-xs text-gray-400 mt-1">Start by generating an outline.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentManagerPanel;
