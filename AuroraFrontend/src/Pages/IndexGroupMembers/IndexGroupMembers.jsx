import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./IndexGroupMembers.css"
import AdminUserInfo from "../../components/groupadminuserinfo/adminuserinfo.jsx"
import AdminButtons from "../../components/groupadminbuttons/adminbuttons.jsx";
import Cookies from "universal-cookie";


function IndexGroupMembers()
{
    var cookies= new Cookies();
    const queryParams = new URLSearchParams(location.search);
    const groupId= queryParams.get('id');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                const response = await fetch(`https://localhost:7242/api/UserGroups?groupId=${groupId}`,{
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
    },[groupId]);
    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error}</div>;
    if(!userData) return <div>No User Data Found</div>;
    var userType = userData[0];
    var remainingUsers = userData.slice(1);
    
    return (
        <div>
            <h1>Index User Page</h1>
            <hr></hr>
                {Array.isArray(remainingUsers) && remainingUsers.length > 0 ? (
                    <div className="user-list">
                            {
                                remainingUsers.map((user)=> (
                                    <div>
                                        <AdminUserInfo userInfo={user} />
                                        {userType=="Admin" && <AdminButtons userInfo={user} />}
                                        <hr/>
                                    </div>
                            ))}
                    </div>
                ): (<div> No Users found</div>)}
        </div>
    );
}

export default IndexGroupMembers;