import axiosInstance from "../axios/axiosInstance"

export const register = async ({email, username , password }) => {
    try {
        const response = await axiosInstance.post('/auth/register', {email, username, password})
        if(response.status !== 201) {
            console.log(response);
            throw new Error(`${response.data.msg}`)
        }
        return "Registered Successfully";
    } catch(error) {
        console.error(error);
        return error.response.data.msg;
    }
}

export const login = async ({email, password}) => {
    try {
        const response = await axiosInstance.post('/auth/login', {email, password});
        if(response.status !== 200) {
            throw new Error(`${response.data.msg}`)
        }
        localStorage.setItem("authToken", response.data.token);
        console.log(localStorage.getItem("authToken"))
        return response;
    } catch(e) {
        if(e.response && e.response.data && e.response.data.msg) {
            return {error: e.response.data.msg};
        }
        return {error: e.message};
    }
}