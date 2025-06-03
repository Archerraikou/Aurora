import React, { useState, useEffect } from "react";
import "./message.css"
import Cookies from 'universal-cookie';
function Message({messageId})
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
                const response = await fetch(`https://localhost:7242/api/Messages/Show/${messageId}`,{
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
                Message = await response.json();
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
                const response = await fetch(`https://localhost:7242/api/Messages/GetMessageTime/${messageId}?TimeZoneOffset=${timeZoneOffSet}`);
                if(!response.ok)
                {
                    return response.status;
                }
                const Time = await response.json();
                setTime(Time);
                // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // const dateWithTimeZone = {
                //     date: Message.date,
                //     timezone: userTimeZone
                // };
                // console.log("This is the dateWithTimeZone: " + dateWithTimeZone);
                // setTime(dateWithTimeZone);

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
            <div className="current-user-message">
            <img className="message-profile-picture" src={"https://localhost:7242/api/User/pfp/" + message.userId}></img><b>{message.user.nickname} </b>: {message.content} <i> {time.dateTime} </i>
            </div>
        );
    }

}

export default Message;