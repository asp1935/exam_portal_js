import React from 'react'
import { Outlet } from 'react-router'
import Sidebar from './sidebar/Sidebar'

function Home() {
  return (
    <div className='flex '>
      <div className='w-[20vw] '>
        <Sidebar />
      </div>
      <div className='w-[80vw]'>
        <Outlet />
      </div>
    </div>
  )
}

export default Home
