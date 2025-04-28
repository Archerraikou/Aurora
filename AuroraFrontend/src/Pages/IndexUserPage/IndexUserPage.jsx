import React, { useState, useEffect } from "react";
import "./IndexUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"
import AdminButtons from "../../components/adminbuttons/adminbuttons.jsx";


function IndexUserPage()
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
            <h1>Index User Page</h1>
            <hr></hr>
                {Array.isArray(userData) && userData.length > 0 ? (
                    <div className="user-list">
                            {
                            userData.map((user)=> (
                                <div>
                                    <AdminUserInfo userInfo={user}/>
                                    <AdminButtons userId={user.id}/>
                                    <hr/>
                                </div>
                            ))}
                    </div>
                ): (<div> No Users found</div>)}
        </div>
    );
}

export default IndexUserPage;