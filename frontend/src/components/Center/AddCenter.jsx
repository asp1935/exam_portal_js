import React, { useState } from 'react'
import CustomDropdown from '../CustomDropdown'
import { useDistricts } from '../../hooks/useDistricts';
import { useDispatch } from 'react-redux';
import { useAddCenter } from '../../hooks/useCenters';
import { showToast } from '../../redux/slice/ToastSlice';
import { useTalukas } from '../../hooks/useTalukas';

function AddCenter() {
    const { data: districts } = useDistricts();
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedTalukaId, setSelectedTalukaId] = useState(null);
    const dispatch = useDispatch();
    const addCenterMutation = useAddCenter();
    const { data: talukas } = useTalukas(selectedDistrictId);
    const [centerName, setCenterName] = useState();
    const handleSubmit = (e) => {
        e.preventDefault();

        if (centerName.trim() !== '') {
            addCenterMutation.mutate({ talukaId: selectedTalukaId, centerName: (centerName.trim()) }, {
                onSuccess: () => dispatch(showToast({ message: "Center added successfully!" })),
                onError: (error) => dispatch(showToast({ message: error, type: 'error' })),
            })


        }

    }
    
    return (
        <>
            <div className='w-full px-20 py-8 '>
                <div className='w-full shadow-xl rounded-2xl overflow-hidden border border-gray-50'>
                    <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
                        Add Center
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
                                <div className=''>
                                    <label htmlFor="center" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Center Name</span> <i className="ri-ball-pen-line"></i></label>
                                    <input
                                        type='text'
                                        name='center'
                                        value={centerName}
                                        onChange={(e) => setCenterName(e.target.value)}
                                        placeholder='Enter Center Name...'
                                        className='w-[25vw] outline-0 border rounded pl-2 py-1 ms-3'
                                        required

                                    />
                                </div>
                            </div>

                            <div className='w-full h-full flex justify-end mt-5'>
                                <button
                                    type='submit'
                                    className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                                    disabled={addCenterMutation.isLoading}>
                                    {addCenterMutation.isPending ? 'Adding' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className='w-full mx-10 border border-gray-400     justify-self-center'></div>
        </>
    )
}

export default AddCenter
