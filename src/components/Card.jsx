import React, { useState } from "react";
import { Star } from 'lucide-react';
import AnimatedProgressBar from './AnimatedProgressBar';

const Card = ({
  title,
  description,
  totalInvested,
  capacity,
  assetType,
  redemption,
  lockin,
  backgroundImageUrl,
  provider,
  hashtag,
  activestatus,
  floatingapy,
  paymentmethods,
  onClick
}) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    setIsWatchlisted(!isWatchlisted);
  };

  return (
    <div 
      className="relative w-full min-w-[162px] max-w-[320px] mx-auto group"
      onClick={() => onClick?.({
        title,
        description,
        totalInvested,
        capacity,
        assetType,
        redemption,
        lockin,
        backgroundImageUrl,
        provider,
        hashtag,
        activestatus,
        floatingapy,
        paymentmethods
      })}
    >
      <div className="relative">
        {/* Shimmer border effect */}
        <div className="absolute -inset-[1px] rounded-[30px]">
          {/* Base border */}
          <div className="absolute inset-0 rounded-[30px] border border-white/20" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-[30px] overflow-hidden">
            <div 
              className="w-[400%] h-full absolute top-0 left-0 animate-shimmer-border"
              style={{
                background: `linear-gradient(
                  90deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.1) 20%, 
                  rgba(255,255,255,0.4) 50%,
                  rgba(255,255,255,0.1) 80%,
                  transparent 100%
                )`,
              }}
            />
          </div>
        </div>

        {/* Card glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-[30px] blur opacity-50 group-hover:opacity-75 transition duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-[30px] group-hover:from-pink-600/20 group-hover:to-purple-600/20 transition duration-300" />
        
        {/* Main card content */}
        <div className="relative aspect-[0.85/1] rounded-[30px] overflow-hidden shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center rounded-[30px]"
            style={{ 
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'linear-gradient(to bottom, #1a1a1a, #2a2a2a)',
              filter: 'brightness(0.9) saturate(1.1)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-[30px]" />
          <div className="absolute inset-0 bg-[#d71921]/10" />

          {/* Watchlist Button */}
          <button 
            onClick={handleWatchlistClick}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/60"
          >
            <Star 
              className={`w-4 h-4 transition-colors duration-300 ${
                isWatchlisted ? 'text-[#ea5151] fill-[#ea5151]' : 'text-white'
              }`}
            />
          </button>

          {/* Top Tags */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <span className="px-2 py-1 bg-[rgba(18,24,39)] rounded text-[10px] text-white">
              {hashtag}
            </span>
            {activestatus && (
              <span className="px-2 py-1 bg-[#24ce5c] rounded text-[10px] text-white">
                {activestatus}
              </span>
            )}
          </div>

          {/* APY Display */}
          <div className="absolute top-[85px] left-[12px] w-[100px] h-[56px] z-[153]">
            {/* Glass effect background */}
            <div 
              className="absolute inset-0 bg-[url(../assets/images/167eca60-f360-4f24-aa55-955107a446c7.png)] bg-cover bg-no-repeat rounded-[3.085px] z-[154]"
            />
            
            <div className="relative flex flex-col justify-center h-full px-[12px] z-[155]">
              <span className="block font-['Poppins'] text-[11px] font-medium leading-[11px] text-white capitalize">
                Variable APY
              </span>
              
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-['Poppins'] text-[24px] font-bold leading-[22px] text-white capitalize">
                  {floatingapy}
                </span>
                <span className="font-['Poppins'] text-[8px] font-normal leading-[10px] text-white/70 capitalize">
                  avg
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-black/80 rounded-b-[30px]">
            {/* Provider */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/70">By</span>
                <span className="text-[10px] font-bold text-[#fcd7d2]">{provider}</span>
                <svg 
                  className="w-3 h-3 text-[#24ce5c]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M9 12l2 2 4-4" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="9" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
              
              <span className="text-[9px] text-white px-1 py-1 rounded">
                {paymentmethods}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <AnimatedProgressBar 
              initialProgress={0}
              targetProgress={(parseInt(totalInvested.replace(/\D/g, '')) / parseInt(capacity.replace(/\D/g, ''))) * 100}
            />

            {/* Investment Details */}
            <div className="flex justify-between text-[10px] text-white/70 mb-1">
              <span>{totalInvested}</span>
              <span>{capacity}</span>
            </div>

            {/* Title and Description */}
            <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">
              {title}
            </h3>
            <p className="text-[10px] text-white/70 mb-3 line-clamp-2">
              {description}
            </p>

            {/* Asset Details */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] text-white/70 mb-1">Asset Type</span>
                  <span className="text-[11px] font-medium text-white capitalize">{assetType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-white/70 mb-1">Redemption</span>
                  <span className="text-[11px] font-medium text-white capitalize">{redemption}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-white/70 mb-1">Lock-in</span>
                  <span className="text-[11px] font-medium text-white">{lockin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;