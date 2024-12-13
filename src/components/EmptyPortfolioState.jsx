import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  TrendingUp, 
  Shield, 
  DollarSign,
  ChevronRight
} from 'lucide-react';

const EmptyPortfolioState = ({ onExplore }) => {
  const features = [
    {
      icon: TrendingUp,
      title: "High Yield Returns",
      description: "Access institutional-grade alternative investments with competitive APY",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Asset Security",
      description: "Your investments are secured by real-world assets",
      color: "green"
    },
    {
      icon: DollarSign,
      title: "Start Small",
      description: "Begin with as little as $1 and build your portfolio",
      color: "purple"
    }
  ];

  return (
    <div className="py-8 px-4">
      {/* Header Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Rocket className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Start Your Investment Journey
        </h2>
        <p className="text-gray-600 max-w-sm mx-auto">
          Build a diversified portfolio of alternative investments and earn passive income
        </p>
      </motion.div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExplore}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
        >
          <span>Explore Investment Opportunities</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-gray-900">8+</div>
            <div className="text-gray-600">Asset Classes</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">9-25%</div>
            <div className="text-gray-600">APY Range</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">$1M+</div>
            <div className="text-gray-600">Total Invested</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyPortfolioState; 