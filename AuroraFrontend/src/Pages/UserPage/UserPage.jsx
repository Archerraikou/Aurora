import React, { useState, useEffect } from "react";
import "./UserPage.css"
import UserInfo from "../../components/userinfo/userinfo.jsx"


function UserPage()
{
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                const response = await fetch("https://localhost:7242/api/User");
                if(!response.ok)
                {
                    throw new Error(`HTTP Error! status: ${response.status}`);
                }
                const json = await response.json();
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
    },[]);
    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error}</div>;
    if(!userData) return <div>No User Data Found</div>;

    return (
        <div>
            <h1>test</h1>
            <hr></hr>
                {Array.isArray(userData) && userData.length > 0 ? (
                    <div className="user-list">
                            {
                            userData.map((user)=> (
                                <UserInfo userInfo={user}/>
                            ))}
                    </div>
                ): (<div> No Users found</div>)}
        </div>
    );
}

export default UserPage;