import React from 'react'
import UI_IMG from '../../assets/images/auth-img.png'

const AuthLayout = ({ children }) => {
  return <div className='flex'>
    <div className='w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'>
        <h2 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500'>LearnTrack</h2>
        {children}
    </div>

    <div className='hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-[url("/bg-img.png")] bg-no-repeat bg-cover bg-center overflow-hidden' >
        <img src={UI_IMG} className='w-64 lg:w-[90%]'/>
    </div>
  </div>;
}  

export default AuthLayout