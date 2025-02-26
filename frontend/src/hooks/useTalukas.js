import { useQuery , useQueryClient ,useMutation} from "@tanstack/react-query"
import { addTaluka, deleteTaluka, downloadTalukaPdf, getTalukas, updateTaluka } from "../api/talukaAPI"

export const useTalukas=(distId)=>{
    return useQuery({
        queryKey:['talukas',distId],
        queryFn:()=>getTalukas(distId),
        staleTime:5*60*1000 //cache 5 min
    })
};

export const useAddTaluka=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({districtId,talukaName})=>addTaluka(districtId,talukaName),
        onSuccess:()=>{
            queryClient.invalidateQueries(['talukas']);
        },
    });
};

// Update District
export const useUpdateTalukas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedData }) => updateTaluka(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["talukas"]); // Refresh after updating
    },
  });
};

// Delete District
export const useDeleteTalukas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id})=>deleteTaluka(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["districts"]); // Refresh after deleting
    },
  });
};

//District List PDf
export const useDownloadTalukaPDF = (distId) => {
  return useQuery({
    queryKey: ['pdfDownload',distId],
    queryFn: ()=>downloadTalukaPdf(distId),
    enabled: false, // Disable auto-fetch
  });
};
