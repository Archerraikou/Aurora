import "./adminuserinfo.css";
function AdminUserInfo({userInfo})
{
    {/* Momentan sunt hardcodate */}
    userInfo.interests = ["Matematica", "Informatica", "Chimie"]
    return (
        <div className="AdminUserInfo">
            <img src={userInfo.profilePicture || "../../../defaultpp.png"} alt= "Profile Picture"/>
            <p>id: {userInfo.id}</p>
            <p>Nick:{userInfo.nick}</p>
            <p>Email:{userInfo.email}</p>
            <p>Profile Description:{userInfo.profileDescription || "No description"}</p>

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