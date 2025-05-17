import React, { useState, useEffect } from "react";
import "./message.css"
function Message({messageId})
{
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    // aici se poate configura sa arate bine mesajele :D
    // user - are toate informatiile utilizatorului
    // message - are mesajul

    useEffect(()=>{

        const fetchMessage = async ()=>{

            try {
                const response = await fetch(`https://localhost:7242/api/Messages/Show/${messageId}`,{
                    method:"GET",
                })
                if(!response.ok)
                {
                    return response.status;
                }
                Message = await response.json();
                setMessage(Message);
            }
            catch(e)
            {
                console.log(e.message);
            }
            finally
            {
                setLoading(false);
            }
        }
        
        fetchMessage();
    },[messageId]);
    if(loading)
    {
        return <div></div>
    }
    console.log(message.userId)
    return (
        <div className="current-user-message">
           <img className="message-profile-picture" src={"https://localhost:7242/api/User/pfp/" + message.userId}></img><b>{message.user.nickname} </b>: {message.content};
        </div>
    );
}

export default Message;