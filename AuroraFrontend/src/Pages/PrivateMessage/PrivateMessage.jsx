import Cookies from 'universal-cookie';
import React, {useState, useEffect, useRef} from 'react';
import { useParams } from "react-router-dom";
import PrivateChatComponent from "../../components/privatechatcomponent/privatechatcomponent.jsx"
function PrivateMessage()
{
    // Mesajele private sunt niste grupuri practic.
    // Doar ca in loc ca id-ul "chat-ului" sa fie groupId-ul... 
    // O sa concatenez id-ul userului curent si id-ul userului
    // cu care se face chat-ul privat 
    // (id-urile o sa fie sortate crescator ca sa fim siguri 
    //  ca nu se fac 2 chaturi private)

    const cookies = new Cookies();
    const currentUsersId = cookies.get('UserId')
    const otherUsersId = location.pathname.replace("/PM/" , "");
    const [pmId, setPmId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchPMId = async () =>
        {
            try {
                const params = new URLSearchParams({
                    userId1: currentUsersId,
                    userId2: otherUsersId
                })
                console.log("Params:")
                console.log(params)
                const response = await fetch(`https://localhost:7242/api/PrivateConversation/checkPM?${params}`,
                    {
                        method: 'GET',
                        headers:{
                            'Authorization': cookies.get("JWT"),
                        }
                    }
                )
                if(!response.ok)
                {
                    throw new Error('Failed to fetch pmID: ' + response.error);
                }
                const data = await response.json();
                setPmId(data);
            } catch (e) {
                    console.log(e.message) ;
            } finally
            {
                console.log(pmId);
                setLoading(false);
            }
        }
        fetchPMId();
    },[currentUsersId, otherUsersId, cookies])

    if(loading === true)
    {
        return (<div>Loading...</div>);
    }

    console.log("pmId" + pmId);
    return ( 
    <div className="container">
        <div className="flex">
            <PrivateChatComponent pmId={pmId}/>
        </div>
    </div>
    );
}

export default PrivateMessage;