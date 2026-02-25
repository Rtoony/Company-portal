import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 z-20 pointer-events-none">
      <div className="bg-neutral-100/90 border-4 border-amber-600 px-8 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm transform rotate-1">
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-full"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-full"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-full"></div>
        
        <h1 className="text-2xl font-black text-neutral-900 tracking-widest uppercase text-center border-b-2 border-neutral-900 pb-1 mb-1">
          CAD STANDARDS
        </h1>
        <h2 className="text-sm font-bold text-neutral-700 tracking-widest uppercase text-center">
          LIBRARY
        </h2>
      </div>
    </div>
  );
};