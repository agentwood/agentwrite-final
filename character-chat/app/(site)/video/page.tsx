'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Play, Upload, Zap, Video, Image as ImageIcon, Check } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LockedFeature from '@/app/components/LockedFeature';
import { getSubscriptionStatus } from '@/lib/subscription';
import Image from 'next/image';

export default function VideoPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus(null).then(status => {
      setIsPremium(status.planId !== 'free');
      setLoading(false);
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Video className="w-5 h-5" />
                <span className="text-sm font-semibold">AvatarFX</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
                Make Images Come to Life
              </h1>
              <p className="text-xl lg:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8 leading-relaxed">
                Transform your character images into animated videos. Bring your AI personas to life with AI-powered video generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Try AvatarFX
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 mb-4">How It Works</h2>
              <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                Create animated videos from character images in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">1. Upload Image</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Upload a character image or choose from your existing personas
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">2. AI Processing</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Our AI analyzes and animates your character with natural movements
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">3. Download Video</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Get your animated video ready to share or use in your projects
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-20 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 mb-4">See It In Action</h2>
              <p className="text-xl text-zinc-600">Watch how characters come to life</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before/After Example */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Before</h3>
                <div className="aspect-video bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                  <ImageIcon className="w-16 h-16 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-600">Static character image</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">After</h3>
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-20 h-20 text-indigo-600 opacity-50" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-semibold text-indigo-600">Animated</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600">Animated character video</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-zinc-900 mb-4">Create Your Video</h2>
              <p className="text-xl text-zinc-600">
                Upload a character image to get started
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !isPremium ? (
              <LockedFeature
                featureName="AvatarFX Video Generation"
                planRequired="starter"
                className="min-h-[400px]"
              >
                <div className="bg-zinc-50 rounded-2xl p-12 border-2 border-dashed border-zinc-300">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-10 h-10 text-indigo-600" />
                    </div>
                    <p className="text-sm text-zinc-500">Upload an image to generate video</p>
                  </div>
                </div>
              </LockedFeature>
            ) : (
            <div className="bg-zinc-50 rounded-2xl p-12 border-2 border-dashed border-zinc-300">
              {!uploadedImage ? (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-indigo-600" />
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
                      <Upload className="w-5 h-5" />
                      Choose Image
                    </div>
                  </label>
                  <p className="text-sm text-zinc-500 mt-4">PNG, JPG, or WEBP up to 10MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-64 h-64 rounded-2xl object-cover shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="px-6 py-3 bg-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-300 transition-all"
                    >
                      Change Image
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <Video className="w-5 h-5" />
                      Generate Video
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Animate Your Characters?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of creators bringing their AI characters to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/discover"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all"
              >
                <Video className="mr-2 w-5 h-5" />
                Start Creating
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white rounded-xl font-semibold text-lg hover:bg-indigo-800 transition-all border border-indigo-500"
              >
                View Examples
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

