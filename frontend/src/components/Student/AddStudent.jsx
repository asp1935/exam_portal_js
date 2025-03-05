import React, { useEffect, useState } from 'react'
import { useDistricts } from '../../hooks/useDistricts';
import { useTalukas } from '../../hooks/useTalukas';
import { useCenters } from '../../hooks/useCenters';
import { useAddStudent } from '../../hooks/useStudents';
import { useDispatch } from 'react-redux';
import CustomDropdown from '../CustomDropdown';
import { showToast } from '../../redux/slice/ToastSlice';
import { useSchools } from '../../hooks/useSchools';
import DropdownList from '../DropdownList';

function AddStudent() {
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedStandardId, setSelectedStandardId] = useState(1);
  const [selectedMediumId, setSelectedMediumId] = useState('M');


  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(selectedDistrictId);
  const { data: centers } = useCenters(selectedTalukaId);
  const { data: schools } = useSchools(selectedCenterId);

  const addStudentMutation = useAddStudent();
  const dispatch = useDispatch();
  const [student, setStudent] = useState({
    fName: '',
    mName: '',
    lName: '',
    mobile: '',
  });
  const [errors, setErrors] = useState({
    sSchool: '',
    sMedium: '',
    sStadard: '',
    sFName: '',
    sMName: '',
    sLName: '',
    sMobile: '',
  });

  const medium = ['M', 'S', 'E'];
  const standard = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    setErrors({
      sSchool: '',
      sMedium: '',
      sStadard: '',
      sFName: '',
      sMName: '',
      sLName: '',
      sMobile: '',
    })
  }, [selectedSchoolId])


  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  }


  // const validateForm = () => {
  //   const newErrors = {};
  //   if (!selectedSchoolId) {
  //     newErrors.sSchool = 'Please Select School '
  //   }
  //   if (!medium.includes(selectedMediumId)) {
  //     newErrors.sMedium = 'Please Select Valid Medium'
  //   }
  //   if (!standard.includes(selectedStandardId)) {
  //     newErrors.sMedium = 'Please Select Valid Standard'
  //   }
  //   if ([student.fName, student.mName, student.lName].some((field) => field.trim() === '')) {
  //     newErrors.repName = 'Name is required.';
  //   }

  //   if (typeof Number(student.mobile) !== 'number') {
  //     newErrors.repMobile = 'Mobile Number is required.';
  //   } else if (student.mobile.toString().length !== 10) {
  //     newErrors.sMobile = 'Invalid Mobile Number';
  //   }

  //   setErrors(newErrors);
  //   console.log(newErrors);

  //   // Return true if no errors
  //   return Object.keys(newErrors).length === 0;
  // };


  const validateForm = () => {
    const newErrors = {};
  
    if (!selectedSchoolId) {
      newErrors.sSchool = 'Please Select School';
    }
    if (!medium.includes(selectedMediumId)) {
      newErrors.sMedium = 'Please Select Valid Medium';
    }
    if (!standard.includes(selectedStandardId)) {
      newErrors.sStadard = 'Please Select Valid Standard';
    }
    if (!student.fName.trim()) {
      newErrors.sFName = 'First Name is required.';
    }
    if (!student.mName.trim()) {
      newErrors.sMName = 'Middle Name is required.';
    }
    if (!student.lName.trim()) {
      newErrors.sLName = 'Last Name is required.';
    }
    if (!student.mobile.trim()) {
      newErrors.sMobile = 'Mobile Number is required.';
    } else if (isNaN(Number(student.mobile))) {
      newErrors.sMobile = 'Mobile Number must be numeric.';
    } else if (student.mobile.toString().length !== 10) {
      newErrors.sMobile = 'Invalid Mobile Number';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  


  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const studentDetails = {
        schoolId: selectedSchoolId,
        medium: selectedMediumId,
        standard: selectedStandardId,
        fName: student.fName.trim(),
        mName: student.mName.trim(),
        lName: student.lName.trim(),
        mobile: Number(student.mobile),
      }
      addStudentMutation.mutate({
        studentDetails
      }, {


        onSuccess: () => {
          dispatch(showToast({ message: "Student added Successfully!" }));

          // Reset form fields
          setStudent({ fName: '', mName: '', lName: '', mobile: '' });
          setSelectedCenterId(null);
          setSelectedDistrictId(null);
          setSelectedTalukaId(null);
          setSelectedSchoolId(null);
          setSelectedMediumId('M');
          setSelectedStandardId(1);
        },
        onError: (error) => dispatch(showToast({ message: error, type: 'error' })),
      }
      );


    }
  };

  return (
    <>
      <div className='w-full px-20 py-8 '>
        <div className='w-full shadow-xl rounded-2xl overflow-hidden border border-gray-50'>
          <h1 className='text-[1.3vw] px-4 py-1 bg-blue-100 '>
            Add Student
          </h1>
          <div className='w-full  my-3 px-5 py-2 min-h-56'>
            <form onSubmit={handleSubmit}>
              <div className='w-full grid grid-cols-3 gap-y-5'>
                <div>
                  <label htmlFor="districtDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select District</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={districts} selectedValue={selectedDistrictId} setSelectedValue={setSelectedDistrictId} placeholder='Select District' labelKey='districtName' dwidth={20} dheigth={20} />

                </div>
                <div>
                  <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Taluka</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={talukas} selectedValue={selectedTalukaId} setSelectedValue={setSelectedTalukaId} placeholder='Select Taluka' labelKey='talukaName' disable={selectedDistrictId ? false : true} dwidth={20} dheigth={20} />

                </div>
                <div>
                  <label htmlFor="centerDrodown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Center</span> <i className="ri-arrow-down-s-line"></i> </label>
                  <CustomDropdown options={centers} selectedValue={selectedCenterId} setSelectedValue={setSelectedCenterId} placeholder='Select Center' labelKey='centerName' disable={selectedTalukaId ? false : true} dwidth={20} dheigth={20} />
                  
                </div>
                <div className='col-span-3 grid grid-cols-3 gap-y-5 my-5' >
                  <div >
                    <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select School</span> <i className="ri-arrow-down-s-line"></i> </label>
                    <CustomDropdown options={schools} selectedValue={selectedSchoolId} setSelectedValue={setSelectedSchoolId} placeholder='Select School' labelKey='schoolName' disable={selectedCenterId ? false : true} dwidth={20} dheigth={20} />
                    {errors.sSchool && (
                      <p className='text-red-500 text-sm mt-1 '>{errors.sSchool}</p>
                    )}
                  </div>
                  <div >
                    <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Medium</span> <i className="ri-arrow-down-s-line"></i> </label>
                    <DropdownList options={medium} selectedValue={selectedMediumId} setSelectedValue={setSelectedMediumId} placeholder='Select Medium' dwidth={20} dheigth={20} />
                    {errors.sMedium && (
                      <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sMedium}</p>
                    )}
                  </div>
                  <div >
                    <label htmlFor="talukaDropdown" className='block text-[0.9vw] mb-2.5'> <span className=' underline  underline-offset-2 decoration-red-600'>Select Standard</span> <i className="ri-arrow-down-s-line"></i> </label>
                    <DropdownList options={standard} selectedValue={selectedStandardId} setSelectedValue={setSelectedStandardId} placeholder='Select Standard' dwidth={20} dheigth={20} />
                    {errors.sStadard && (
                      <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sStadard}</p>
                    )}
                  </div>



                </div>

                <div className=''>
                  <label htmlFor="lName" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Last Name</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='lName'
                    value={student.lName}
                    onChange={handleChange}
                    placeholder='Enter Last Name...'
                    className='w-[20vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required
                  />
                  {errors.sLName && (
                    <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sLName}</p>
                  )}
                </div>
                <div className=''>
                  <label htmlFor="fName" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>First Name</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='fName'
                    value={student.fName}
                    onChange={handleChange}
                    placeholder='Enter First Name...'
                    className='w-[20vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required
                  />
                  {errors.sFName && (
                    <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sFName}</p>
                  )}
                </div>
                <div className=''>
                  <label htmlFor="mNAme" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Middle Name</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='mName'
                    value={student.mName}
                    onChange={handleChange}
                    placeholder='Enter Middle Name...'
                    className='w-[20vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required
                  />
                  {errors.sMName && (
                    <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sMName}</p>
                  )}
                </div>


                <div className=''>
                  <label htmlFor="Mobile" className='block text-[0.9vw] mb-2.5'><span className=' underline  underline-offset-2 decoration-red-600'>Mobile No.</span> <i className="ri-ball-pen-line"></i></label>
                  <input
                    type='text'
                    name='mobile'
                    value={student.mobile}
                    onChange={handleChange}
                    placeholder='Enter Mobile Number...'
                    className='w-[20vw] outline-0 border rounded pl-2 py-1 ms-3'
                    required

                  />
                  {errors.sMobile && (
                    <p className='text-red-500 text-sm mt-1 ms-3'>{errors.sMobile}</p>
                  )}
                </div>
              </div>

              <div className='w-full h-full flex justify-end mt-5'>
                <button
                  type='submit'
                  className='block bg-blue-400 px-4 py-1 rounded-2xl cursor-pointer hover:outline-1'
                  disabled={addStudentMutation.isLoading}>
                  {addStudentMutation.isPending ? 'Adding' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='w-full mx-10 border border-gray-400     justify-self-center'></div>
    </>
  )
}

export default AddStudent
