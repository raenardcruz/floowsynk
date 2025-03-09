import axios from 'axios'

export const getAllWorkflows = async () => {
    let data = {
        headers: {
            "Authorization": `${localStorage.getItem("sessionToken")}`
        }
    };
    return await axios.get("api/workflows", data);
}