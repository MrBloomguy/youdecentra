import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="8" className="fill-primary" />
      <path 
        d="M10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20C30 22.5 29 24.5 27.5 26"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path 
        d="M14 24C14 21.7909 15.7909 20 18 20H22C24.2091 20 26 21.7909 26 24V28C26 28.5523 25.5523 29 25 29H15C14.4477 29 14 28.5523 14 28V24Z"
        fill="black"
      />
      <circle cx="16" cy="17" r="2" fill="black" />
      <circle cx="24" cy="17" r="2" fill="black" />
    </svg>
  );
};

export const LogoWithText: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo />
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">Decentralit</span>
        <span className="text-xs text-muted-foreground leading-tight">Decentralized Social Media</span>
      </div>
    </div>
  );
};

export default Logo;