import "./adminuserinfo.css";
function AdminUserInfo({userInfo})
{
    return (
        <div>
            <img src={userInfo.profilePicture} alt= "Picture not available"/>
            <p>id: {userInfo.id}</p>
            <p>Nick:{userInfo.nick}</p>
            <p>Email:{userInfo.email}</p>
            <p>Profile Description:{userInfo.profileDescription || "No description"}</p>
        </div>
    );
}

export default AdminUserInfo;