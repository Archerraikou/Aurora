import "./adminbuttons.css"
import { useNavigate } from "react-router-dom";
function AdminButtons({userId})
{
    const navigate = useNavigate();
    return (
        <div>
            <button onClick={async()=>{
                try{
                    const response = await fetch(`https://localhost:7242/api/User/delete/${userId}`, {
                        method:"DELETE"
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
            }}> Delete </button>
            <button onClick={()=>{
                navigate(`edit/${userId}`);
            }}> Edit </button>
        </div>
    )
}

export default AdminButtons