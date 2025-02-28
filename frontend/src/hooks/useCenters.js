import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addCenter, deleteCenter, downloadCenterPdf, getCenters, updateCenter } from "../api/centerAPI";

// Fetch Districts
export const useCenters = (districtId,talukaId) => {
  return useQuery({
    queryKey: ["centers",districtId,talukaId],
    queryFn: ()=>getCenters(districtId,talukaId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Add District
export const useAddCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({talukaId,centerName})=> addCenter(talukaId,centerName),
    onSuccess: () => {
      queryClient.invalidateQueries(["centers"]); // Refresh after adding
    },
  });
};

// Update District
export const useUpdateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id,newCenterName  }) => updateCenter(id, newCenterName),
    onSuccess: () => {
      queryClient.invalidateQueries(["centers"]); // Refresh after updating
    },
  });
};

// Delete District
export const useDeleteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id})=>deleteCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["centers"]); // Refresh after deleting
    },
  });
};


//District List PDf
export const useDownloadCenterPDF = (districtId, talukaId) => {
  return useQuery({
    queryKey: ['pdfDownload',districtId,talukaId],
    queryFn: ()=>downloadCenterPdf(districtId,talukaId),
    enabled: false, // Disable auto-fetch
  });
};