import React from 'react'
import AddRepresentative from '../components/Representative/AddRepresentative'
import RepresentativeList from '../components/Representative/RepresentativeList'

function Representative() {
  return (
    <div className='w-full'>
      <AddRepresentative/>
      <RepresentativeList/>
    </div>
  )
}

export default Representative
