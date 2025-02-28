import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useCenters, useDeleteCenter, useDownloadCenterPDF, useUpdateCenter } from '../../hooks/useCenters';
import { useTalukas } from '../../hooks/useTalukas';
import { useDistricts } from '../../hooks/useDistricts';
import { showToast } from '../../redux/slice/ToastSlice';
import CustomDropdown from '../CustomDropdown';

function CenterList() {
    const dispatch = useDispatch();

    const [rowId, setRowId] = useState(null); // row ID for edit delete
    const [editedCenteraName, setEditedCenterName] = useState(''); // current content
    const [loading, setLoading] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedTalukaId, setSelectedTalukaId] = useState(null);


    const { data: centers, isLoading, error } = useCenters(selectedDistrictId, selectedTalukaId);
    const { data: talukas } = useTalukas(selectedDistrictId);

    const { data: districts, } = useDistricts();

    const updateCenterMutation = useUpdateCenter();
    const deleteTalukasMuatation = useDeleteCenter();
    const { data: pdfUrl, refetch, isFetching } = useDownloadCenterPDF(selectedDistrictId,selectedTalukaId);


    const handleDownload = () => {
        refetch();
    }
    useEffect(() => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
        }
    }, [pdfUrl]);

    const handleEdit = async () => {
        if (editedCenteraName.trim()) {
            setLoading(true);
            ;
            
            updateCenterMutation.mutate({ id: rowId, newCenterName: editedCenteraName }, {
                onSuccess: () => { dispatch(showToast({ message: 'Center Name Updated Successfully...' })), setRowId(null), setEditedCenterName(null) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            },
            )
            setLoading(false)
        }
    }
    const handleDelete = async (id) => {
        setIsDisable(true);
        if (window.confirm('Do you want to Delete Center?')) {
            deleteTalukasMuatation.mutate({ id }, {
                onSuccess: () => { dispatch(showToast({ message: 'Center Deleted Successfully...' })) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            })
        }
        setIsDisable(false);
    }

    useEffect(()=>{
        setSelectedTalukaId(null)
    },[selectedDistrictId])


    useEffect(() => {
        if (error) {
            dispatch(showToast({ message: error.message || 'Failed to fetch Center.', type: 'error' }));
        }
    }, [error, dispatch]);

    if (isLoading) return <p>Loading Centers...</p>;

    return (
        <>

            <div className='w-full px-20 py-10'>
                <div className='flex justify-between'>
                    <h1 className='text-[1.5vw]'>Talukas <i className="ri-file-list-line"></i></h1>
                    <div className='flex gap-5 items-center'>
                        <div className='text-[0.8vw]'>
                            <label htmlFor="">Sort By:</label>

                            <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' dwidth={8} noSelect={true} />
                            <CustomDropdown options={talukas} selectedValue={selectedTalukaId} setSelectedValue={setSelectedTalukaId} placeholder='Select Taluka' labelKey='talukaName' disable={selectedDistrictId ? false : true} dwidth={8} noSelect={true} />

                        </div>
                        <button type='button' className={`mx-1 bg-blue-500 px-2 py-1 rounded-xl text-white hover:border border-black ${centers?.data?.length === 0?'cursor-not-allowed opacity-50 pointer-events-none':'cursor-pointer'}`} onClick={handleDownload} disabled={isFetching} >{isFetching ? 'Downloading...' : 'Download List'} <i className="ri-download-cloud-2-line text-white"></i></button>

                    </div>
                </div>
                {centers?.data?.length > 0 ? (
                    <div className='w-full flex flex-col justify-center mt-8'>
                        <table className='rounded-2xl'>
                            <thead className='rounded-2xl'>
                                <tr className='bg-blue-100'>
                                    <th className='w-[10vw] border py-1.5'>Sr.No</th>
                                    <th className='w-[20vw] border py-1.5'>Taluka </th>
                                    <th className='w-[20vw] border py-1.5'>Centers </th>
                                    <th className='w-[20vw] border py-1.5'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {centers.data.map((center, index) => (
                                    <tr key={center.id} className='text-center border hover:bg-gray-300'>
                                        <td className='border'>{index + 1}</td>
                                        <td className='border'>{center.talukaName}</td>
                                        <td className='border'>
                                            {rowId === center.id ? (
                                                <input
                                                    type="text"
                                                    value={editedCenteraName}
                                                    onChange={(e) => setEditedCenterName(e.target.value)}
                                                    className="border px-2 py-1 w-full"
                                                />
                                            ) : (
                                                center.centerName
                                            )}
                                        </td>
                                        <td className='border'>
                                            {rowId === center.id ? (
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
                                                            setRowId(center.id);
                                                            setEditedCenterName(center.centerName);
                                                        }}
                                                    >
                                                        Edit <i className="ri-edit-line"></i>
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`cursor-pointer px-3 py-1 border border-red-500 hover:bg-red-400 ms-2 my-2 rounded   transition-all ${isDisable ? "opacity-50 cursor-not-allowed" : ''}`}
                                                        onClick={() => { handleDelete(center.id) }}
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
                        <p className='underline underline-offset-2 decoration-red-500'>No Centers available.....</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default CenterList
