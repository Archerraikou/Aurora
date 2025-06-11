import React, { useState, useEffect } from "react";
import "./IndexUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"
import AdminButtons from "../../components/adminbuttons/adminbuttons.jsx";
import Cookies from "universal-cookie";


function IndexUserPage()
{
    // Declaring the cookies and the reactive variables used for showing the users in the group
    var cookies= new Cookies();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        // Getting all the users that are registered
        const fetchData = async () =>{
            try
            {
                const response = await fetch("https://localhost:7242/api/ApplicationUsers",{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : cookies.get('JWT')
                    }
                });

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
        // In this area the details are showed
        <div>
            <h1>Index User Page</h1>
            <hr></hr>
                {Array.isArray(userData) && userData.length > 0 ? (
                    <div className="user-list">
                            {
                            userData.map((user)=> (
                                <div>
                                    <AdminUserInfo userInfo={user}/>
                                    <AdminButtons userInfo={user}/>
                                    <hr/>
                                </div>
                            ))}
                    </div>
                ): (<div> No Users found</div>)}
        </div>
    );
}

export default IndexUserPage;