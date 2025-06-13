import React, { useState, useEffect } from "react";
import { useParams , useNavigate, Navigate} from "react-router-dom";
import "./EditUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"
import Cookies from "universal-cookie";
import fetchCategories from "../../utils/utils.jsx";
function InterestCheckbox({key, name, interestList})
{
    console.log("name: ")
    console.log(name)
    console.log("interestList: ")
    console.log(interestList)
    const interestListNames = interestList.map(m=>{m.categoryName});
    console.log(interestListNames)
    return (
        <div>
            <li>
                <input 
                    type="checkbox"
                    name={"interest_"+name.categoryName}
                    defaultValue={name.categoryName}
                    defaultChecked={interestList.includes(name.categoryName)}
                />
                <label>{name.categoryName}</label>
            </li>
        </div>
    );
}
    



function EditUserPage()
{
    const cookies = new Cookies()
    const {userId} = useParams();
    const [userData, setUserData] = useState(null);
    const [allInterests, setAllInterests] = useState(null);
    const [userInterests, setUsersInterests] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleSubmit = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.target)
        submitData(formData);
    }
    function submitData(initialFormData)
    {
        const interestRegex = new RegExp("interest_*")
        
        var formInfo = new FormData();
        formInfo.append("Id", initialFormData.get("id"));
        formInfo.append("Nick", initialFormData.get("username"));
        formInfo.append("Email", initialFormData.get("email"));
        formInfo.append("ProfilePicture", initialFormData.get("image"));
        formInfo.append("ProfileDescription",initialFormData.get("profileDescription"));
        // TODO: Sa facem categoriile normale
        var selectedInterests = [];
        for(const key of initialFormData.keys()) 
        {
            if(interestRegex.test(key))
            {
                selectedInterests.push(key.slice(9));
            }
        }
        formInfo.append("Interests", selectedInterests);
        console.log(formInfo);
        
        const updateUser = async (info) =>
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

    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                // nu merge cu ApplicationsUsers, moment il las cu metoda din controllerul celalalt ca ala merge, probabil o problem cu autorizatiile pe care nu pot sa o rezolv
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
            
        };
        fetchData();
    },[userId]);

    useEffect(()=>{
        const getInterests = async ()=>{
            try{
                const bruh = await fetchCategories();
                setAllInterests(bruh);
            }
            catch{
                setError("Failed to load interests");
            }
        }
        getInterests();
    },[])

    useEffect(()=>{
        const fetchUserInterests = async () =>{
            try{
                const response = await fetch(`https://localhost:7242/api/ApplicationUsers/GetUserCategory/${userId}`, {
                    headers :{
                        Authorization : cookies.get("JWT")
                    }
                })
                if(!response.ok)
                {
                    throw new Error("Issue with fetching user interests");
                }
                setUsersInterests(await response.json());
            }
            catch(e){
                console.log(e.message);
            }
        }
        fetchUserInterests();
    },[])

    useEffect(()=>{
        if(allInterests && userData&& userInterests) setLoading(false);
    },[allInterests, userData, userInterests]);
   
    console.log(allInterests);
    console.log(userInterests);

    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error}</div>;
    if(!userData) return <div>No User Data Found</div>;

    const deleteAccount=async ()=>{
            try
            {
                const response = await fetch(`https://localhost:7242/api/ApplicationUsers/delete-account`,{
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
//TODO: momentan si ce interse are userul sunt hardcodate si ce posibile interese sunt hardcodate
    return (
        <div>
            <hr></hr>
                {/* <AdminUserInfo userInfo={userData}/> */}
                <div className="editUserFormContainer">
                    <h2 className="form-header">Edit User</h2>
                    <form onSubmit={handleSubmit} className="editUserForm">
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
                                allInterests.map((d,i)=> (
                                        <InterestCheckbox
                                            key={i}
                                            name={d}
                                            interestList={userInterests || []}
                                        />
                                ))
                            }
                            </ul>

                        </div>
                        <button type="submit">Edit Account Info</button>
                        <button onClick={deleteAccount} className="deleteButton">Delete Account</button>

                    </form>
                </div>
            </div>
    );
}
     

export default EditUserPage;