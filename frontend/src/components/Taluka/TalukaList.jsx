import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../redux/slice/ToastSlice';
import { useDeleteTalukas, useDownloadTalukaPDF, useTalukas, useUpdateTalukas } from '../../hooks/useTalukas';
import { useDistricts } from '../../hooks/useDistricts';

function TalukaList() {
    const dispatch = useDispatch();

    const [rowId, setRowId] = useState(null); // row ID for edit delete
    const [editedTalukaName, setEditedTalukaName] = useState(''); // current content
    const [loading, setLoading] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);


    const { data: talukas, isLoading, error } = useTalukas(selectedDistrictId);
    const { data: districts, } = useDistricts();

    const updateTalukaMutation = useUpdateTalukas();
    const deleteTalukasMuatation = useDeleteTalukas();
    const { data: pdfUrl, refetch, isFetching } = useDownloadTalukaPDF(selectedDistrictId);


    const handleDownload = () => {
        refetch();
    }
    useEffect(() => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
        }
    }, [pdfUrl]);

    const handleEdit = async () => {
        if (editedTalukaName.trim()) {
            setLoading(true);
            updateTalukaMutation.mutate({ id: rowId, updatedData: editedTalukaName }, {
                onSuccess: () => { dispatch(showToast({ message: 'Taluka Name Updated Successfully...' })), setRowId(null), setEditedTalukaName(null) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            },
            )
            setLoading(false)
        }
    }
    const handleDelete = async (id) => {
        setIsDisable(true);
        if (window.confirm('Do you want to Delete Taluka?')) {
            deleteTalukasMuatation.mutate({ id }, {
                onSuccess: () => { dispatch(showToast({ message: 'Taluka Deleted Successfully...' })) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            })
        }
        setIsDisable(false);
    }

   

    useEffect(() => {
        if (error) {
            dispatch(showToast({ message: error.message || 'Failed to fetch Talukas.', type: 'error' }));
        }
    }, [error, dispatch]);

    if (isLoading) return <p>Loading districts...</p>;

    return (
        <>
            {talukas?.data?.length > 0 ? (
                <div className='w-full px-20 py-10'>
                    <div className='flex justify-between'>
                        <h1 className='text-[1.5vw]'>Talukas <i className="ri-file-list-line"></i></h1>
                        <div className='flex gap-5 items-center'>
                            <div className='text-[0.8vw]'>
                                <label htmlFor="">Sort By:</label>
                                <select
                                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                                    value={selectedDistrictId || ""}
                                    className='border rounded p-1 ms-3  w-25 ' required
                                >
                                    <option value="">All</option>
                                    {districts?.data?.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.districtName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type='button' className='mx-1 bg-blue-500 px-2 py-1 rounded-xl text-white hover:border border-black' onClick={handleDownload} disabled={isFetching} >{isFetching ? 'Downloading...' : 'Download List'} <i className="ri-download-cloud-2-line text-white"></i></button>

                        </div>
                    </div>
                    <div className='w-full flex flex-col justify-center mt-8'>
                        <table className='rounded-2xl'>
                            <thead className='rounded-2xl'>
                                <tr className='bg-blue-100'>
                                    <th className='w-[10vw] border py-1.5'>Sr.No</th>
                                    <th className='w-[20vw] border py-1.5'>District </th>
                                    <th className='w-[20vw] border py-1.5'>Taluka </th>
                                    <th className='w-[20vw] border py-1.5'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {talukas.data.map((taluka, index) => (
                                    <tr key={taluka.id} className='text-center border hover:bg-gray-300'>
                                        <td className='border'>{index + 1}</td>
                                        <td className='border'>{taluka.districtName}</td>
                                        <td className='border'>
                                            {rowId === taluka.id ? (
                                                <input
                                                    type="text"
                                                    value={editedTalukaName}
                                                    onChange={(e) => setEditedTalukaName(e.target.value)}
                                                    className="border px-2 py-1 w-full"
                                                />
                                            ) : (
                                                taluka.talukaName
                                            )}
                                        </td>
                                        <td className='border'>
                                            {rowId === taluka.id ? (
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
                                                            setRowId(taluka.id);
                                                            setEditedTalukaName(taluka.talukaName);
                                                        }}
                                                    >
                                                        Edit <i className="ri-edit-line"></i>
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`cursor-pointer px-3 py-1 border border-red-500 hover:bg-red-400 ms-2 my-2 rounded   transition-all ${isDisable ? "opacity-50 cursor-not-allowed" : ''}`}
                                                        onClick={() => { handleDelete(taluka.id) }}
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
                </div>
            ) : (
                <p>No districts available.</p>
            )}
        </>
    );
}

export default TalukaList;
