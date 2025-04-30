import React, {useState, useEffect} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr'
import "./chatcomponent.css"
import Message from "../message/message.jsx"

const ChatComponent = () => {
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
                setError(error.message);
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
                connection.on('ReceiveMessage', (user, message) =>{
                    setMessages(prev => [...prev, {user, message}]);
                });
            }).catch(console.error);
            
        }
        return () => {
            if(connection) connection.stop();
        };
    }, [connection]);
    const sendMessage = async (e) => {
        e.preventDefault();
        if (messageInput && user) {
            try {
                await connection.invoke('SendMessage', user.nick, messageInput);
                setMessageInput('');
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