import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addStudent, deleteStudent, downloadStudentPdf, getStudents, updateStudent } from "../api/studentAPI";

export const useStudents=(districtId=null,talukaId=null,centerId=null,schoolId=null)=>{
    return useQuery({
        queryKey:['students',districtId,talukaId,centerId,schoolId],
        queryFn:()=>getStudents(districtId,talukaId,centerId,schoolId),
        staleTime:5*60*1000,
    });
};

//add school
export const useAddStudent=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({studentDetails})=>addStudent(studentDetails),
        onSuccess:()=>{
            queryClient.invalidateQueries(['students']);
        },
    });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({studentId,updatedDetils  }) => updateStudent(studentId,updatedDetils),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]); // Refresh after updating
    },
  });
};

// Delete District
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({examNo})=>deleteStudent(examNo),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]); // Refresh after deleting
    },
  });
};


//District List PDf
export const useDownloadStudentPDF = (districtId=null, talukaId=null,centerId=null,examNo=null) => {
  return useQuery({
    queryKey: ['pdfDownload',districtId,talukaId,centerId,examNo],
    queryFn: ()=>downloadStudentPdf(districtId,talukaId,centerId,examNo),
    enabled: false, // Disable auto-fetch
  });
};


