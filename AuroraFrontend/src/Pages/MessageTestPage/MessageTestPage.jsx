import react from 'react';
import "./MessageTestPage.css"
import ChatComponent from '../../components/chatcomponent/chatcomponent.jsx';
import { useParams } from 'react-router-dom';
function MessageTestPage()
{
    const {groupId} = useParams();
    return (
        <ChatComponent groupId={groupId}/>
    );
}

export default MessageTestPage;