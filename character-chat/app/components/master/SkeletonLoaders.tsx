"use client";

import React from 'react';

export const SkeletonCard = () => (
  <div className="aspect-[3/4] rounded-[32px] bg-[#1c1816] border border-white/5 animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
       <div className="h-6 w-3/4 bg-white/10 rounded-md"></div>
       <div className="flex gap-2">
         <div className="h-3 w-8 bg-white/10 rounded-md"></div>
         <div className="h-3 w-1/4 bg-white/10 rounded-md"></div>
       </div>
       <div className="h-3 w-1/2 bg-white/10 rounded-md"></div>
    </div>
    <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/5"></div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 animate-pulse">
    <div className="flex items-center gap-4 w-full">
      <div className="h-12 w-12 rounded-xl bg-white/10"></div>
      <div className="space-y-2 flex-1 max-w-[200px]">
        <div className="h-3 w-2/3 bg-white/10 rounded"></div>
        <div className="h-2 w-full bg-white/10 rounded"></div>
      </div>
    </div>
    <div className="h-8 w-8 rounded-full bg-white/10"></div>
  </div>
);
