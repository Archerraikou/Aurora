import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ShowUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"


function ShowUserPage()
{
    const {userId} = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                const response = await fetch(`https://localhost:7242/api/User/${userId}`)
                if(!response.ok)
                {
                    throw new Error(`HTTP Error! status: ${response.status}`);
                }
                const json = await response.json();
                console.log(json);
                setUserData(json);
            }
            catch (error)
            {
                console.error("Fetch error:", error);
                setError(error.message);
            }
            finally
            {
                setLoading(false);
            }
        };
        fetchData();
    },[userId]);
    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error}</div>;
    if(!userData) return <div>No User Data Found</div>;

    
    return (
        <div>
            <h1>Show User Page</h1>
            <hr></hr>
                <AdminUserInfo userInfo={userData}/>
        </div>
    );
}

export default ShowUserPage;