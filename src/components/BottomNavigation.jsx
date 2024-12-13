// src/components/BottomNavigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExploreClick = () => {
    navigate('/explore-pixx');
  };

  const handleAccountClick = () => {
    navigate('/account');
  };

  const handlePortfolioClick = () => {
    navigate('/portfolio');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className='fixed bottom-0 left-0 w-full z-[274] flex justify-center items-center'>
      <div className='relative w-full h-[50.445px] bg-[rgba(239,26,55,0.85)] flex justify-center items-center px-4'>
        <button
          className={`absolute left-12 flex flex-col items-center space-y-1 transition-transform duration-300 hover:scale-110 ${
            isActive('/portfolio') ? 'opacity-100' : 'opacity-70'
          }`}
          onClick={handlePortfolioClick}
        >
          <Briefcase className="w-[22px] h-[22px] text-white" />
          <span className="font-['Poppins'] text-[9.367396354675293px] font-medium leading-[14.988px] text-[#f2f2f2] tracking-[0.19px]">
            Portfolio
          </span>
        </button>

        <button
          className={`absolute right-12 flex flex-col items-center space-y-1 transition-transform duration-300 hover:scale-110 ${
            isActive('/account') ? 'opacity-100' : 'opacity-70'
          }`}
          onClick={handleAccountClick}
        >
          <User className="w-[22px] h-[22px] text-white" />
          <span className="font-['Poppins'] text-[9.367396354675293px] font-medium leading-[14.988px] text-[#f2f2f2] tracking-[0.19px]">
            Account
          </span>
        </button>

        <button
          className={`absolute w-[47.774px] h-[47.774px] bg-[url(../assets/images/b9pick.svg)] bg-cover bg-no-repeat z-[275] transition-transform duration-300 hover:scale-150 ${
            isActive('/explore-pixx') ? 'opacity-100' : 'opacity-70'
          }`}
          onClick={handleExploreClick}
        />
      </div>
    </div>
  );
};

export default BottomNavigation;