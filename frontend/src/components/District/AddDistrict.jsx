import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { showToast } from '../../redux/slice/ToastSlice';
import { useAddDistrict } from '../../hooks/useDistricts';

function AddDistrict() {
    const [districtName, setdistrictName] = useState();
    const dispatch=useDispatch();

    const addDistrictMutation=useAddDistrict();


    const handleSubmit = (e) => {
        e.preventDefault();
        if(districtName.trim()!==''){
            addDistrictMutation.mutate(districtName.trim(),{
                onSuccess:() => dispatch(showToast({message:"District added successfully!"})),
                onError: (error) => dispatch(showToast({message:error,type:'error'})),
            })
        }

    }



    return (
        <>
        <div className='w-full px-20 py-10 '>
            <div className='w-full shadow rounded-2xl overflow-hidden border border-gray-50'>
                <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
                    Add District
                </h1>
                <div className='w-full  my-5 px-5 py-2 '>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="district" className='block text-sm mb-2.5'>District Name <i className="ri-ball-pen-line"></i></label>
                        <input
                            type='text'
                            name='district'
                            value={districtName}
                            onChange={(e) => setdistrictName(e.target.value)}
                            placeholder='Enter District Name...'
                            className='w-[40vw] outline-0 border rounded pl-2 py-1 '
                            required
                            
                        />

                        <div className='w-full flex justify-end mt-3'>
                            <button
                                type='submit'
                                className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                                disabled={addDistrictMutation.isLoading}>
                                {addDistrictMutation.isPending?'Adding':'Add'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className='w-full mx-10 border border-gray-400     justify-self-center'></div>
        </>
        
    )
}

export default AddDistrict
