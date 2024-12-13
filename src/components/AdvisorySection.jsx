import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Building2,
  Wine,
  Paintbrush,
  Ship,
  ChevronRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdvisorySection = ({ portfolioData, recommendations, onInvestClick }) => {
  // Calculate sector diversification
  const sectors = portfolioData.assets.reduce((acc, asset) => {
    const sector = asset.assetType || 'Other';
    acc[sector] = (acc[sector] || 0) + asset.value;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(sectors),
    datasets: [{
      data: Object.values(sectors),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', // blue
        'rgba(16, 185, 129, 0.8)', // green
        'rgba(245, 158, 11, 0.8)', // yellow
        'rgba(239, 68, 68, 0.8)',  // red
        'rgba(139, 92, 246, 0.8)', // purple
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="space-y-6">
      {/* Advisory Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Advisory Copilot</h2>
          <p className="text-sm text-gray-500">Personalized investment recommendations</p>
        </div>
      </motion.div>

      {/* Portfolio Insights */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Performance</span>
          </div>
          <div className="text-2xl font-semibold text-blue-600">
            {portfolioData.totalReturn.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Total Return</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Risk Score</span>
          </div>
          <div className="text-2xl font-semibold text-green-600">
            {calculateRiskScore(portfolioData)}
          </div>
          <div className="text-xs text-gray-500">Moderate</div>
        </motion.div>
      </div>

      {/* Sector Diversification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-4 shadow-sm mb-6"
      >
        <h3 className="text-sm font-medium text-gray-900 mb-4">Sector Diversification</h3>
        <div className="h-48 relative">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {Object.keys(sectors).length}
              </div>
              <div className="text-xs text-gray-500">Sectors</div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {Object.entries(sectors).map(([sector, value], index) => (
            <div key={sector} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                />
                <span className="text-sm text-gray-600">{sector}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {((value / portfolioData.totalValue) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Recommended Investments</h3>
        {recommendations.map((rec, index) => (
          <motion.button
            key={rec.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
            onClick={() => onInvestClick(rec)}
            className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${rec.backgroundImageUrl})` }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{rec.title}</div>
                <div className="text-sm text-gray-500">APY: {rec.floatingapy}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const calculateRiskScore = (portfolioData) => {
  // Calculate risk score based on diversification and asset types
  const diversificationScore = Math.min(portfolioData.assets.length * 10, 50);
  const sectorScore = Object.keys(portfolioData.assets.reduce((acc, asset) => {
    acc[asset.assetType] = true;
    return acc;
  }, {})).length * 10;
  
  return Math.min(Math.round((diversificationScore + sectorScore) / 2), 100);
};

export default AdvisorySection; 