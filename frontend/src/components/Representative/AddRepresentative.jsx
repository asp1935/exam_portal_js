import React, { useState } from 'react'
import { useCenters } from '../../hooks/useCenters'
import { useDistricts } from '../../hooks/useDistricts';
import { useDispatch } from 'react-redux';
import { useAddRepresenatative } from '../../hooks/useRepresentative';
import { useTalukas } from '../../hooks/useTalukas';
import { showToast } from '../../redux/slice/ToastSlice';
import CustomDropdown from '../CustomDropdown';

function AddRepresentative() {
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(selectedDistrictId);
  const { data: centers } = useCenters(selectedDistrictId,selectedTalukaId);
  const addRepresentativeMutation = useAddRepresenatative();
  const dispatch = useDispatch();
  const [representative, setRepresentative] = useState({
    repName: '',
    repMobile: ''
  });
  const [errors, setErrors] = useState({
    repName:'',
    repMobile:'',
    repCenter:'',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setRepresentative({ ...representative, [name]: value });
  }


  const validateForm = () => {
    const newErrors = {};
    if(!selectedCenterId){
      newErrors.repCenter='Please Select Center '
    }
    if (!representative.repName.trim()) {
      newErrors.repName = 'Name is required.';
    }

    if (typeof Number(representative.repMobile) !== 'number') {
      newErrors.repMobile = 'Mobile Number  is required.';
    } else if (representative.repMobile.toString().length !== 10) {
      newErrors.repMobile = 'Invalid Mobile Number';
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      addRepresentativeMutation.mutate({
        centerId: selectedCenterId, repName: (representative.repName).trim(), repMobile: Number(representative.repMobile)
      }, {
        onSuccess: () => dispatch(showToast({ message: "Representative added successfully!" })),
        onError: (error) => dispatch(showToast({ message: error, type: 'error' })),
      })


    }

  }
  return (
    <>
      <div className='w-full px-20 py-8 '>
        <div className='w-full shadow-xl rounded-2xl overflow-hidden border border-gray-50'>
          <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
            Add Representative
          </h1>
          <div className='w-full  my-3 px-5 py-2 min-h-56'>
            <form onSubmit={handleSubmit}>
              <div className='w-full grid grid-cols-2 gap-y-5'>
                <div>
                  <label htmlFor="districtDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select District</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' />

                </div>
                <div>
                  <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Taluka</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={talukas} selectedValue={selectedTalukaId} setSelectedValue={setSelectedTalukaId} placeholder='Select Taluka' labelKey='talukaName' disable={selectedDistrictId ? false : true} />

                </div>
                <div>
                  <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Center</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={centers} selectedValue={selectedCenterId} setSelectedValue={setSelectedCenterId} placeholder='Select Center' labelKey='centerName' disable={selectedTalukaId ? false : true} />
                  {errors.repCenter && (
                                <p className='text-red-500 text-sm mt-1'>{errors.repCenter}</p>
                            )}
                </div>
                <div className=''>
                  <label htmlFor="representative" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Representative Name</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='repName'
                    value={representative.repName}
                    onChange={handleChange}
                    placeholder='Enter Representative Name...'
                    className='w-[25vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required

                  />
                   {errors.repName && (
                                <p className='text-red-500 text-sm mt-1'>{errors.repName}</p>
                            )}
                </div>
                <div className=''>
                  <label htmlFor="represenatative" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Mobile No.</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='repMobile'
                    value={representative.repMobile}
                    onChange={handleChange}
                    placeholder='Enter Mobile Number...'
                    className='w-[25vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required

                  />
                   {errors.repMobile && (
                                <p className='text-red-500 text-sm mt-1'>{errors.repMobile}</p>
                            )}
                </div>
              </div>

              <div className='w-full h-full flex justify-end mt-5'>
                <button
                  type='submit'
                  className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                  disabled={addRepresentativeMutation.isLoading}>
                  {addRepresentativeMutation.isPending ? 'Adding' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='w-full mx-10 border border-gray-400     justify-self-center'></div>
    </>
  )
}

export default AddRepresentative
