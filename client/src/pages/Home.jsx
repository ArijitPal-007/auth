import React from 'react'
import Navber from '../components/Navber'
import Header from '../components/Header'

function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen
    bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Navber/>
      <Header/>
    </div>
  )
}

export default Home
