import React, { useState, useEffect } from "react";
import { useParams , useNavigate, Navigate} from "react-router-dom";
import "./EditUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"
import Cookies from "universal-cookie";
import Modal from "../../components/Modal/modal.jsx"
function InterestCheckbox({name, interestList})
{
    if(interestList.includes(name))
    {
        return (
            <div>
                <li>
                    <input 
                        type="checkbox"
                        name={"interest_"+name}
                        defaultValue={name}
                        defaultChecked={true}
                    />
                    <label>{name}</label>
                </li>
            </div>
        )
    }
    else 
        return (
            <div>
                <li>
                    <input 
                        type="checkbox"
                        name={"interest_"+name}
                        defaultValue={name}
                    />
                    <label>{name}</label>
                </li>
            </div>
        )
}


function EditUserPage()
{
    const navigate = useNavigate();
    const cookies = new Cookies();
    function submitData(initialFormData)
    {
        const interestRegex = new RegExp("interest_*")
        
        
        var formInfo = new FormData();
        formInfo.append("Id", initialFormData.get("id"));
        formInfo.append("Nick", initialFormData.get("username"));
        formInfo.append("Email", initialFormData.get("email"));
        formInfo.append("ProfilePicture", initialFormData.get("image"));
        formInfo.append("ProfileDescription",initialFormData.get("profileDescription"));
        //TODO: Sa facem categoriile normale
        // var selectedInterests = [];
        // for(const key of initialFormData.keys()) 
        // {
        //     if(interestRegex.test(key))
        //     {
        //         selectedInterests.push(key.slice(9));
        //     }
        // }
        // formInfo.append("Interests", selectedInterests);
        console.log(formInfo);
        
        var updateUser = async (info) =>
        {
        try{
            const response = await fetch(`https://localhost:7242/api/ApplicationUsers/edit/${info.get("Id")}`,
                {
                    method:"POST",
                    headers: {
                        'Authorization': cookies.get("JWT")
                    },
                    body: info 
                }
            );
            const text = await response.text();
            const data = text ? JSON.parse(text):{};
            console.log("Server Response: ", data);
            if(!response.ok)
            {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return data;
            
        }
        catch(error)
        {
            console.log("Failed", error)
        }
        }
        updateUser(formInfo)
        navigate("/")
    } 

    const {userId} = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                const response = await fetch(`https://localhost:7242/api/ApplicationUsers/${userId}`,{
                    method: 'GET',
                    headers: {
                        'Authorization': cookies.get("JWT")
                    }}
                )
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
    },[userId]);
    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error}</div>;
    if(!userData) return <div>No User Data Found</div>;

//TODO: momentan si ce interse are userul sunt hardcodate si ce posibile interese sunt hardcodate
    userData.Interests = ["Matematica", "Informatica", "Fizica"];
    var possibleInteresets = ["Matematica", "Informatica", "Fizica", "Chimie", "Biologie"];

    const deleteAccount=async ()=>{
        try
        {
            const response = await fetch(`https://localhost:7242/api/Auth/delete-account`,{
                method: 'DELETE',
                headers: {
                    'Authorization': cookies.get("JWT")
                }}
            )
            if(!response.ok)
            {
                throw new Error(`HTTP Error! status: ${response.status}`);
            }
        }
        catch (error)
        {
            console.error("Fetch error:", error);
            setError(error.message);
        }
    }

    return (
        <Modal className="modal">
            <h1>Edit User Page</h1>
            <hr></hr>
                {/* <AdminUserInfo userInfo={userData}/> */}
                <div>
                    <form action={submitData} className="editUserForm">
                        <input type="hidden" name="id" defaultValue={userData.id}/>
                        <input type="hidden" name="email" defaultValue={userData.email}/>
                        <label>Username</label>
                        <input 
                            type="text"
                            defaultValue={userData.nick}
                            name="username"
                            className='input-field'/>
                        <label>Profile Description</label>
                        <textarea
                            type="text"
                            defaultValue = {userData.profileDescription}
                            name="profileDescription"
                            className='input-field'
                        />
                        <label>Profile Picture</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            name = "image"
                            className='input-field'
                        />

                        <label>Interests</label>
                        <div className="formInterests">

                            <ul>
                            {
                                possibleInteresets.map(d=> (
                                        <InterestCheckbox
                                            key={d}
                                            name={d}
                                            interestList={userData.Interests}
                                        />
                                ))
                            }
                            </ul>

                        </div>
                        <button type="submit">Edit Account Info</button>
                        <button onClick={deleteAccount} className="deleteButton">Delete Account</button>

                    </form>
                </div>
        </Modal>
    );
}
     

export default EditUserPage;