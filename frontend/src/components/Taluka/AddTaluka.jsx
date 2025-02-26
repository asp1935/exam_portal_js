import React, { useState } from 'react'
import { useDistricts } from '../../hooks/useDistricts';
import { useDispatch } from 'react-redux';
import { useAddTaluka } from '../../hooks/useTalukas';
import { showToast } from '../../redux/slice/ToastSlice';

function AddTaluka() {
    const { data: districts, isLoading, error } = useDistricts();
    const [talukaName, setTalukaName] = useState();
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);

    const dispatch = useDispatch();

    const addTalukaMutation = useAddTaluka();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (talukaName.trim() !== '') {
            addTalukaMutation.mutate({ districtId: selectedDistrictId, talukaName: (talukaName.trim()) }, {
                onSuccess: () => dispatch(showToast({ message: "Taluka added successfully!" })),
                onError: (error) => dispatch(showToast({ message: error, type: 'error' })),
            })


        }

    }

    return (
        <>
            <div className='w-full px-20 py-10 '>
                <div className='w-full shadow rounded-2xl overflow-hidden border border-gray-50'>
                    <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
                        Add Taluka
                    </h1>
                    <div className='w-full  my-5 px-5 py-2 '>
                        <form onSubmit={handleSubmit}>
                            <div className='w-full grid grid-cols-2'>
                                <div>
                                    <label htmlFor="districtDropdown" className='block text-sm mb-2.5'>Select District </label>
                                    <select
                                        onChange={(e) => setSelectedDistrictId(e.target.value)}
                                        value={selectedDistrictId || ""}
                                        className='border rounded p-1 ms-3 text-[1vw] absolute' required
                                    >
                                        <option value="">-- Select District --</option>
                                        {districts?.data?.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.districtName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="district" className='block text-sm mb-2.5'>Taluka Name <i className="ri-ball-pen-line"></i></label>
                                    <input
                                        type='text'
                                        name='district'
                                        value={talukaName}
                                        onChange={(e) => setTalukaName(e.target.value)}
                                        placeholder='Enter District Name...'
                                        className='w-5/6 outline-0 border rounded pl-2 py-1 ms-3'
                                        required

                                    />
                                </div>
                            </div>

                            <div className='w-full flex justify-end mt-5'>
                                <button
                                    type='submit'
                                    className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                                    disabled={addTalukaMutation.isLoading}>
                                    {addTalukaMutation.isPending ? 'Adding' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className='w-full mx-10 border border-gray-400     justify-self-center'></div>
        </>
    )
}

export default AddTaluka
