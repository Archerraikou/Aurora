import "./adminbuttons.css"
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie'
function AdminButtons({userInfo} )
{
    const cookies = new Cookies();
    const navigate = useNavigate();
    // Handling the kicking command of an account from a group
    return (
        <div>
            <button onClick={async()=>{
                try{
                    const response = await fetch(`https://localhost:7242/api/UserGroups?userId=${userInfo.id}&&groupId=${userInfo.groupid}`, {
                        method:"DELETE",
                        headers: {
                            'Authorization' : cookies.get('JWT')
                        }
                    });
                    if(response.ok){
                        alert("User Deleted!");
                        location.reload();
                    }
                }
                catch(error)
                {
                    console.error("Delete failed: ", error);
                }
            }}> Kick </button>
            {!userInfo.iscurrent && (<button onClick={async()=>{
                try{
                    // Changing the role of a member if the current user is an Admin of said group
                    var params= `?userId=${userInfo.id}&&groupId=${userInfo.groupid}&&role=`+ (userInfo.role=='Admin'?'User':'Admin');
                    const response = await fetch(`https://localhost:7242/api/UserGroups${params}`, {
                        method:"Patch",
                        headers: {
                            'Authorization' : cookies.get('JWT')
                        }
                    });
                    if(response.ok){
                        alert("User's role changed!");
                        location.reload();
                    }
                }
                catch(error)
                {
                    console.error("Changing role failed: ", error);
                }}}> {userInfo.role === 'Admin' ? 'Demote' : 'Promote'} </button>)}
        </div>
    )
}

export default AdminButtons