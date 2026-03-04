import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 z-20 pointer-events-none">
      <div className="px-6 py-3 shadow-lg rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
        <h1 className="text-xl font-extrabold tracking-tight uppercase text-center pb-1 mb-1" style={{ color: 'var(--navy)', borderBottom: '2px solid var(--brred)' }}>
          CAD STANDARDS
        </h1>
        <h2 className="text-[10px] font-semibold tracking-widest uppercase text-center" style={{ color: 'var(--text-muted)' }}>
          Brelje &amp; Race
        </h2>
      </div>
    </div>
  );
};
