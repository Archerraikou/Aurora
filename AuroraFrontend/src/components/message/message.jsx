import React, { useState, useEffect } from "react";

function Message({messageId})
{
    const [message, setMessage] = useState(null);
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
            }
        
        fetchMessage();
    },[messageId]);
    console.log(message)
    return (
        <div>
            {messageId}
        </div>
    );
}

export default Message;