import React from 'react';
import Navigation from '../components/Navigation';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Privacy Policy</h1>
                <p className="text-sm text-slate-500 mb-12">Last Updated: November 27, 2024</p>

                <div className="prose prose-slate max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Welcome to AgentWrite ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered writing platform.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            By using AgentWrite, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">2.1 Personal Information</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Account information (name, email address, password)</li>
                            <li>Profile information (display name, profile picture)</li>
                            <li>Payment information (processed securely through Stripe)</li>
                            <li>Communication data (support inquiries, feedback)</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">2.2 Content Data</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We store the content you create using our platform, including:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Writing projects and documents</li>
                            <li>AI-generated content and outlines</li>
                            <li>Project metadata (titles, genres, word counts)</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">2.3 Usage Data</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We automatically collect information about your use of the platform:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Device information (browser type, operating system)</li>
                            <li>IP address and location data</li>
                            <li>Usage patterns (features accessed, time spent)</li>
                            <li>Performance data (errors, page load times)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process your payments and manage subscriptions</li>
                            <li>Send you technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Analyze usage patterns to enhance user experience</li>
                            <li>Detect, prevent, and address technical issues and fraud</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. AI and Third-Party Services</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            AgentWrite uses third-party AI services to power content generation:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li><strong>Google Gemini API:</strong> Your content may be processed by Google's AI models to generate outlines and writing suggestions. Google's privacy policy applies to this processing.</li>
                            <li><strong>Supabase:</strong> We use Supabase for data storage and user authentication. Your data is stored securely in accordance with Supabase's security standards.</li>
                            <li><strong>Stripe:</strong> Payment information is processed by Stripe. We do not store your full credit card details.</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            We recommend reviewing the privacy policies of these third-party providers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We implement industry-standard security measures to protect your personal information:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Encryption of data in transit (HTTPS/TLS)</li>
                            <li>Encryption of sensitive data at rest</li>
                            <li>Regular security audits and updates</li>
                            <li>Restricted access to personal information</li>
                            <li>Secure authentication mechanisms</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights (GDPR Compliance)</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li><strong>Access:</strong> You can request a copy of your personal data</li>
                            <li><strong>Correction:</strong> You can update or correct inaccurate data</li>
                            <li><strong>Deletion:</strong> You can request deletion of your data</li>
                            <li><strong>Portability:</strong> You can request a copy of your data in a portable format</li>
                            <li><strong>Objection:</strong> You can object to certain processing of your data</li>
                            <li><strong>Restriction:</strong> You can request restriction of processing</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            To exercise these rights, please contact us at privacy@agentwood.xyz
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Cookies and Tracking</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We use cookies and similar tracking technologies to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Maintain your session and keep you logged in</li>
                            <li>Remember your preferences</li>
                            <li>Analyze site traffic and usage patterns</li>
                            <li>Improve our services</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Data Retention</h2>
                        <p className="text-slate-700 leading-relaxed">
                            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days, except where required to retain it by law.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Children's Privacy</h2>
                        <p className="text-slate-700 leading-relaxed">
                            AgentWrite is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to This Policy</h2>
                        <p className="text-slate-700 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Contact Us</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <p className="text-slate-800 font-medium">AgentWrite (a subsidiary of Agentwood)</p>
                            <p className="text-slate-700">Email: privacy@agentwood.xyz</p>
                            <p className="text-slate-700">Website: https://agentwrite.netlify.app</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
