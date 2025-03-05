import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useCenters } from '../../hooks/useCenters';
import { useDeleteSchool, useDownloadSchoolPDF, useSchools, useUpdateSchool } from '../../hooks/useSchools';
import { showToast } from '../../redux/slice/ToastSlice';
import CustomDropdown from '../CustomDropdown';
import { useTalukas } from '../../hooks/useTalukas';
import { useDistricts } from '../../hooks/useDistricts';

function SchoolList() {
  const dispatch = useDispatch();

    const [rowId, setRowId] = useState(null); // row ID for edit delete
    const [editedSchoolName, setEditedSchoolName] = useState(''); // current content
    const [loading, setLoading] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedTalukaId, setSelectedTalukaId] = useState(null);
    const [selectedCenterId, setSelectedCenterId] = useState(null);


    const { data: schools, isLoading, error } = useSchools(selectedDistrictId, selectedTalukaId,selectedCenterId);

    const { data: centers } = useCenters(selectedDistrictId, selectedTalukaId);
    const { data: talukas } = useTalukas(selectedDistrictId);
    const { data: districts, } = useDistricts();

    const updateSchoolMutation = useUpdateSchool();
    const deleteSchoolMuatation = useDeleteSchool();
    const { data: pdfUrl, refetch, isFetching } = useDownloadSchoolPDF(selectedDistrictId,selectedTalukaId,selectedCenterId);


    const handleDownload = () => {
        refetch();
    }
    useEffect(() => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
        }
    }, [pdfUrl]);

    const handleEdit = async () => {
        if (editedSchoolName.trim()) {
            setLoading(true);
            ;
            
            updateSchoolMutation.mutate({ id: rowId, schoolName: editedSchoolName }, {
                onSuccess: () => { dispatch(showToast({ message: 'School Name Updated Successfully...' })), setRowId(null), setEditedSchoolName(null) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            },
            )
            setLoading(false)
        }
    }
    const handleDelete = async (id) => {
        setIsDisable(true);
        if (window.confirm('Do you want to Delete School?')) {
            deleteSchoolMuatation.mutate({ id }, {
                onSuccess: () => { dispatch(showToast({ message: 'School Deleted Successfully...' })) },
                onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
            })
        }
        setIsDisable(false);
    }

    useEffect(()=>{
        setSelectedTalukaId(null);
        setSelectedCenterId(null);
    },[selectedDistrictId])


    useEffect(() => {
        if (error) {
            dispatch(showToast({ message: error.message || 'Failed to fetch Schools.', type: 'error' }));
        }
    }, [error, dispatch]);

    if (isLoading) return <p>Loading Schools...</p>;
  return (
      <>
    
                <div className='w-full px-20 py-10'>
                    <div className='flex justify-between'>
                        <h1 className='text-[1.5vw]'>Schools <i className="ri-file-list-line"></i></h1>
                        <div className='flex gap-5 items-center'>
                            <div className='text-[0.8vw]'>
                                <label htmlFor="">Sort By:</label>
    
                                <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' dwidth={8} noSelect={true} />
                                <CustomDropdown options={talukas} selectedValue={selectedTalukaId} setSelectedValue={setSelectedTalukaId} placeholder='Select Taluka' labelKey='talukaName' disable={selectedDistrictId ? false : true} dwidth={8} noSelect={true} />
                                <CustomDropdown options={centers} selectedValue={selectedCenterId} setSelectedValue={setSelectedCenterId} placeholder='Select Center' labelKey='talukaName' disable={selectedTalukaId ? false : true} dwidth={8} noSelect={true} />
    
                            </div>
                            <button type='button' className={`mx-1 bg-blue-500 px-2 py-1 rounded-xl text-white hover:border border-black ${centers?.data?.length === 0?'cursor-not-allowed opacity-50 pointer-events-none':'cursor-pointer'}`} onClick={handleDownload} disabled={isFetching} >{isFetching ? 'Downloading...' : 'Download List'} <i className="ri-download-cloud-2-line text-white"></i></button>
    
                        </div>
                    </div>
                    {schools?.data?.length > 0 ? (
                        <div className='w-full flex flex-col justify-center mt-8'>
                            <table className='rounded-2xl'>
                                <thead className='rounded-2xl'>
                                    <tr className='bg-blue-100'>
                                        <th className='w-[10vw] border py-1.5'>Sr.No</th>
                                        <th className='w-[20vw] border py-1.5'>Center </th>
                                        <th className='w-[20vw] border py-1.5'>School Name </th>
                                        <th className='w-[20vw] border py-1.5'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools?.data.map((school, index) => (
                                        <tr key={school.id} className='text-center border hover:bg-gray-300'>
                                            <td className='border'>{index + 1}</td>
                                            <td className='border'>{school.centerName}</td>
                                            <td className='border'>
                                                {rowId === school.id ? (
                                                    <input
                                                        type="text"
                                                        value={editedSchoolName}
                                                        onChange={(e) => setEditedSchoolName(e.target.value)}
                                                        className="border px-2 py-1  w-4/5"
                                                    />
                                                ) : (
                                                    school.schoolName
                                                )}
                                            </td>
                                            <td className='border'>
                                                {rowId === school.id ? (
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
                                                                setRowId(school.id);
                                                                setEditedSchoolName(school.schoolName);
                                                            }}
                                                        >
                                                            Edit <i className="ri-edit-line"></i>
                                                        </button>
                                                        <button
                                                            type='button'
                                                            className={`cursor-pointer px-3 py-1 border border-red-500 hover:bg-red-400 ms-2 my-2 rounded   transition-all ${isDisable ? "opacity-50 cursor-not-allowed" : ''}`}
                                                            onClick={() => { handleDelete(school.id) }}
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
                            <p className='underline underline-offset-2 decoration-red-500'>No Schools available.....</p>
                        </div>
                    )}
                </div>
            </>
  )
}

export default SchoolList
