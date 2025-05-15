"use client";

//HYDRATION FIX
// if we are in the client then return true, else null
import { useEffect, useState } from "react";

const useMounted = () => {
    const [mounted, setMounted] = useState(false); //  to handle hydration
    useEffect(()=>{
        setMounted(true);
    }, []);
    return mounted;
};
export default useMounted;