import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

export const getRepresentative = async (centerId = null) => {
    try {
        const endpoint = centerId ? `${apiUrl}/representative/get-all-representatives/${centerId}` : `${apiUrl}/representative/get-all-representatives`;
        const response = await axios.get(endpoint, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch Representative!!!");
    }
};

export const addRepresentative = async (centerId, repName,repMobile) => {
    try {
        console.log(centerId,repMobile,repName);
        
        const response = await axios.post(`${apiUrl}/representative/add-representative`, {centerId,repName,repMobile}, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Add Representative!!!";
    }
}

export const updateRepresentative = async (repId,newRepName,newRepMobile) => {
    try {
        const response = await axios.patch(`${apiUrl}/representative/update-representative/${repId}`, { newRepName,newRepMobile }, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Update Representative!!!";
    }
}

export const deleteRepresentative = async (repId) => {
    try {
        const response = await axios.delete(`${apiUrl}/representative/delete-representative/${repId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        throw error.response?.data?.message || "Failed to Delete Representative!!!";
    }
}

export const downloadRepresentativePdf = async (centerId=null) => {
    try {
        console.log(centerId);
        
        const endpoint = centerId ? `${apiUrl}/representative/get-representative-pdf/${centerId}` : `${apiUrl}/representative/get-representative-pdf`;

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
  