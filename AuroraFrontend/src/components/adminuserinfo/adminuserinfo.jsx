import "./adminuserinfo.css";
function AdminUserInfo({userInfo})
{
    
    console.log(userInfo)
    userInfo.interests = ["Matematica", "Informatica", "Chimie"]
    return (
        <div className="AdminUserInfo">
            <img src={"https://localhost:7242/api/ApplicationUsers/pfp/" + userInfo.id} alt= "Profile Picture"/>
            <p>Id: {userInfo.id}</p>
            <p>Nickname:{userInfo.nickname}</p>
            <p>Email:{userInfo.email}</p>
            <p>Profile Description:{userInfo.desc || "No description"}</p>
            <p>Role: {userInfo.role}</p>

            <p>Interests:</p>
            <ul>
            {
                    userInfo.interests.map(d=>(
                        <li key={d}>{d}</li>
                    ))
            }
            </ul>
        </div>
    );
}

export default AdminUserInfo;