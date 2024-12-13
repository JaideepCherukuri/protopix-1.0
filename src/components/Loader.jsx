// src/components/Loader.jsx
import React from 'react';
import logo from '../assets/images/88cca3ec36b6f0c91537a22e4330d73de84434b3.png';

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full fixed inset-0 bg-white z-50">
      <div className='w-[100px] h-[55.426px] justify-center bg-[url(../assets/images/88cca3ec36b6f0c91537a22e4330d73de84434b3.png)] bg-cover bg-no-repeat relative mt-[5px] mr-0 mb-0 ml-[0px]' />
      <div className="loader mt-4"></div>
    </div>
  );
};

export default Loader;