import "./userinfo.css";
function UserInfo({userInfo})
{
    return (
        <div>
            <img src={userInfo.profilePicture} alt= "Picture not available"/>
            <p>Nick:{userInfo.nick}</p>
            <p>Email:{userInfo.email}</p>
            <p>Profile Description:{userInfo.profileDescription || "No description"}</p>
            <form action={"https://localhost:7242/api/user/edit/" + userInfo.id} method="post">
                
                <button type="submit">EDIT</button>
            </form>
            <form action={"https://localhost:7242/api/user/delete/" + userInfo.id} method="DELETE">
                <button type="submit">DELETE</button>
            </form>
            <hr></hr>
        </div>
    );
}

export default UserInfo;