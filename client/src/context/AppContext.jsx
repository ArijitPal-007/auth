import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const backendUrl = "http://localhost:8000"
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null); 

    const getAuthStatus = async()=>{
        try {
            const {data} =await axios.get(backendUrl+"/api/auth/isAuth")
            if(data.success){
                setIsLoggedin(true)
                getUser()
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    const getUser = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/userDetails");
    
            console.log("User Data Response:", data);
    
            if (data.success) {
                setUserData(data.userData);
                console.log("Updated userData:", data.userData);
            } else {
                toast.error(error.message);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Something went wrong");
        }
    };
    
    useEffect(()=>{
        getAuthStatus()
    },[])
    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin, // Added setIsLoggedin
        userData,
        setUserData,
        getUser,
        getAuthStatus
    };

    return (
        <AppContext.Provider value={value}>
            {props.children} {/* Fixed children rendering */}
        </AppContext.Provider>
    );
};
