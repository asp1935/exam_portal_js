import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDistrict, deleteDistrict, downloadDistrictPdf, getAllDistrict, updateDistrict } from "../api/districtAPI";

// Fetch Districts
export const useDistricts = () => {
  return useQuery({
    queryKey: ["districts"],
    queryFn: getAllDistrict,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Add District
export const useAddDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries(["districts"]); // Refresh after adding
    },
  });
};

// Update District
export const useUpdateDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedData }) => updateDistrict(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["districts"]); // Refresh after updating
    },
  });
};

// Delete District
export const useDeleteDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id})=>deleteDistrict(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["districts"]); // Refresh after deleting
    },
  });
};


//District List PDf
export const useDownloadPDF = () => {
  return useQuery({
    queryKey: ['pdfDownload'],
    queryFn: downloadDistrictPdf,
    enabled: false, // Disable auto-fetch
  });
};