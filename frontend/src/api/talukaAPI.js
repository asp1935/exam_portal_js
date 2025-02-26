import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getTalukas = async (distId = null) => {
    try {
        const endpoint = distId ? `${apiUrl}/taluka/get-talukas/${distId}` : `${apiUrl}/taluka/get-talukas`;
        const response = await axios.get(endpoint, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch talukas");
    }
};

export const addTaluka = async (districtId, talukaName) => {
    try {
        console.log(districtId,talukaName);
        
        const response = await axios.post(`${apiUrl}/taluka/add-taluka`, {districtId, talukaName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Add Taluka";
    }
}

export const updateTaluka = async (talukaId,newTalukaName) => {
    try {
        const response = await axios.patch(`${apiUrl}/taluka/update-taluka/${talukaId}`, { newTalukaName }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Update Talukas";
    }
}

export const deleteTaluka = async (talukaId) => {
    try {
        const response = await axios.delete(`${apiUrl}/taluka/delete-taluka/${talukaId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Delete Taluka";
    }
}

export const downloadTalukaPdf = async (distId=null) => {
    try {
        const endpoint = distId ? `${apiUrl}/taluka/download-taluka-list/${distId}` : `${apiUrl}/taluka/download-taluka-list`;

      const response = await axios.get(endpoint, {
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
  