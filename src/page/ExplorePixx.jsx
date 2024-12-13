import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import './index.css';
import { TrendingUp, Star, Clock, ArrowUpRight } from 'lucide-react';
import AnimatedProgressBar from '../components/AnimatedProgressBar';

// Import images
import backgroundImage1 from '../assets/images/grow-card-dubai.png';
import backgroundImage2 from '../assets/images/grow-card-uk.png';
import backgroundImage3 from '../assets/images/grow-card-gold.png';
import backgroundImage4 from '../assets/images/grow-card-secure.png';
import backgroundImage5 from '../assets/images/grow-card-art.png';
import backgroundImage6 from '../assets/images/grow-card-wiskey.png';
import backgroundImage7 from '../assets/images/grow-card-marine.png';
import backgroundImage8 from '../assets/images/grow-card-ind.png';

const AutoScrollContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="overflow-visible">
      <div 
        ref={containerRef} 
        className="transform transition-all duration-300"
      >
        {children}
      </div>
    </div>
  );
};

const cardsData = [
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "Dubai Premium Real Estate Portfolio",
    description:
      "Invest in a curated portfolio of premium Dubai real estate properties.",
    totalInvested: "$180,000",
    capacity: "$250,000",
    assetType: "real estate",
    redemption: "bi-annual",
    lockin: "24 months",
    backgroundImageUrl: backgroundImage1,
    provider: "Pixx Finance",
    hashtag: "real estate",
    activestatus: "active",
    floatingapy: "9%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "UK Commercial Real Estate Fund",
    description:
      "Access institutional-grade commercial properties in prime UK locations.",
    totalInvested: "$90,000",
    capacity: "$150,000",
    assetType: "real estate",
    redemption: "quarterly",
    lockin: "12 months",
    backgroundImageUrl: backgroundImage2,
    provider: "Pixx Finance",
    hashtag: "real estate",
    activestatus: "active",
    floatingapy: "12%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "Gold-Backed Investment Pool",
    description:
      "Invest in physical gold stored in secure vaults with full insurance.",
    totalInvested: "$45,000",
    capacity: "$100,000",
    assetType: "precious metals",
    redemption: "instant",
    lockin: "7 days",
    backgroundImageUrl: backgroundImage3,
    provider: "Pixx Finance",
    hashtag: "commodity",
    activestatus: "active",
    floatingapy: "18%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "Secured Asset-Backed Lending",
    description:
      "High-yield lending opportunities secured by real assets and receivables.",
    totalInvested: "$120,000",
    capacity: "$200,000",
    assetType: "lending",
    redemption: "biennial",
    lockin: "24 months",
    backgroundImageUrl: backgroundImage4,
    provider: "Pixx Finance",
    hashtag: "working capital & leasehold",
    activestatus: "active",
    floatingapy: "22%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "Curated Whiskey & Fine Wine Investment",
    description:
      "Invest in a professionally curated portfolio of rare whiskeys and wines.",
    totalInvested: "$85,000",
    capacity: "$100,000",
    assetType: "whiskey",
    redemption: "annual",
    lockin: "6 months",
    backgroundImageUrl: backgroundImage5,
    provider: "Pixx Finance",
    hashtag: "alternative | niche",
    activestatus: "active",
    floatingapy: "25%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "Maritime investments: Navigating opportunities in shipping",
    description:
      "Invest fractionally in ships, giving you ownership in a high-value, tangible asset.",
    totalInvested: "$6,000",
    capacity: "$400,000",
    assetType: "ships",
    redemption: "biennial",
    lockin: "24 months",
    backgroundImageUrl: backgroundImage7,
    provider: "Pixx Finance",
    hashtag: "heavy assets | ships",
    activestatus: "active",
    floatingapy: "18%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
  {
    imageUrl: "../assets/images/f3805d1c-94c3-4330-b9db-802bdd11fd0c.png",
    title: "High-impact trade finance solutions",
    description:
      "Invest in trade finance and asset leasing, unlocking access to working capital opportunities.",
    totalInvested: "$4,000",
    capacity: "$180,000",
    assetType: "container rentals",
    redemption: "biennial",
    lockin: "24 months",
    backgroundImageUrl: backgroundImage8,
    provider: "Pixx Finance",
    hashtag: "working capital & leasehold",
    activestatus: "active",
    floatingapy: "22%",
    paymentmethods: "Stablecoins | Fiat | Crypto",
  },
];

const getGradientByType = (type) => {
  switch (type) {
    case 'real estate':
      return 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.9))';
    case 'wine':
    case 'whiskey':
    case 'liquor & spirits':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(185, 28, 28, 0.9))';
    case 'art':
    case 'art & collectibles':
      return 'linear-gradient(to bottom, rgba(168, 85, 247, 0.3), rgba(126, 34, 206, 0.9))';
    case 'marine':
    case 'ships':
      return 'linear-gradient(to bottom, rgba(6, 182, 212, 0.3), rgba(14, 116, 144, 0.9))';
    case 'precious metals':
    case 'gold':
      return 'linear-gradient(to bottom, rgba(234, 179, 8, 0.3), rgba(161, 98, 7, 0.9))';
    default:
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(18, 24, 39, 0.5))';
  }
};

const TrendingSection = () => {
  const { scrollY } = useScroll();
  // Reduced height for more rectangular shape
  const height = useTransform(scrollY, [0, 200], [220, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.95]);

  // Get the trending card
  const trendingCard = cardsData.find(card => card.title.toLowerCase().includes('whiskey'));
  const gradientOverlay = getGradientByType('whiskey');

  // Animation variants for the "Trending Now" text
  const trendingTextVariants = {
    animate: {
      scale: [1, 1.1, 1],
      color: ['#ffffff', '#ff4444', '#ffffff'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animation for "Filling Fast" text
  const fillingFastVariants = {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const navigate = useNavigate();

  return (
    <motion.div 
      style={{ 
        height,
        opacity,
        scale,
      }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#1f1f1f]/60" />
      
      <motion.div 
        className="relative z-10 p-6 h-full flex flex-col justify-between"
        style={{ 
          backgroundImage: `${gradientOverlay}, url(${backgroundImage6})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Trending Badge with animated text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="w-4 h-4 text-red-500" />
            </motion.div>
            <motion.span 
              variants={trendingTextVariants}
              animate="animate"
              className="text-sm font-medium"
            >
              Trending Now
            </motion.span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
            {trendingCard?.title || "Curated Whiskey & Fine Wine Investment"}
          </h2>

          {/* Stats Row */}
          <div className="flex items-center space-x-6">
            {/* Target Annual Return */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div className="flex flex-col">
                <span className="text-xs text-white/70">Target Annual Return</span>
                <span className="text-sm text-white font-medium">{trendingCard?.floatingapy || "25% APY"}</span>
              </div>
            </div>
            {/* Maturity Period */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-xs text-white/70">Maturity Period</span>
                <span className="text-sm text-white font-medium">{trendingCard?.lockin || "24 months"}</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/investment-detail', { state: trendingCard })}
            className="flex items-center space-x-2 bg-[#d71921] px-4 py-2 rounded-lg text-white shadow-lg hover:bg-[#b5171a] transition-colors"
          >
            <span>Invest Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Bar with Filling Fast text */}
        <div className="relative">
          <div className="flex justify-end mb-1">
            <motion.span 
              variants={fillingFastVariants}
              animate="animate"
              className="text-xs text-white/80"
            >
              Filling Fast
            </motion.span>
          </div>
          <div className="h-1 bg-white/20">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: '90%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Add this floating animation variant
const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3
    }
  }
};

export default function ExplorePixx() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = useCallback((card) => {
    setSelectedCard(card);
    navigate('/investment-detail', { state: { ...card } });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TrendingSection />

      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {cardsData.map((card, index) => (
              <motion.div
                key={card.title}
                variants={floatingAnimation}
                initial="initial"
                animate="animate"
                whileHover="hover"
                // Add staggered animation delay for each card
                custom={index}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                }}
                className="transform-gpu" // Use GPU acceleration for smoother animations
              >
                <button
                  className="w-full focus:outline-none"
                  onClick={() => handleCardClick(card)}
                  style={{ display: 'block', textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
                >
                  <Card {...card} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>
    </div>
  );
}