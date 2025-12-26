"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
