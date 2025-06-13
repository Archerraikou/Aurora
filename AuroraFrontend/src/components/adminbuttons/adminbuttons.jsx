import "./adminbuttons.css";
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';

function AdminButtons({ userInfo }) {
    const cookies = new Cookies();
    const navigate = useNavigate();

    return (
        <div>
            {/* Delete Button */}
            <button onClick={async () => {
                try {
                    const response = await fetch(`https://localhost:7242/api/ApplicationUsers/delete-account?id=${userInfo.id}`, {
                        method: "DELETE",
                        headers: {
                            'Authorization': cookies.get('JWT')
                        }
                    });
                    if (response.ok) {
                        alert("User Deleted!");
                        location.reload();
                    }
                } catch (error) {
                    console.error("Delete failed: ", error);
                }
            }}>Delete</button>

            {/* Change Role Button */}
            {!userInfo.iscurrent && (
                <button onClick={async () => {
                    try {
                        const params = `?id=${userInfo.id}&&newrole=` + (userInfo.role === 'Admin' ? 'User' : 'Admin');
                        const response = await fetch(`https://localhost:7242/api/ApplicationUsers/changeRole${params}`, {
                            method: "PATCH",
                            headers: {
                                'Authorization': cookies.get('JWT')
                            }
                        });
                        if (response.ok) {
                            alert("User's role changed!");
                            location.reload();
                        }
                    } catch (error) {
                        console.error("Changing role failed: ", error);
                    }
                }}>
                    {userInfo.role === 'Admin' ? 'Demote' : 'Promote'}
                </button>
            )}

        </div>
    );
}

export default AdminButtons;
