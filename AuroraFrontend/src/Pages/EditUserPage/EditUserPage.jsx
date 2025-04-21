import React, { useState, useEffect } from "react";
import { useParams , useNavigate} from "react-router-dom";
import "./EditUserPage.css"
import AdminUserInfo from "../../components/adminuserinfo/adminuserinfo.jsx"


function EditUserPage()
{

        <div>
            <h1>Edit User Page</h1>
            <hr></hr>
            <form action={"https://localhost:7242/api/User/edit/" + userId}>
                <div>
                    <label>Nick: </label>
                    <input
                        type="text"
                        name="nick"
                        value={user.nick}
                    />
                </div>
                <div>
                    <label>Profile Description:</label>
                    <textarea
                        type="text"
                        name="profileDescription"
                        value={user.profileDescription}
                    />
                </div>
                    <label>Profile Picture</label>
                    <input
                        type="file"
                        name="profilePicture"

                    />
                <div>

                </div>
            </form>
        </div>
    );
}

export default EditUserPage;;