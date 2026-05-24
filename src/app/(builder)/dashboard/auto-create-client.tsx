"use client";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { createApp } from "./actions";

export function AutoCreateApp({ prompt }: { prompt: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Automatically submit the form on mount
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-6" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Generating your application...</h2>
      <p className="text-gray-500 max-w-md">We are setting up your app based on: <span className="italic text-gray-700">"{prompt}"</span></p>
      
      <form ref={formRef} action={createApp} className="hidden">
        <input type="hidden" name="prompt" value={prompt} />
      </form>
    </div>
  );
}
