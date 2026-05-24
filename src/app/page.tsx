"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Plus, Mic, ArrowUp, Globe } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isPlanMode, setIsPlanMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#fafafa]">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-sky-200/60 via-sky-50/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-orange-100/80 via-orange-50/20 to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <div className="w-4 h-1 bg-white rounded-full translate-y-[-2px]"></div>
            <div className="w-4 h-1 bg-white rounded-full translate-y-[2px] absolute"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900">Ai-App-Generator</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <Link href="#" className="hover:text-neutral-900 transition-colors flex items-center gap-1">Product <ChevronDownIcon /></Link>
          <Link href="#" className="hover:text-neutral-900 transition-colors flex items-center gap-1">Use Cases <ChevronDownIcon /></Link>
          <Link href="#" className="hover:text-neutral-900 transition-colors flex items-center gap-1">Resources <ChevronDownIcon /></Link>
          <Link href="#" className="hover:text-neutral-900 transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-neutral-900 transition-colors">Enterprise</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-neutral-500 hover:text-neutral-900 transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          <Link 
            href="/dashboard" 
            className="bg-[#e4ff7a] text-neutral-900 px-5 py-2 rounded-full font-medium text-sm hover:bg-[#d4ef6a] transition-all shadow-sm"
          >
            Start Building
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-24 text-center max-w-4xl mx-auto w-full">
        
        <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-sm mb-8">
          <span className="bg-gradient-to-r from-orange-300 to-orange-400 text-orange-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
          <span className="text-sm font-medium text-neutral-700 flex items-center gap-1">
            Say hello to your AI App Builder <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-neutral-900 mb-6 font-sans">
          Turn your ideas into apps
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-600 mb-12 max-w-2xl">
          Ai-App-Generator lets you build fully-functional apps in minutes with just your words. No coding necessary.
        </p>

        {/* Search / Prompt Box */}
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-2 mb-12 relative overflow-hidden group focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-neutral-200/80 transition-all duration-300">
          <div className="min-h-[120px] p-4 flex flex-col">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Make a note-taking app that syncs..."
              className="w-full resize-none text-xl text-neutral-800 placeholder-neutral-400 focus:outline-none bg-transparent flex-1"
              rows={2}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-neutral-400">
                <button className="hover:text-neutral-700 transition-colors p-2 rounded-full hover:bg-neutral-100"><Plus className="w-5 h-5" /></button>
                <div className="flex items-center gap-2 px-2 border-l border-neutral-200">
                  <button 
                    onClick={() => setIsPlanMode(!isPlanMode)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${isPlanMode ? 'bg-orange-500' : 'bg-neutral-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${isPlanMode ? 'left-5' : 'left-1'}`} />
                  </button>
                  <span className="text-sm font-medium text-neutral-600 flex items-center gap-1">
                    Plan <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors p-2 rounded-full hover:bg-neutral-100">
                  <Mic className="w-5 h-5" />
                </button>
                <Link 
                  href={prompt.length > 0 ? `/dashboard?prompt=${encodeURIComponent(prompt)}` : "#"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${prompt.length > 0 ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 cursor-pointer' : 'bg-orange-300 cursor-not-allowed'}`}
                >
                  <ArrowUp className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">Not sure where to start? Try one of these:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Reporting Dashboard", 
              "Gaming Platform", 
              "Onboarding Portal", 
              "Room Visualizer", 
              "Networking App"
            ].map((suggestion) => (
              <button 
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
