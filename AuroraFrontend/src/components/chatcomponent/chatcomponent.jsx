import React, {useState, useEffect, useRef} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr'
import "./chatcomponent.css"
import Message from "../message/message.jsx"
import Cookies from 'universal-cookie';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils.js';

const ChatComponent = ({groupId}) => {
    const cookie = new Cookies();
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageId, setMessageId] = useState(null);
    const [user, setUser] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [page, setPage] =  useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const scrollIntoRef = useRef({oldScrollHeight : 0, oldScrollTop:0});

    async function fetchMessages(pageNumber)
    {
        setLoadingMessages(true);
        const params = new URLSearchParams({
            groupId: groupId,
            pageNumber: pageNumber
        })
        const response = await fetch(`https://localhost:7242/api/Messages/getPage?${params}`, {
            method: 'GET',
            headers:{
                'Authorization': cookie.get("JWT"),
            }
        });
        const data = await response.json();
        if(data.length === 0) setHasMorePages(false);
        else setMessages(prev=>[...prev, ...data]);
        setLoadingMessages(false);
    }

    useEffect(()=>{
        const container = document.querySelector('.message-list');
        if(!container) return;
        function onScroll()
        {
            // console.log("container.scrollTop(" + -container.scrollTop +") >= container.scrollHeight(" + container.scrollHeight + ") - container.clientHeight(" + container.clientHeight + ")");
            if(-container.scrollTop >= container.scrollHeight - container.clientHeight && hasMorePages && !loadingMessages)
            {
                scrollIntoRef.current.oldScrollHeight = container.scrollHeight;
                scrollIntoRef.current.oldScrollTop = container.scrollTop;
                // console.log(scrollIntoRef.current)
                const nextPage = page + 1;
                fetchMessages(nextPage).then(()=>{
                    setPage(nextPage);
                });
            }
        }
        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, [page, hasMorePages, loading, groupId]);


    useEffect(()=>{
        const fetchData = async ()=>{
            try {
                const params = new URLSearchParams({
                    groupId: groupId,
                    pageNumber: "1"
                });
                const response = await fetch(`https://localhost:7242/api/Messages/getPage?${params}`, {
                    method:"GET",
                    headers:{
                        'Authorization': cookie.get("JWT"),
                        "Content-Type":"application/json",
                    }
                })
                if(!response.ok)
                {
                    console.log(response.error);
                }
                const data = await response.json();
                console.log(data)
                return data;
            } catch (error) {
                console.error("Fetch error: ", error)
            }
        };
        setPage(1);
        setHasMorePages(true);
        fetchData().then(data=>setMessages(data));
        
    }, [groupId])
    // PRELUAM INFORMATII DESPRE UTILIZATOR
    useEffect(()=>{
        const fetchData = async () =>{
            try
            {
                const response = await fetch(`https://localhost:7242/api/User/${cookie.get("UserId")}`)
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
    }, [groupId]);

    // NE CONTECTAM LA GRUPUL DE SIGNALR SI PORNIM SA PRIMIM MESAJE DE PE GRUP
    useEffect(()=>{
        if(connection)
        {
            connection.start()
            .then(()=>{
                connection.invoke("JoinGroup", groupId);
                connection.on('ReceiveMessage', (messageId) =>{

                    setMessages(prev => [messageId, ...prev]);
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
                                headers:{
                                    'Authorization': cookie.get("JWT")
                                },
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
    useEffect(() => {
        if(loadingMessages) return;
        const container = document.querySelector('.message-list')
        if(!container) return;

        const {oldScrollHeight, oldScrollTop} = scrollIntoRef.current;
        if(oldScrollHeight && oldScrollTop)
        {
            const newScrollHeight = container.scrollHeight;
            // console.log(newScrollHeight + " " + oldScrollHeight + " " + oldScrollTop);
            container.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;

            scrollIntoRef.current.oldScrollHeight = 0;
            scrollIntoRef.current.oldScrollTop = 0;
        }
    }, [messages, loadingMessages]);

    if(userData && !user)
        setUser(userData.nick);
    if(loading)
    {
        return (<div> Loading </div>);
    }
    return (
        <div className='chatComponent'>
            {/* Messages tab */}
            <div className='message-list'>
                {messages.map((msgId, index) => (
                    <Message key={index} messageId={msgId}/>
                ))}
                {loadingMessages && <div className="current-user-message"> Loading Messages ... </div>}
                
            </div>
            {/* Messagebar */}
            <form className='form' onSubmit={sendMessage}>
                <input 
                    hidden
                    readOnly
                    value={cookie.get("UserId")}
                />
                <input
                    hidden
                    readOnly
                    value={groupId}
                />
                <input
                    type="text"
                    className='message-bar'
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type your message"
                />
                <button className="send-button" type="submit">Send</button>
            </form>
        </div>
    );

};

export default ChatComponent;