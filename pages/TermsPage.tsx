import React from 'react';
import Navigation from '../components/Navigation';

const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Terms of Service</h1>
                <p className="text-sm text-slate-500 mb-12">Last Updated: November 27, 2024</p>

                <div className="prose prose-slate max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Welcome to AgentWrite, a product of Agentwood. By accessing or using our AI-powered writing platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            AgentWrite is an AI-powered writing platform that helps users create long-form content through:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>AI-assisted outline generation</li>
                            <li>Automated content writing and continuation</li>
                            <li>Multi-format content export (PDF, etc.)</li>
                            <li>Project management and organization tools</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Account Registration</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            To use certain features of the Service, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Notify us immediately of any unauthorized use</li>
                            <li>Be responsible for all activities under your account</li>
                            <li>Not share your account with others</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            You must be at least 13 years old to create an account. If you are under 18, you must have parental consent.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Subscription Plans and Payment</h2>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.1 Plans</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            AgentWrite offers various subscription plans with different features and credit allocations. Plan details and pricing are available on our pricing page.
                        </p>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.2 Payment</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            By subscribing to a paid plan, you agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Pay all fees associated with your chosen plan</li>
                            <li>Provide valid payment information</li>
                            <li>Authorize automatic recurring charges (for monthly/annual plans)</li>
                            <li>Pay applicable taxes, if any</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.3 Billing Cycle</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Subscriptions are billed in advance on a monthly or annual basis. Your subscription will automatically renew unless you cancel before the renewal date.
                        </p>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.4 Cancellation</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. No refunds will be provided for partial months or years, except as required by law.
                        </p>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.5 Lifetime Deal Terms</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Our limited-time Lifetime Deal offers:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>12 months of Unlimited plan access for a one-time payment</li>
                            <li>Non-transferable and non-refundable after 30 days</li>
                            <li>Subject to availability (limited to first 1,000 customers)</li>
                            <li>Does not auto-renew; standard pricing applies after 12 months</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">4.6 Refund Policy</h3>
                        <p className="text-slate-700 leading-relaxed">
                            We offer a 30-day money-back guarantee for first-time subscribers. To request a refund, contact support@agentwood.xyz within 30 days of your initial purchase.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. User Content and Ownership</h2>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">5.1 Your Content</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            You retain all ownership rights to content you create using AgentWrite. By using our Service, you grant us a limited license to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Store, display, and process your content to provide the Service</li>
                            <li>Use anonymized, aggregated data for service improvement</li>
                            <li>Create backups for data protection</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">5.2 AI-Generated Content</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Content generated by our AI models is provided to you, and you may use it freely. However:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>You are responsible for reviewing and editing AI-generated content</li>
                            <li>We do not guarantee the accuracy, originality, or quality of AI outputs</li>
                            <li>You should not rely solely on AI-generated content without review</li>
                            <li>You are responsible for ensuring your content does not infringe third-party rights</li>
                        </ul>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">5.3 Prohibited Content</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            You agree not to create, store, or share content that:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Violates any applicable laws or regulations</li>
                            <li>Infringes on intellectual property rights</li>
                            <li>Contains hate speech, harassment, or discrimination</li>
                            <li>Promotes violence or illegal activities</li>
                            <li>Contains malware or harmful code</li>
                            <li>Violates the privacy rights of others</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Acceptable Use Policy</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            You agree to use the Service only for lawful purposes. You must not:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Use automated tools to access the Service without permission</li>
                            <li>Reverse engineer or attempt to extract source code</li>
                            <li>Resell, redistribute, or sublicense the Service</li>
                            <li>Use the Service to compete with AgentWrite</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Credit System</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            AgentWrite uses a credit-based system:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Credits are consumed when using AI features</li>
                            <li>Monthly credits reset at the beginning of each billing cycle</li>
                            <li>Unused credits do not roll over (except for Max plan)</li>
                            <li>Additional credits may be purchased separately</li>
                            <li>Credits have no cash value and are non-refundable</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Intellectual Property</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            The Service, including all software, design, text, graphics, and logos, is owned by Agentwood and protected by copyright and trademark laws. You may not:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Copy, modify, or distribute our intellectual property</li>
                            <li>Use our trademarks without permission</li>
                            <li>Remove or alter copyright or trademark notices</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Disclaimers and Limitations of Liability</h2>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">9.1 Service "As Is"</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">9.2 Limitation of Liability</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENTWOOD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                        </p>

                        <h3 className="text-xl font-medium text-slate-800 mb-3">9.3 Maximum Liability</h3>
                        <p className="text-slate-700 leading-relaxed">
                            In no event shall our total liability exceed the amount you paid us in the 12 months preceding the claim.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Indemnification</h2>
                        <p className="text-slate-700 leading-relaxed">
                            You agree to indemnify and hold harmless Agentwood, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from your use of the Service or violation of these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Termination</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We may suspend or terminate your account at any time for:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                            <li>Violation of these Terms</li>
                            <li>Fraudulent or illegal activity</li>
                            <li>Extended non-payment</li>
                            <li>Upon your request</li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed">
                            Upon termination, you will lose access to your account and all associated data. We may retain certain information as required by law.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Governing Law and Disputes</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to Terms</h2>
                        <p className="text-slate-700 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a notice on our website. Your continued use of the Service after changes constitutes acceptance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Contact Information</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            For questions about these Terms, please contact us at:
                        </p>
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <p className="text-slate-800 font-medium">AgentWrite (a subsidiary of Agentwood)</p>
                            <p className="text-slate-700">Email: support@agentwood.xyz</p>
                            <p className="text-slate-700">Website: https://agentwrite.netlify.app</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
