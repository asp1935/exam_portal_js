import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

export const login = async (email,password) => {
    try {
        // const responce1 = await axios.post(`${apiUrl}/user/login`,{loginData}, { withCredentials: true });
        // console.log(responce1.data);
        

        const responce = await axios.post(`${apiUrl}/user/login`, {email,password}, { withCredentials: true });
        return responce.data;
    } catch (error) {
        console.log(error);
        
    }
}


