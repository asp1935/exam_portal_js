import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addSchool, deleteSchool, downloadSchoolPdf, getSchools, updateSchool } from "../api/schoolAPI"

export const useSchools=(districtId=null,talukaId=null,centerId=null)=>{
    return useQuery({
        queryKey:['schools',districtId,talukaId,centerId],
        queryFn:()=>getSchools(districtId,talukaId,centerId),
        staleTime:5*60*1000,
    });
};

//add school
export const useAddSchool=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({centerId,schoolName})=>addSchool(centerId,schoolName),
        onSuccess:()=>{
            queryClient.invalidateQueries(['schools']);
        },
    });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id,schoolName  }) => updateSchool(id, schoolName),
    onSuccess: () => {
      queryClient.invalidateQueries(["schools"]); // Refresh after updating
    },
  });
};

// Delete District
export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id})=>deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["schools"]); // Refresh after deleting
    },
  });
};


//District List PDf
export const useDownloadSchoolPDF = (districtId, talukaId,centerId) => {
  return useQuery({
    queryKey: ['pdfDownload',districtId,talukaId,centerId],
    queryFn: ()=>downloadSchoolPdf(districtId,talukaId,centerId),
    enabled: false, // Disable auto-fetch
  });
};


