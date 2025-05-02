import React, {useState, useEffect} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr'
import "./chatcomponent.css"
import Message from "../message/message.jsx"

const ChatComponent = ({groupId}) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() =>{
        const newConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:7242/chathub')
        .withAutomaticReconnect()
        .build();

        setConnection(newConnection);
    }, []);

    useEffect(()=>{
        if(connection)
        {
            connection.start()
            .then(()=>{
                connection.invoke("JoinGroup", groupId);
                connection.on('ReceiveMessage', (user, message) =>{
                    setMessages(prev => [...prev, {user, message}]);
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
    const sendMessage = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        console.log("This is the form data console log dumbass: ")
        console.log(e.target[0].value)
        formData.append("UserId", e.target[0].value)
        console.log(e.target[1].value)
        // Groups are not yet made
        // formData.append("GroupId", e.target[1].value)
        console.log(e.target[2].value)
        formData.append("Content", e.target[2].value)
        console.log(formData)
        setMessageInput('');
        if (messageInput && user) {
            try {
                await connection.invoke('SendMessageToGroup', user.nick, messageInput, groupId);
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
                            console.log("Message sent!!")
                        }

                
                    }
                    catch (e)
                    {
                        console.log(e.message)
                    }

                };
                sendMessageToServer();
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
            <form action="sendMessage" onSubmit={sendMessage}>
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
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} user={userData}/>
                ))}
            </div>
        </div>
    );

};

export default ChatComponent;