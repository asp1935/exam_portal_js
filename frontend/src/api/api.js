import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

export const login = async (email, password) => {
    try {
        const responce = await axios.post(`${apiUrl}/user/login`, { email, password }, { withCredentials: true });
        return responce.data;
    } catch (error) {
        throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
}

export const getloggedInUser = async () => {
    try {
        const responce = await axios.get(`${apiUrl}/user/current-user`, { withCredentials: true });
        return responce.data
    } catch (error) {
        throw 'Session Expired!!! Please Login Again...';
    }
}






