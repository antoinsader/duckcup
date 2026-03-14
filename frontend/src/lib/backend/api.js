import { apiRequest } from "../api/api";



export const read_server_status =async () => {
  // Return True if server running
    try{
        const st = await apiRequest({
            method:"GET",
            route: "",
            timeout: 700,
        });
        return st && st.success
        
    }catch(ex){
        return false;
    }
}