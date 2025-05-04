import React, {useState, useEffect} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr'
import "./chatcomponent.css"
import Message from "../message/message.jsx"
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils.js';

const ChatComponent = ({groupId}) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageId, setMessageId] = useState(null);
    const [user, setUser] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // async function getMesssages(messageId)
    // {
    //     try
    //     {
    //         const response = await fetch(`https://localhost:7242/api/Message/Show/`,{
    //             method:"GET",
    //             body: messageId
    //         });
    //         if(!response.ok)
    //         {
    //             console.log(response.error);
    //         }
    //         console.log(response);
    //         return response;

    //     }
    //     catch(e)
    //     {
    //         console.log("Error:" + e.message)
    //     }
    //     return message;
    // }

    // PRELUAM INFORMATII DESPRE UTILIZATOR
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                // hardcodat id-ul userului nu stiu cum sa-l preiau din contul logat
                const response = await fetch(`https://localhost:7242/api/User/${"cd470e43-fa50-425c-901b-070615660d52"}`)
                if(!response.ok)
                {
                    throw new Error(`HTTP Error! status: ${response.status}`);
                }
                const json = await response.json();
                setUserData(json);
            }
            catch (error)
            {
                console.error("Fetch error:", error);
            }
            finally
            {
                setLoading(false);
            }
        };
        if(!userData)
        {
            fetchData();
        }
    });


    // NE CONECTAM LA HUB DE SIGNALR
    useEffect(() =>{
        const newConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:7242/chathub')
        .withAutomaticReconnect()
        .build();

        setConnection(newConnection);
    }, []);

    // NE CONTECTAM LA GRUPUL DE SIGNALR SI PORNIM SA PRIMIM MESAJE DE PE GRUP
    useEffect(()=>{
        if(connection)
        {
            connection.start()
            .then(()=>{
                connection.invoke("JoinGroup", groupId);
                connection.on('ReceiveMessage', (messageId) =>{

                    setMessages(prev => [...prev, messageId]);
                });
            }).catch(console.error);
            
        }
        return () => {
            if(connection)
            {
                connection.invoke('LeaveGroup', groupId);
                connection.stop();
            }
        };
    }, [connection]);


    // FUNCTIA ASTA ESTE APELATA ATUNCI CAND SE FACE SUBMIT LA FORM (se trimite mesajul)
    const sendMessage = async (e) => {
        e.preventDefault();
        // Preluam informatiile din form si le facem un formData
        const formData = new FormData();
        formData.append("UserId", e.target[0].value)
        formData.append("Content", e.target[2].value)
        formData.append("GroupId", e.target[1].value)
        if (messageInput && user) {
            setMessageInput('');
            try {
                // Functia asta trimite informatiile din formData in baza de date, si apoi trimite id-ul mesajului in signalR
                const sendMessageToServer = async ()=>{
                    try{
                        
                            const response = await fetch("https://localhost:7242/api/Messages/send", {
                                method: "POST",
                                body: formData
                            })
                            if(!response.ok)
                            {
                                console.log(response.status)
                            }
                            else
                            {
                                const constantmessageId = await response.json();
                                setMessageId(constantmessageId);
                                console.log("Mesajul a fost trimis in baza de date si are id-ul: " + constantmessageId);
                                return constantmessageId;   
                            }

                
                    }
                    catch (e)
                    {
                        console.log(e.message)
                    }

                };
                const messageIdThatCameback = await sendMessageToServer();
                console.log("De asemenea avem groupId-ul: " + groupId);
                console.log(messageIdThatCameback);
                connection.invoke('SendMessageToGroup', groupId, messageIdThatCameback.toString())
                console.log("Message sent!!")
                
            } catch (err) {
                console.error(err);
            }
        }
    };
    if(userData && !user)
        setUser(userData.nick);
    return (
        <div>
            <h2>Chat</h2>
            {/* Messagebar */}
            <form onSubmit={sendMessage}>
                <input 
                    hidden
                    readOnly
                    value="cd470e43-fa50-425c-901b-070615660d52"
                />
                <input
                    hidden
                    readOnly
                    value={groupId}
                />
                <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type your message"
                />
                <button type="submit">Send</button>
            </form>
            {/* Messages tab */}
            <div>
                {messages.map((msgId, index) => (
                    <Message key={index} messageId={msgId}/>
                ))}
            </div>
        </div>
    );

};

export default ChatComponent;