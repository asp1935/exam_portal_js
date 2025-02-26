import React from 'react'
import StudentMenu from './StudentMenu'
import { NavLink } from 'react-router'

function Sidebar() {
    return (
        <div className='w-[20vw] shadow fixed left-0 h-[93vh] overflow-y-scroll'>
            <div className='w-full flex justify-center  bg-lime-100 p-2 sticky top-0'>
                <h2 className='underline underline-offset-2 text-[1.4vw]'>Menu</h2>
            </div>
            <div className='mt-2'>
                <NavLink to={'/'} className=' px-3 py-2  text-[1.3vw] font-[500] flex justify-between items-center cursor-pointer hover:shadow hover:bg-lime-50 '>
                    <h3 className=''><i className="ri-home-4-line"></i> Home</h3>
                    
                </NavLink>
            </div>
            <StudentMenu />
        </div>
    )
}

export default Sidebar
