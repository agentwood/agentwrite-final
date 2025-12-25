
import React from 'react';

const BLOG_POSTS = [
  {
    category: 'Video Marketing',
    title: 'Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024',
    description: 'Discover how AI video marketing tools are transforming content creation and learn strategies...',
    readTime: '8 min read'
  },
  {
    category: 'Video Ideas',
    title: '100 Video Ideas for Brands: AI-Generated Concepts That Convert',
    description: 'Never run out of video content ideas. Our AI-powered generator creates unlimited creative...',
    readTime: '6 min read'
  },
  {
    category: 'Content Marketing',
    title: 'Content Marketing Automation: Complete Guide to AI Tools',
    description: 'Streamline your content creation process with AI-powered automation tools and strategies.',
    readTime: '10 min read'
  }
];

const BlogSection: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-display text-zinc-900">Latest Updates</h2>
            <p className="text-h2 text-zinc-500 max-w-xl font-medium">
              Insights on AI collaboration and creation.
            </p>
          </div>
          <a href="#" className="text-small-ui text-zinc-500 hover:text-black transition-colors underline underline-offset-8">
            View All Posts
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post, i) => (
            <div key={i} className="group flex flex-col h-full cursor-pointer">
              <div className="aspect-[16/9] bg-zinc-100 rounded-[2rem] mb-8 overflow-hidden transition-all group-hover:shadow-2xl">
                <div className="w-full h-full bg-gradient-to-tr from-zinc-200 to-zinc-50"></div>
              </div>
              <span className="text-tiny-ui text-zinc-400 uppercase tracking-widest mb-3">
                {post.category}
              </span>
              <h3 className="text-h2 text-zinc-900 mb-4 group-hover:text-zinc-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-small-ui text-zinc-500 mb-6 flex-1 line-clamp-3">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-tiny-ui text-zinc-400 font-bold uppercase tracking-widest pt-6 border-t border-zinc-50">
                {post.readTime}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
