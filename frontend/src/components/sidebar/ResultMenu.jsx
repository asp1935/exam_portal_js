import React, { useState } from 'react'

function ResultMenu() {
 const [isMenuOpen, setMenuOpen] = useState(true);
     const [isSectionOpen, setSectionOpen] = useState({});
 
     const toggaleMenu = () => {
         setMenuOpen(!isMenuOpen);
     }
 
     const toggaleSection = (section) => {
         setSectionOpen((prev) => ({
             ...prev, [section]: !prev[section]
         }))
     }
     const menuData = [
         { title: 'District', items: ['Add District', 'District List'] },
         { title: 'Taluka', items: ['Add Taluka', 'Taluka List'] },
         { title: 'Center', items: ['Add Center', 'Center List', 'Add Representative', 'Representative List'] },
         { title: 'School', items: ['Add School', 'School List'] },
         { title: 'Student', items: ['Add Student', 'Student List'] }
     ];
     return (
         <div className='w-[20vw] shadow fixed left-0 h-[93vh] overflow-y-scroll'>
             <div className='w-full flex justify-center  bg-lime-100 p-2 sticky top-0'>
                 <h2 className='underline underline-offset-2 text-[1.4vw]'>Menu</h2>
             </div>
             <ul className='my-2'>
                 <li className=' px-3 py-2  text-[1.3vw] font-[500] flex justify-between items-center cursor-pointer hover:shadow hover:bg-lime-50 '
                     onClick={toggaleMenu}>
                     <h3 className=''><i className="ri-group-line pr-2 "></i>Student</h3>
                     <i className={isMenuOpen ? 'ri-subtract-fill' : 'ri-add-fill'}></i>
                 </li>
                 {isMenuOpen && (<ul className='ms-9 my-1'>
                     {menuData.map((section) => (
                         <li key={section.title} className='p-1.5 text-[1.2vw] font-[500] cursor-pointer' onClick={()=>toggaleSection(section.title)}>- {section.title}
                             {isSectionOpen[section.title] && (
                                 <ul className='ms-10'>
                                     {section.items.map((item) => (
                                         <li key={item} className='p-1.5 text-[1.1vw] font-normal'>
                                             <i className="ri-arrow-right-s-line"></i>
                                             <span className='hover:underline cursor-pointer'>{item}</span>
                                         </li>
 
                                     ))}
                                 </ul>
                             )}
                         </li>
                     ))}
                 </ul>
                 )}
             </ul>
             <div>
 
             </div>
         </div>
     )
}

export default ResultMenu
