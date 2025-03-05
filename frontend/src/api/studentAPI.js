import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getStudents = async (districtId = null, talukaId = null,centerId=null,schoolId) => {
    try {
        // Construct query parameters dynamically
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);
        if (centerId) params.append('centerId', centerId);
        if (schoolId) params.append('schoolId', schoolId);


        const response = await axios.get(`${apiUrl}/school/get-schools?${params.toString()}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch Students");
    }
};


export const addStudent = async (studentDetails) => {
    try {
        const { schoolId, standard, medium, fName, mName, lName, mobile } = studentDetails;
        console.log(studentDetails);
        
        const response = await axios.post(`${apiUrl}/student/add-student`, 
            {
                schoolId,
                standard,
                medium,
                fName,
                mName,
                lName,
                mobile,
            }
            , { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Add New Student";
    }
}

export const updateStudent = async (studentId,updatedDetails) => {
    try {
        const {schoolId, standard, medium, fName, mName, lName, mobile } = updatedDetails;

        const response = await axios.put(`${apiUrl}/student/update-student/${studentId}`, 
            { 
                schoolId,standard,medium,fName,mName,lName,mobile
            }, 
            { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Update Student Details";
    }
}

export const deleteStudent = async (schoolId) => {
    try {
        const response = await axios.delete(`${apiUrl}/student/delete-student/${schoolId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Delete Student Details";
    }
}

export const downloadStudentPdf = async (districtId=null,talukaId=null,centerId=null,schoolId=null) => {
    try {

        // Construct query parameters dynamically
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);
        if (centerId) params.append('centerID', centerId);
        if (schoolId) params.append('schoolId', schoolId);



      const response = await axios.get(`${apiUrl}/student/download-student-list?${params.toString()}`, {
        withCredentials: true,
        responseType: 'blob', //  response is treated as a binary file
      });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      return URL.createObjectURL(blob); // Convert to a downloadable link
    } catch (error) {
      throw new Error('Failed to fetch PDF',error);
    }   
  };
  

// export const downloadDistrictPdf = async () => {
//     try {
//       const response = await axios.get(`${apiUrl}/district/download-district-list`, {
//         withCredentials: true,
//         responseType: 'arraybuffer', // Ensure we get the binary file directly
//       });
  
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const link = document.createElement('a');
//       link.href = window.URL.createObjectURL(blob);
      
//       // **Set filename if the backend sends Content-Disposition header**
//       const contentDisposition = response.headers['content-disposition'];
//       let fileName = 'district-list.pdf';
//       if (contentDisposition) {
//         const match = contentDisposition.match(/filename="?([^"]+)"?/);
//         if (match) fileName = match[1];
//       }
  
//     //   link.download = fileName;
//     //   document.body.appendChild(link);
//     //   link.click();
//     //   document.body.removeChild(link);
//     } catch (error) {
//       throw new Error('Failed to fetch PDF');
//     }
//   };
  