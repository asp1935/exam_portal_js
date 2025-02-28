import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addRepresentative, deleteRepresentative, downloadRepresentativePdf, getRepresentative, updateRepresentative } from "../api/representativeAPI";

export const useRepresentative = (centerId) => {
    return useQuery({
        queryKey: ["represenatatives", centerId],
        queryFn: () => getRepresentative(centerId),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
};

export const useAddRepresenatative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ centerId, repName, repMobile }) => addRepresentative(centerId, repName, repMobile),
        onSuccess: () => {
            queryClient.invalidateQueries(["represenatatives"]); // Refresh after adding
        },
    });
};

export const useUpdateRepresenatative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, newRepName, newRepMobile }) => updateRepresentative(id, newRepName, newRepMobile),
        onSuccess: () => {
            queryClient.invalidateQueries(["represenatatives"]); // Refresh after updating
        },
    });
};

export const useDeleteRepresentative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => deleteRepresentative(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["represenatatives"]); // Refresh after deleting
        },
    });
};


export const useDownloadRepresenatativePDF = (centerId) => {
    return useQuery({
        queryKey: ['pdfDownload', centerId],
        queryFn: () => downloadRepresentativePdf(centerId),
        enabled: false, // Disable auto-fetch
    });
};