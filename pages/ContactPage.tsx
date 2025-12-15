import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Send } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const ContactPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Reset success message after 5 seconds
            setTimeout(() => setSubmitStatus('idle'), 5000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Contact Us - AgentWrite Support</title>
                <meta name="description" content="Get in touch with AgentWrite support team. We're here to help with questions, feedback, or technical issues." />
                <link rel="canonical" href="https://agentwriteai.com/contact" />
            </Helmet>
            <StructuredData type="WebSite" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">Get in Touch</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Have a question, feedback, or need help? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="font-serif text-2xl text-slate-900 mb-6">Send us a message</h2>
                            
                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                                    <p className="font-medium">Message sent successfully! We'll get back to you soon.</p>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                    <p className="font-medium">Something went wrong. Please try again or email us directly.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="support">Technical Support</option>
                                        <option value="billing">Billing Question</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>Sending...</>
                                    ) : (
                                        <>
                                            <Send size={18} /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                                <h2 className="font-serif text-2xl text-slate-900 mb-6">Other ways to reach us</h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <Mail size={20} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                                            <a href="mailto:support@agentwood.xyz" className="text-indigo-600 hover:text-indigo-700 transition">
                                                support@agentwood.xyz
                                            </a>
                                            <p className="text-sm text-slate-600 mt-1">We typically respond within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <MessageSquare size={20} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">Discord</h3>
                                            <a 
                                                href="https://discord.com/invite/agentwood" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-700 transition"
                                            >
                                                Join our Discord community
                                            </a>
                                            <p className="text-sm text-slate-600 mt-1">Get real-time help from our community</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                                <h3 className="font-bold text-slate-900 mb-2">Before you contact us</h3>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li>• Check our <button onClick={() => navigate('/help')} className="text-indigo-600 hover:text-indigo-700 underline text-left">Help Center</button> for common questions</li>
                                    <li>• Browse our <button onClick={() => navigate('/faq')} className="text-indigo-600 hover:text-indigo-700 underline text-left">FAQ</button> for quick answers</li>
                                    <li>• Review our <button onClick={() => navigate('/changelog')} className="text-indigo-600 hover:text-indigo-700 underline text-left">Changelog</button> for recent updates</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;

