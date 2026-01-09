'use client';

import Sidebar from '@/app/components/Sidebar';
import { Sparkles, TrendingUp, DollarSign, Globe, Users, Brain, Mic, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen font-sans bg-[#0f0f0f] text-white">
      {/* Sidebar */}
      <Sidebar recentCharacters={[]} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 overflow-y-auto">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Powered by Tree-0</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Where AI Characters<br />Become Assets
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-center text-white/60 max-w-3xl mx-auto leading-relaxed">
              Agentwood is the world's first <span className="text-white font-semibold">premium AI character marketplace</span> where you don't just consume content—you create relationships, build assets, and own your connections.
            </p>
          </div>
        </section>

        {/* The Platform Section */}
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">The Platform</h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    While other platforms trap you in endless chats that go nowhere, Agentwood treats AI characters as <span className="text-white font-semibold">trainable, monetizable intellectual property</span>.
                  </p>
                  <p>
                    Our proprietary <span className="text-purple-400 font-semibold">Tree-0 engine</span> doesn't just simulate personality—it sculpts it. Train a character by uploading your therapy notes, sending voice memos, or fine-tuning their personality with precision sliders.
                  </p>
                  <p>
                    Then? <span className="text-white font-semibold">Sell that character.</span> Integrate it into your website. Use it to create content. License it to brands.
                  </p>
                  <p className="text-lg text-white font-semibold pt-2">
                    This is the platform where AI conversations become assets.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">150+ Premium Characters</h3>
                      <p className="text-sm text-white/60">Hand-crafted by Agentwood's creative team</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Marketplace Economy</h3>
                      <p className="text-sm text-white/60">Buy, sell, and license custom characters</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Off-Platform Usage</h3>
                      <p className="text-sm text-white/60">Deploy anywhere via API integration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Why Agentwood?</h2>
              <p className="text-white/60">The only platform built for creators and builders</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Marketplace</h3>
                <p className="text-sm text-white/60">Create custom AI characters and sell them on Agentwood's premium marketplace. Set your price, retain ownership, and earn from every interaction.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Off-Platform Integration</h3>
                <p className="text-sm text-white/60">Use your characters anywhere: embed them in your website, deploy as Discord bots, integrate via API. Your characters aren't trapped—they're portable IP.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Deep Training</h3>
                <p className="text-sm text-white/60">Upload PDFs, voice memos, personal notes, or conversation logs. Characters absorb your unique knowledge base and communication style.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Long-Term Memory</h3>
                <p className="text-sm text-white/60">Characters remember everything. Past conversations, preferences, inside jokes, your life context. Relationships deepen over time.</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Premium Voice Quality</h3>
                <p className="text-sm text-white/60">Powered by Tree-0 and studio-grade TTS, delivering the highest-quality conversational AI and voice authenticity in the market.</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Full Ownership</h3>
                <p className="text-sm text-white/60">You own what you create. License characters for content creation, business use, or integration. Your IP, your rules.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Agentwood vs The Rest</h2>
              <p className="text-white/60">See why creators choose Agentwood</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-white/10 rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-bold text-white/60">Feature</th>
                    <th className="text-center py-4 px-6 text-sm font-bold text-purple-400">Agentwood</th>
                    <th className="text-center py-4 px-6 text-sm font-bold text-white/40">Character.AI</th>
                    <th className="text-center py-4 px-6 text-sm font-bold text-white/40">Janitor.AI</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0f0f0f]">
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6 text-sm">Monetization</td>
                    <td className="py-4 px-6 text-center text-2xl">✅</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6 text-sm">Off-Platform Usage</td>
                    <td className="py-4 px-6 text-center text-2xl">✅</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6 text-sm">Character Ownership</td>
                    <td className="py-4 px-6 text-center text-2xl">✅</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6 text-sm">Voice Quality</td>
                    <td className="py-4 px-6 text-center text-sm text-emerald-400">Studio-grade</td>
                    <td className="py-4 px-6 text-center text-sm text-white/40">Text-only</td>
                    <td className="py-4 px-6 text-center text-sm text-white/40">Text-only</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-6 text-sm">Deep Training</td>
                    <td className="py-4 px-6 text-center text-2xl">✅</td>
                    <td className="py-4 px-6 text-center text-sm text-white/40">Limited</td>
                    <td className="py-4 px-6 text-center text-sm text-white/40">Basic</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-sm">Marketplace</td>
                    <td className="py-4 px-6 text-center text-2xl">✅</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                    <td className="py-4 px-6 text-center text-2xl">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center mt-8 text-white/60">
              <span className="text-white font-semibold">Character.AI</span> is for casual entertainment. <span className="text-white font-semibold">Janitor.AI</span> is for NSFW.{' '}
              <span className="text-purple-400 font-bold">Agentwood is for builders.</span>
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Ready to Build?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Creating Today
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Join the platform where AI characters become valuable assets. Create, train, sell, and deploy your own characters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/create"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                Create Your First Character
              </a>
              <a
                href="/home"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                Explore Characters
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
