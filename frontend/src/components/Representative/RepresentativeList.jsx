import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useCenters } from '../../hooks/useCenters';
import { useDeleteRepresentative, useDownloadRepresenatativePDF, useRepresentative, useUpdateRepresenatative } from '../../hooks/useRepresentative';
import { showToast } from '../../redux/slice/ToastSlice';
import CustomDropdown from '../CustomDropdown';

function RepresentativeList() {
    const dispatch = useDispatch();

    const [rowId, setRowId] = useState(null); // row ID for edit delete
    const [editedRepInfo, setEditedRepInfo] = useState({
        newRepName: '', newRepMobile: ''
    }); // current content

    const [loading, setLoading] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    // const [selectedTalukaId, setSelectedTalukaId] = useState(null);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [errors,setErrors]=useState();

    const { data: centers } = useCenters();
    // const { data: talukas } = useTalukas();

    // const { data: districts, } = useDistricts();
    const { data: representatives, isLoading, error } = useRepresentative(selectedCenterId);
    const updateRepMutation = useUpdateRepresenatative();
    const deleteRepMuatation = useDeleteRepresentative();
    const { data: pdfUrl, refetch, isFetching } = useDownloadRepresenatativePDF(selectedCenterId);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedRepInfo({ ...editedRepInfo, [name]: value });
    }

    const handleDownload = () => {
        refetch();
    }

    useEffect(() => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
        }
    }, [pdfUrl]);


    const validateFields = () => {
        const newErrors={}
       
        if (!editedRepInfo.newRepName.trim()) {
            newErrors.repName = 'Name is required.';
        }
        

        if (!editedRepInfo.newRepMobile.trim()) {
            newErrors.repMobile = 'Mobile Number  is required.';
        } else if (!/^\d{10}$/.test(editedRepInfo.newRepMobile)) {
            newErrors.repMobile = 'Invalid Mobile Number';
        }
        setErrors(newErrors);

        // Return true  and error data if no errors
        return Object.keys(newErrors).length === 0 ? true : newErrors;
    };

    const handleEdit = async () => {
        setLoading(true);
        const validationErrors = validateFields(); 
        if (validationErrors === true){
            updateRepMutation.mutate({ id: rowId, newRepName: editedRepInfo.newRepName, newRepMobile: Number(editedRepInfo.newRepMobile) }, {
                onSuccess: () => { dispatch(showToast({ message: 'Center Name Updated Successfully...' })), setRowId(null), setEditedRepInfo({ newRepName: '', newRepMobile: '' }) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            },
            )
        }
        else{
            const firstErrorKey = Object.keys(validationErrors)[0]; 
            const firstErrorMessage = validationErrors[firstErrorKey];
    
            dispatch(showToast({ message: firstErrorMessage, type: 'warn' }));
        }
        setLoading(false)
    }
    const handleDelete = async (id) => {
        setIsDisable(true);
        if (window.confirm('Do you want to Delete Representative?')) {
            deleteRepMuatation.mutate({ id }, {
                onSuccess: () => { dispatch(showToast({ message: 'Representative Deleted Successfully...' })) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            })
        }
        setIsDisable(false);
    }

    // useEffect(() => {
    //     setSelectedTalukaId(null)
    // }, [selectedDistrictId])


    useEffect(() => {
        if (error) {
            dispatch(showToast({ message: error.message || 'Failed to fetch Representatives.', type: 'error' }));
        }
    }, [error, dispatch]);

    if (isLoading) return <p>Loading Centers...</p>;
    return (
        <>

            <div className='w-full px-20 py-10'>
                <div className='flex justify-between'>
                    <h1 className='text-[1.5vw]'>Representatives <i className="ri-file-list-line"></i></h1>
                    <div className='flex gap-5 items-center'>
                        <div className='text-[0.8vw]'>
                            <label htmlFor="">Sort By:</label>

                            {/* <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' dwidth={8} noSelect={true} /> */}
                            <CustomDropdown options={centers} selectedValue={selectedCenterId} setSelectedValue={setSelectedCenterId} placeholder='Select Center' labelKey='centerName' dwidth={8} noSelect={true} />

                        </div>
                        <button type='button' className={`mx-1 bg-blue-500 px-2 py-1 rounded-xl text-white hover:border border-black ${representatives?.data?.length === 0 ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'}`} onClick={handleDownload} disabled={isFetching} >{isFetching ? 'Downloading...' : 'Download List'} <i className="ri-download-cloud-2-line text-white"></i></button>

                    </div>
                </div>
                {representatives?.data?.length > 0 ? (
                    <div className='w-full flex flex-col justify-center mt-8'>
                        <table className='rounded-2xl'>
                            <thead className='rounded-2xl'>
                                <tr className='bg-blue-100'>
                                    <th className='w-[5vw] border py-1.5'>Sr.No</th>
                                    <th className='w-[8vw] border py-1.5'>Center </th>
                                    <th className='w-[20vw] border py-1.5'>Name </th>
                                    <th className='w-[20vw] border py-1.5'>Mobile No. </th>
                                    <th className='w-[20vw] border py-1.5'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {representatives.data.map((represenatative, index) => (
                                    <tr key={represenatative.id} className='text-center border hover:bg-gray-300'>
                                        <td className='border'>{index + 1}</td>
                                        <td className='border'>{represenatative.centerName}</td>
                                        <td className='border'>
                                            {rowId === represenatative.id ? (
                                                <input
                                                    type="text"
                                                    name='newRepName'
                                                    value={editedRepInfo.newRepName}
                                                    onChange={(e) => handleChange(e)}
                                                    className="border px-2 py-1 w-4/5 "
                                                />
                                            ) : (
                                                represenatative.rName
                                            )}
                                        </td>
                                        <td className='border'>
                                            {rowId === represenatative.id ? (
                                                <input
                                                    type="text"
                                                    name='newRepMobile'

                                                    value={editedRepInfo.newRepMobile}
                                                    onChange={handleChange}
                                                    className="border px-2 py-1 w-4/5"
                                                />
                                            ) : (
                                                represenatative.rMobile
                                            )}
                                        </td>
                                        <td className='border'>
                                            {rowId === represenatative.id ? (
                                                <>
                                                    <button
                                                        type='button'
                                                        className='cursor-pointer px-3 py-1 bg-green-400 me-2 my-2 rounded'
                                                        onClick={handleEdit}
                                                    >
                                                        {loading ? 'Saving' : 'Save'} <i className="ri-save-line"></i>
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className='cursor-pointer px-3 py-1 bg-gray-400 my-2 rounded'
                                                        onClick={() => { setRowId(null), setLoading(false) }} // Cancel edit
                                                    >
                                                        Cancel <i className="ri-close-line"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type='button'
                                                        className='cursor-pointer px-3 py-1 border border-amber-400 hover:bg-amber-300 me-2 my-2 rounded transition-all'
                                                        onClick={() => {
                                                            setRowId(represenatative.id);
                                                            setEditedRepInfo({ newRepName: represenatative.rName, newRepMobile: represenatative.rMobile });
                                                        }}
                                                    >
                                                        Edit <i className="ri-edit-line"></i>
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`cursor-pointer px-3 py-1 border border-red-500 hover:bg-red-400 ms-2 my-2 rounded   transition-all ${isDisable ? "opacity-50 cursor-not-allowed" : ''}`}
                                                        onClick={() => { handleDelete(represenatative.id) }}
                                                        disabled={isDisable}
                                                    >
                                                        {isDisable ? "Deleting..." : "Delete"} <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='flex justify-center pt-16 text-2xl'>
                        <p className='underline underline-offset-2 decoration-red-500'>No Representative available.....</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default RepresentativeList
