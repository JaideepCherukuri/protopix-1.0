// src/page/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { useAccount } from 'wagmi';
import ConnectButton from '../ConnectButton';
import { useNavigate } from 'react-router-dom';

export default function Main() {
  const { address, isConnected } = useAccount();
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      setShowAccountDetails(true);
    }
  }, [isConnected]);

  const handleGetStartedClick = useCallback(() => {
    // Handle Get Started button click
    navigate('/explore-pixx');
  }, [navigate]);

  return (
    <div className='main-container w-full h-[712px] bg-[#fff] relative overflow-hidden my-0'>
      <div className='flex justify-center mt-[15px]'>
      <div className='w-[100px] h-[55.426px] justify-center bg-[url(../assets/images/88cca3ec36b6f0c91537a22e4330d73de84434b3.png)] bg-cover bg-no-repeat relative  mt-[5px] mr-0 mb-0 ml-[0px]' />
      </div>
      <span className="flex w-full h-[122px] justify-center items-center font-['Poppins'] text-[18px] font-[275] leading-[30px] text-[#353534] relative text-center z-[12] mt-[20.574px] mr-0 mb-0 ml-[-4px]">
        One marketplace,
        <br />
        for global alternate investments.
      </span>

      {/* Background Image Layer */}
      <div className='background-image-layer w-full h-[calc(100%-189px)] bg-[url(../assets/images/pop.png)] bg-cover bg-no-repeat absolute top-[calc(50%+94.5px)] left-0 z-[2]' />

      {/* Glassmorphism Effect */}
      <div className='glassmorphism w-full h-[415px] absolute bottom-0 left-1/2 translate-x-[-50%] translate-y-0 overflow-hidden z-[3]'>
        <div className='flex w-full h-[158px] pt-0 pr-[24px] pb-0 pl-[24px] justify-center items-center flex-nowrap relative z-[4] mt-[84px] mr-0 mb-0 ml-0'>
          <div className="h-[120px] grow shrink-0 basis-0 font-['Poppins'] text-[20px] font-normal leading-[40px] tracking-[0.02px] relative text-center z-5">
            <span className="font-['Poppins'] text-[18px] font-light leading-[40px] text-[#ef2a43] tracking-[0.02px] relative text-center">
              Unlock blue-chip opportunities
              <br />
            </span>
            <span className="font-['Poppins'] text-[15px] font-light leading-[40px] text-[#170e2b] tracking-[0.02px] relative text-center">
              that were previously reserved for institutional investors
            </span>
          </div>
        </div>
    
        <div className='flex w-full pt-0 pr-[24px] pb-0 pl-[24px] justify-center items-center flex-nowrap relative z-[4] mt-[33px] mr-0 mb-0 ml-0'>
          {isConnected ? (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <span className="font-['Poppins'] text-[15px] font-light leading-[22.5px] text-[#170e2b] tracking-[0.02px] relative text-center">
                  <ConnectButton accountStatus="avatar" chainStatus="icon"/>
                </span>
                <button
                  className='w-[150px] h-[54px] border-none relative overflow-hidden z-[4] pointer mt-[19px]'
                  onClick={handleGetStartedClick}
                >
                  <div className='w-[150px] h-[54px] absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] overflow-hidden z-[5]'>
                    <div className='w-[99.49%] h-[98.59%] bg-[url(../assets/images/2cb2c165-29ab-4f5e-a4dc-ed7120efc5dc.png)] bg-[length:100%_100%] bg-no-repeat absolute top-[0.7%] left-[0.25%] z-[6]' />
                    <div className='w-full h-full bg-[url(../assets/images/8e7f9430-18c2-4b3f-a1c2-cd4ae6b8b383.png)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[7]' />
                    <span className="flex w-[57.33%] h-[27.78%] justify-center items-start font-['Poppins'] text-[15px] font-normal leading-[15px] text-[#fff] absolute top-[37.04%] left-[24%] text-center whitespace-nowrap z-[8]">
                      Explore Pixx
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ConnectButton accountStatus="avatar" chainStatus="icon"/>
            </div>
          )}
        </div>
      </div>

      {/* Sphere Image */}
      <div className='w-[189px] h-[189px] bg-[url(../assets/images/66c9fb4e-36b1-43a1-9a28-c9d2eddb9fcc.png)] bg-cover bg-no-repeat absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-74.6%] z-[1]' />
    </div>
  );
}