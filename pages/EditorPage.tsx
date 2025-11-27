import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Save, Download, ArrowLeft, Layout,
    Sidebar, PanelRight, FileText, Settings
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

import { AgentOrchestrator } from '../services/agentService';
import { Project, OutlineSection, AgentTask } from '../types';
import AgentManagerPanel from '../components/AgentManagerPanel';
import OutlineViewer from '../components/OutlineViewer';

// Mock data for development (replace with Supabase calls later)
const MOCK_PROJECT: Project = {
    id: '1',
    userId: 'user-1',
    title: 'The Future of AI Agents',
    genre: 'Technical Article',
    targetWordCount: 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
};

const EditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [content, setContent] = useState('');
    const [outline, setOutline] = useState<OutlineSection[]>([]);
    const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    const orchestratorRef = useRef<AgentOrchestrator>(new AgentOrchestrator());
    const quillRef = useRef<ReactQuill>(null);

    // Initialize project
    useEffect(() => {
        // TODO: Fetch project from Supabase
        setProject(MOCK_PROJECT);

        // Load saved content/outline from local storage for demo
        const savedContent = localStorage.getItem(`doc_${id}_content`);
        const savedOutline = localStorage.getItem(`doc_${id}_outline`);
        const savedTasks = localStorage.getItem(`doc_${id}_tasks`);

        if (savedContent) setContent(savedContent);
        if (savedOutline) setOutline(JSON.parse(savedOutline));
        if (savedTasks) setAgentTasks(JSON.parse(savedTasks));
    }, [id]);

    // Autosave
    useEffect(() => {
        const timer = setTimeout(() => {
            if (project) {
                setIsSaving(true);
                // TODO: Save to Supabase
                localStorage.setItem(`doc_${id}_content`, content);
                localStorage.setItem(`doc_${id}_outline`, JSON.stringify(outline));
                localStorage.setItem(`doc_${id}_tasks`, JSON.stringify(agentTasks));

                setTimeout(() => setIsSaving(false), 800);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [content, outline, agentTasks, id, project]);

    const handleGenerateOutline = async () => {
        if (!project) return;

        const taskId = `task-${Date.now()}`;
        const newTask: AgentTask = {
            id: taskId,
            projectId: project.id,
            type: 'plan',
            status: 'running',
            payload: { title: project.title, genre: project.genre },
            createdAt: new Date().toISOString()
        };

        setAgentTasks(prev => [newTask, ...prev]);

        try {
            const sections = await orchestratorRef.current.executePlanningTask(
                project.id,
                project.title,
                project.genre,
                project.targetWordCount
            );

            setOutline(sections);

            setAgentTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t
            ));
        } catch (error) {
            console.error('Outline generation failed:', error);
            setAgentTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'error', error: 'Failed to generate outline' } : t
            ));
        }
    };

    const handleWriteSection = async (section: OutlineSection) => {
        if (!project) return;

        const taskId = `task-${Date.now()}`;
        const newTask: AgentTask = {
            id: taskId,
            projectId: project.id,
            type: 'write',
            status: 'running',
            payload: { sectionTitle: section.title, sectionId: section.id },
            createdAt: new Date().toISOString()
        };

        setAgentTasks(prev => [newTask, ...prev]);

        // Update section status
        setOutline(prev => prev.map(s =>
            s.id === section.id ? { ...s, status: 'writing' } : s
        ));

        try {
            // Get previous content for context (simplified: just last 1000 chars)
            const previousContext = [content.slice(-1000)];

            const sectionContent = await orchestratorRef.current.executeWritingTask(
                section,
                previousContext,
                project.genre,
                project.title
            );

            // Append content
            const newContent = content + `\n\n<h2>${section.title}</h2>\n${sectionContent}`;
            setContent(newContent);

            // Update task and section status
            setAgentTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t
            ));

            setOutline(prev => prev.map(s =>
                s.id === section.id ? { ...s, status: 'done', content: sectionContent } : s
            ));

        } catch (error) {
            console.error('Section writing failed:', error);
            setAgentTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'error', error: 'Failed to write section' } : t
            ));
            setOutline(prev => prev.map(s =>
                s.id === section.id ? { ...s, status: 'pending' } : s
            ));
        }
    };

    const handleExportPDF = () => {
        const element = document.createElement('div');
        element.innerHTML = `
      <h1>${project?.title}</h1>
      <p style="color: gray; margin-bottom: 20px;">${project?.genre} • ${new Date().toLocaleDateString()}</p>
      ${content}
    `;

        const opt = {
            margin: 1,
            filename: `${project?.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // @ts-ignore - html2pdf types are loose
        html2pdf().set(opt).from(element).save();
    };

    if (!project) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
                            {project.title}
                        </h1>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{project.genre}</span>
                            <span>•</span>
                            <span className={isSaving ? 'text-blue-500' : ''}>
                                {isSaving ? 'Saving...' : 'Saved'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                        className={`p-2 rounded-lg transition-colors ${showLeftSidebar ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="Toggle Outline"
                    >
                        <Sidebar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        className={`p-2 rounded-lg transition-colors ${showRightSidebar ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="Toggle Agent Manager"
                    >
                        <PanelRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: Outline */}
                {showLeftSidebar && (
                    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 shrink-0 transition-all">
                        <OutlineViewer
                            sections={outline}
                            onWriteSection={handleWriteSection}
                            currentWritingSectionId={agentTasks.find(t => t.status === 'running' && t.type === 'write')?.payload.sectionId}
                        />
                    </div>
                )}

                {/* Center: Editor */}
                <div className="flex-1 overflow-hidden flex flex-col relative bg-gray-50 dark:bg-gray-900">
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-sm min-h-[calc(100vh-8rem)] rounded-lg">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                className="h-full"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['clean']
                                    ]
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Agent Manager */}
                {showRightSidebar && (
                    <AgentManagerPanel
                        tasks={agentTasks}
                        isProcessing={agentTasks.some(t => t.status === 'running')}
                        onGenerateOutline={handleGenerateOutline}
                        hasOutline={outline.length > 0}
                    />
                )}
            </div>
        </div>
    );
};

export default EditorPage;
