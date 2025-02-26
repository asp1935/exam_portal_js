import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteDistrict, useDistricts, useDownloadPDF, useUpdateDistrict } from '../../hooks/useDistricts';
import { showToast } from '../../redux/slice/ToastSlice';

function DistrictList() {
  const dispatch = useDispatch();
  const { data: districts, isLoading, error } = useDistricts();

  const [rowId, setRowId] = useState(null); // row ID for edit delete
  const [editedDistrictName, setEditedDistrictName] = useState(''); // current content
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const updateDistrictMutation = useUpdateDistrict();
  const deleteDstrictMuatation = useDeleteDistrict();
  const {data:pdfUrl,  refetch, isFetching } =useDownloadPDF();

  const handleDownload=()=>{
    refetch();
  }
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank'); // Opens the PDF in a new tab
    }
  }, [pdfUrl]);

  const handleEdit = async () => {
    if (editedDistrictName.trim()) {
      setLoading(true);
      updateDistrictMutation.mutate({ id: rowId, updatedData: editedDistrictName }, {
        onSuccess: () => { dispatch(showToast({ message: 'District Updated Successfully...' })), setRowId(null), setEditedDistrictName(null) },
        onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
      },
      )
      setLoading(false)
    }
  }
  const handleDelete = async (id) => {
    setIsDisable(true);
    if (window.confirm('Do you want to Delete District?')) {
      deleteDstrictMuatation.mutate({id},{
        onSuccess: () => { dispatch(showToast({ message: 'District Deleted Successfully...' }))},
        onError: (error) => dispatch(showToast({ message: error, type: 'error' }))
      })
    }
    setIsDisable(false);
  }

  useEffect(() => {
    if (error) {
      dispatch(showToast({ message: error.message || 'Failed to fetch districts.', type: 'error' }));
    }
  }, [error, dispatch]);

  if (isLoading) return <p>Loading districts...</p>;

  return (
    <>
      {districts?.data?.length > 0 ? (
        <div className='w-full px-20 py-10'>
          <div className='flex justify-between'>
            <h1 className='text-[1.5vw]'>Districts <i className="ri-file-list-line"></i></h1>
            <button type='button' className='bg-blue-500 px-2 rounded-xl text-white hover:border border-black' onClick={handleDownload} disabled={isFetching} >{isFetching ? 'Downloading...' : 'Download List'} <i className="ri-download-cloud-2-line text-white"></i></button>
          </div>
          <div className='w-full flex flex-col justify-center mt-8'>
            <table className='rounded-2xl'>
              <thead className='rounded-2xl'>
                <tr className='bg-blue-100'>
                  <th className='w-[10vw] border py-1.5'>Sr.No</th>
                  <th className='w-[25vw] border py-1.5'>District Name</th>
                  <th className='w-[20vw] border py-1.5'>Action</th>
                </tr>
              </thead>
              <tbody>
                {districts.data.map((district, index) => (
                  <tr key={district.id} className='text-center border hover:bg-gray-300'>
                    <td className='border'>{index + 1}</td>
                    <td className='border'>
                      {rowId === district.id ? (
                        <input
                          type="text"
                          value={editedDistrictName}
                          onChange={(e) => setEditedDistrictName(e.target.value)}
                          className="border px-2 py-1 w-full"
                        />
                      ) : (
                        district.districtName
                      )}
                    </td>
                    <td className='border'>
                      {rowId === district.id ? (
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
                              setRowId(district.id);
                              setEditedDistrictName(district.districtName);
                            }}
                          >
                            Edit <i className="ri-edit-line"></i>
                          </button>
                          <button
                            type='button'
                            className={`cursor-pointer px-3 py-1 border border-red-500 hover:bg-red-400 ms-2 my-2 rounded   transition-all ${isDisable ? "opacity-50 cursor-not-allowed" : ''}`}
                            onClick={() => { handleDelete(district.id) }}
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

export default DistrictList;
