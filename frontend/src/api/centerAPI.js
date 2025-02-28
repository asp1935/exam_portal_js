import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getCenters = async (districtId = null, talukaId = null) => {
    try {
        // Construct query parameters dynamically
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);

        const response = await axios.get(`${apiUrl}/center/get-centers?${params.toString()}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch Centers");
    }
};


export const addCenter = async (talukaId, centerName) => {
    try {
        console.log(talukaId,centerName);
        
        const response = await axios.post(`${apiUrl}/center/add-center`, {talukaId, centerName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Add Center";
    }
}

export const updateCenter = async (centerId,newCenterName) => {
    try {
        console.log(centerId,newCenterName);
        
        const response = await axios.patch(`${apiUrl}/center/update-center/${centerId}`, {newCenterName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Update Talukas";
    }
}

export const deleteCenter = async (centerId) => {
    try {
        const response = await axios.delete(`${apiUrl}/center/delete-center/${centerId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Delete Taluka";
    }
}

export const downloadCenterPdf = async (districtId=null,talukaId=null) => {
    try {

        // Construct query parameters dynamically
        console.log(districtId,talukaId);
        
        const params = new URLSearchParams();
        if (districtId) params.append('districtId', districtId);
        if (talukaId) params.append('talukaId', talukaId);

      const response = await axios.get(`${apiUrl}/center/download-center-list?${params.toString()}`, {
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
  