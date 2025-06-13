import React, { useState, useEffect } from "react";
import "./privatemessage.css"
import Cookies from 'universal-cookie';
function PrivateMessage({messageId})
{
    var offset = new Date().getTimezoneOffset();
    // console.log(offset);
    const cookie = new Cookies();
    const [message, setMessage] = useState(null);
    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [time, setTime] = useState("");
    // aici se poate configura sa arate bine mesajele :D
    // user - are toate informatiile utilizatorului
    // message - are mesajul


    useEffect(()=>{

        const fetchMessage = async ()=>{

            try {
                const response = await fetch(`https://localhost:7242/api/Messages/privateShow/${messageId}`,{
                    method:"GET", 
                    headers:
                    {
                        'Authorization': cookie.get("JWT")
                    },
                })
                if(!response.ok)
                {
                    return response.status;
                }
                const Message = await response.json();
                setMessage(Message);
            }
            catch(e)
            {
                console.log(e.message);
            }
            finally
            {
                setLoading1(false);
            }
        }
        
        fetchMessage();
    },[messageId]);
    useEffect(()=>{
        const getTimeZone = async ()=>{
            try
            {

                const timeZoneOffSet = -new Date().getTimezoneOffset();
                const response = await fetch(`https://localhost:7242/api/Messages/GetMessageTime/${messageId}?TimeZoneOffset=${timeZoneOffSet}`, {
                    method: 'GET',
                    headers:{
                        'Authorization': cookie.get("JWT")
                    },
                });
                if(!response.ok)
                {
                    return response.status;
                }
                const Time = await response.json();
                setTime(Time);

            }
            catch(e)
            {
                console.log(e.message);
            }
            finally
            {
                setLoading2(false);
            }
        }
        getTimeZone();
    },[messageId]);

    if(loading1||loading2)
    {
        return <div></div>
    }
    else
    {

        return (
            <div className="message">
                <img className="message-profile-picture" src={"https://localhost:7242/api/User/pfp/" + message.userId || "https://localhost:7242/images/defaultpp.jpg"}/>
                <div className="message-content">
                    <div className="message-header">
                        <b className="message-username">{message.user.nickname}</b>
                        <span className="message-time">{time.dateTime}</span>
                    </div>
                    <div className="message-text"> {message.content}</div>
                </div>
            </div>
        );
    }

}

export default PrivateMessage;