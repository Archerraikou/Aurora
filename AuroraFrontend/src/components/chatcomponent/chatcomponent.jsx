import React, {useState, useEffect} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr'
import "./chatcomponent.css"

const ChatComponent = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');
    const [messageInput, setMessageInput] = useState('');

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
                await connection.invoke('SendMessage', user, messageInput);
                setMessageInput('');
            } catch (err) {
                console.error(err);
            }
        }
    };
    return (
        <div>
            <h2>Chat</h2>
             <input
                hidden
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Enter your name"
            />
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type your message"
                />
                <button type="submit">Send</button>
            </form>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.user}: </b>{msg.message}
                    </div>
                ))}
            </div>
        </div>
    );

};

export default ChatComponent;