import React, { useState } from 'react'
import { useDistricts } from '../../hooks/useDistricts';
import { useTalukas } from '../../hooks/useTalukas';
import { useCenters } from '../../hooks/useCenters';
import { useAddSchool } from '../../hooks/useSchools';
import { useDispatch } from 'react-redux';
import { showToast } from '../../redux/slice/ToastSlice';
import CustomDropdown from '../CustomDropdown';

function AddSchool() {
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedTalukaId, setSelectedTalukaId] = useState(null);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const { data: districts } = useDistricts();
    const { data: talukas } = useTalukas(selectedDistrictId);
    const { data: centers } = useCenters(selectedDistrictId, selectedTalukaId);
    const addSchoolMutation = useAddSchool();
    const dispatch = useDispatch();
    const [schoolName, setSchoolName] = useState('');
    const [errors, setErrors] = useState({
        sName: '',
        sCenter: '',
    });

    const validateForm = () => {
        const newErrors = {};
        if (!selectedCenterId) {
            newErrors.sCenter = 'Please Select Center '
        }
        if (!schoolName.trim()) {
            newErrors.sName = 'School Name is required.';
        }
        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            addSchoolMutation.mutate({ centerId: selectedCenterId, schoolName: schoolName }, {
                onSuccess: () => {
                    dispatch(showToast({ message: "New School added Successfully!" }))
                    setSchoolName('')
                    setSelectedCenterId(null);
                    setSelectedDistrictId(null);
                    setSelectedTalukaId(null);
                },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' })),
            })


        }

    }
    return (
        <>
            <div className='w-full px-20 py-8 '>
                <div className='w-full shadow-xl rounded-2xl overflow-hidden border border-gray-50'>
                    <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
                        Add School
                    </h1>
                    <div className='w-full  my-3 px-5 py-2 min-h-56'>
                        <form onSubmit={handleSubmit}>
                            <div className='w-full grid grid-cols-2 gap-y-5'>
                                <div>
                                    <label htmlFor="districtDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select District</span> <i className="ri-arrow-down-s-line"></i> </label>
                                    <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' dheigth={20} />

                                </div>
                                <div>
                                    <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Taluka</span> <i className="ri-arrow-down-s-line"></i> </label>
                                    <CustomDropdown options={talukas} selectedValue={selectedTalukaId} setSelectedValue={setSelectedTalukaId} placeholder='Select Taluka' labelKey='talukaName' disable={selectedDistrictId ? false : true} />

                                </div>
                                <div>
                                    <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Center</span> <i className="ri-arrow-down-s-line"></i> </label>
                                    <CustomDropdown options={centers} selectedValue={selectedCenterId} setSelectedValue={setSelectedCenterId} placeholder='Select Center' labelKey='centerName' disable={selectedTalukaId ? false : true} />
                                    {errors.sCenter && (
                                        <p className='text-red-500 text-sm mt-1 pl-2'>{errors.sCenter}</p>
                                    )}
                                </div>
                                <div className=''>
                                    <label htmlFor="school" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>School Name</span> <i className="ri-ball-pen-line"></i></label>
                                    <input
                                        type='text'
                                        name='repName'
                                        value={schoolName}
                                        onChange={(e)=>setSchoolName(e.target.value)}
                                        placeholder='Enter School Name...'
                                        className='w-[25vw] outline-0 border rounded pl-2 py-1 ms-3'
                                        required

                                    />
                                    {errors.sName && (
                                        <p className='text-red-500 text-sm mt-1 pl-3'>{errors.sName}</p>
                                    )}
                                </div>
                                
                            </div>

                            <div className='w-full h-full flex justify-end mt-5'>
                                <button
                                    type='submit'
                                    className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                                    disabled={addSchoolMutation.isLoading}>
                                    {addSchoolMutation.isPending ? 'Adding' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className='w-full mx-10 border border-gray-400 justify-self-center'></div>
        </>
    )
}

export default AddSchool
