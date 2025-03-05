import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getSchools = async (districtId = null, talukaId = null,centerId=null) => {
    try {
        // Construct query parameters dynamically
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);
        if (centerId) params.append('centerId', centerId);

        const response = await axios.get(`${apiUrl}/school/get-schools?${params.toString()}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch Schools");
    }
};


export const addSchool = async (centerId, schoolName) => {
    try {
        const response = await axios.post(`${apiUrl}/school/add-school`, {centerId, schoolName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Add New School";
    }
}

export const updateSchool = async (schoolId,schoolName) => {
    try {
        const response = await axios.patch(`${apiUrl}/school/update-school/${schoolId}`, {schoolName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Update School Name";
    }
}

export const deleteSchool = async (schoolId) => {
    try {
        const response = await axios.delete(`${apiUrl}/school/delete-school/${schoolId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Delete School Details";
    }
}

export const downloadSchoolPdf = async (districtId=null,talukaId=null,centerId=null) => {
    try {

        // Construct query parameters dynamically
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);
        if (centerId) params.append('centerId', centerId);


      const response = await axios.get(`${apiUrl}/school/download-school-list?${params.toString()}`, {
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
  