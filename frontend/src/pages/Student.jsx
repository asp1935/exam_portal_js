import React from 'react'
import AddStudent from '../components/Student/AddStudent'
import StudentList from '../components/Student/StudentList'

function Student() {
  return (
    <div className='w-full'>
      <AddStudent/>
      <StudentList/>
    </div>
  )
}

export default Student
