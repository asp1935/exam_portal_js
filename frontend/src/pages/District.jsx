import React from 'react'
import AddDistrict from '../components/District/AddDistrict'
import DistrictList from '../components/District/DistrictList'

function District() {
  return (
    <div className='w-full'>
      <AddDistrict/>
      <DistrictList/>
    </div>
  )
}

export default District
