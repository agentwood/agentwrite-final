'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

export default function CreateVoicePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'consent' | 'upload' | 'processing' | 'result'>('consent');
    const [consentChecked, setConsentChecked] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; redirectUrl?: string } | null>(null);

    // Form fields
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [accent, setAccent] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !consentChecked) return;

        setStep('processing');
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('audio', selectedFile);
            formData.append('consent', 'true');
            formData.append('displayName', displayName || `My Voice ${Date.now()}`);
            formData.append('description', description);
            formData.append('gender', gender);
            formData.append('age', age);
            formData.append('accent', accent);

            const response = await fetch('/api/voice/upload', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: data.message,
                    redirectUrl: data.redirectUrl,
                });
                setStep('result');

                // Redirect to dashboard if approved
                if (data.redirectUrl) {
                    setTimeout(() => {
                        router.push(data.redirectUrl);
                    }, 2000);
                }
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Upload failed. Please try again.',
                });
                setStep('result');
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Network error. Please check your connection.',
            });
            setStep('result');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0f16] text-white">
            <div className="max-w-2xl mx-auto px-6 py-16">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Create Your Voice</h1>
                    <p className="text-gray-400">
                        Contribute your voice to Agentwood and earn rewards when it's used.
                    </p>
                </div>

                {/* Step: Consent */}
                {step === 'consent' && (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-xl font-semibold mb-6">Before You Begin</h2>

                        <div className="space-y-4 text-gray-300 mb-8">
                            <div className="flex gap-3">
                                <Check className="text-green-400 shrink-0 mt-1" size={18} />
                                <p>Your voice may be used by characters created by other users.</p>
                            </div>
                            <div className="flex gap-3">
                                <Check className="text-green-400 shrink-0 mt-1" size={18} />
                                <p>You will earn $AWS tokens based on usage (every 10 min = $0.01).</p>
                            </div>
                            <div className="flex gap-3">
                                <Check className="text-green-400 shrink-0 mt-1" size={18} />
                                <p>Rewards settle every 60 days. You choose: tokens or cash.</p>
                            </div>
                            <div className="flex gap-3">
                                <Check className="text-green-400 shrink-0 mt-1" size={18} />
                                <p>You can pause usage or opt-out of enterprise licensing anytime.</p>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer mb-8">
                            <input
                                type="checkbox"
                                checked={consentChecked}
                                onChange={(e) => setConsentChecked(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-300">
                                I agree to the <a href="/terms" className="text-purple-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-purple-400 hover:underline">Voice Contribution License</a>.
                            </span>
                        </label>

                        <button
                            onClick={() => consentChecked && setStep('upload')}
                            disabled={!consentChecked}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-indigo-500 transition-all"
                        >
                            I Accept & Continue
                        </button>
                    </div>
                )}

                {/* Step: Upload */}
                {step === 'upload' && (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-xl font-semibold mb-6">Upload Your Voice</h2>

                        {/* File Upload */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors mb-6"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Mic className="text-purple-400" size={24} />
                                    <span className="text-purple-400 font-medium">{selectedFile.name}</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto text-gray-500 mb-4" size={40} />
                                    <p className="text-gray-400">Click to upload or drag and drop</p>
                                    <p className="text-gray-600 text-sm mt-2">WAV, MP3, or WebM • 10-60 seconds • Max 10MB</p>
                                </>
                            )}
                        </div>

                        {/* Metadata Fields */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g., Warm British Male"
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="neutral">Neutral</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Age</label>
                                <select
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="">Select...</option>
                                    <option value="young">Young (18-30)</option>
                                    <option value="adult">Adult (30-50)</option>
                                    <option value="middle_aged">Middle-aged (50-65)</option>
                                    <option value="elderly">Elderly (65+)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Accent</label>
                                <input
                                    type="text"
                                    value={accent}
                                    onChange={(e) => setAccent(e.target.value)}
                                    placeholder="e.g., British RP"
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your voice..."
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload size={20} />
                            Upload Voice
                        </button>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                        <Loader2 className="mx-auto text-purple-400 animate-spin mb-6" size={48} />
                        <h2 className="text-xl font-semibold mb-2">Processing Your Voice</h2>
                        <p className="text-gray-400">Analyzing quality and generating acoustic profile...</p>
                    </div>
                )}

                {/* Step: Result */}
                {step === 'result' && result && (
                    <div className={`bg-white/5 rounded-2xl p-8 border ${result.success ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            {result.success ? (
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="text-green-400" size={24} />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="text-red-400" size={24} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold">{result.success ? 'Success!' : 'Upload Failed'}</h2>
                                <p className="text-gray-400">{result.message}</p>
                            </div>
                        </div>

                        {result.redirectUrl && (
                            <p className="text-purple-400 text-sm">Redirecting to your dashboard...</p>
                        )}

                        {!result.success && (
                            <button
                                onClick={() => {
                                    setStep('upload');
                                    setResult(null);
                                }}
                                className="w-full py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
