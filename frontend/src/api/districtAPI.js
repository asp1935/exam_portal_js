import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getAllDistrict = async () => {
    try {
        const responce = await axios.get(`${apiUrl}/district/get-all-districts`, { withCredentials: true });
        return responce.data;
    } catch (error) {
        throw error.responce?.data?.message
    }
}

export const addDistrict = async (districtName) => {
    try {
        const responce = await axios.post(`${apiUrl}/district/add-district`, { districtName }, { withCredentials: true });
        return responce.data
    } catch (error) {
        throw error.response?.data?.message;
    }
}

export const updateDistrict = async (districtId,districtName) => {
    try {
        const responce = await axios.patch(`${apiUrl}/district/update-district/${districtId}`, { districtName }, { withCredentials: true });
        return responce.data
    } catch (error) {
        throw error.response?.data?.message;
    }
}

export const deleteDistrict = async (district_id) => {
    try {
        const responce = await axios.delete(`${apiUrl}/district/delete-district/${district_id}`, { withCredentials: true });
        return responce.data
    } catch (error) {
        throw error.response?.data?.message;
    }
}

export const downloadDistrictPdf = async () => {
    try {
      const response = await axios.get(`${apiUrl}/district/download-district-list`, {
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
  