import React, { useState } from 'react'
import { NavLink } from 'react-router';

function StudentMenu() {

    const [isStudentOpen, setStudentOpen] = useState(true);
    const [isSectionOpen, setSectionOpen] = useState({});

    const toggaleMenu = () => {
        setStudentOpen(!isStudentOpen);
    }

    const toggaleSection = (section) => {
        setSectionOpen((prev) => ({
            ...prev, [section]: !prev[section]
        }))
    }
    const menuData = [
        { title: 'District', items: [{ name: 'Add District', path: '/district' }, { name: 'District List', path: '/district' }] },
        { title: 'Taluka', items: [{ name: 'Add Taluka', path: '/taluka' }, { name: 'Taluka List', path: '/taluka' }] },
        { title: 'Center', items: [{ name: 'Add Center', path: '/center' }, { name: 'Center List', path: '/center' }, { name: 'Add Representative', path: '/representative' }, { name: 'Representative List', path: '/representative' }] },
        { title: 'School', items: [{ name: 'Add School', path: '/add-school' }, { name: 'School List', path: '/school-list' }] },
        { title: 'Student', items: [{ name: 'Add Student', path: '/add-student' }, { name: 'Student List', path: '/student-list' }] }
    ];
    return (

        <ul className='my-2'>
            <li className=' px-3 py-2  text-[1.3vw] font-[500] flex justify-between items-center cursor-pointer hover:shadow hover:bg-lime-50 '
                onClick={toggaleMenu}>
                <NavLink to={'/'}><h3 className=''><i className="ri-group-line pr-2 "></i>Student</h3></NavLink>
                <i className={isStudentOpen ? 'ri-subtract-fill' : 'ri-add-fill'}></i>
            </li>
            {isStudentOpen && (<ul className='ms-9 my-1'>
                {menuData.map((section) => (
                    <li key={section.title} className='p-1.5 text-[1.2vw] font-[500] cursor-pointer' ><span onClick={() => toggaleSection(section.title)}><i className={isSectionOpen[section.title] ? 'ri-subtract-fill' : 'ri-add-fill'}></i> {section.title}</span>
                        {isSectionOpen[section.title] && (
                            <ul className='ms-10'>
                                {section.items.map((item) => (
                                    <li key={item.name} className='p-1.5 text-[1.1vw] font-normal'>
                                        <i className="ri-arrow-right-s-line"></i>
                                        <NavLink to={item.path} className='hover:underline cursor-pointer'>
                                            {item.name}
                                        </NavLink>
                                    </li>

                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            )}
        </ul>




    )
}

export default StudentMenu
