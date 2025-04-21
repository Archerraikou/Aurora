import { Route, Routes, useParams } from "react-router-dom";
import MembersBar from "../../components/membersBar/membersBar";
import MessageBar from "../../components/messageBar/messageBar";
import MessageList from "../../components/messageList/messageList";
import { useNavigate, useLocation } from 'react-router-dom';
import "./GroupPage.css";

function GroupPage() {
  const navigate= useNavigate();
  const location = useLocation();
  const groupId = location.pathname.replace("/Group/Menu/", "");
  const handleCreateEvent= ()=>{
    navigate(`/Event/Create/${groupId}`);
  };
  return (
    <div className="container">
      <div className="flex">
        <MessageList></MessageList>
        <MessageBar></MessageBar>
      </div>
      <MembersBar></MembersBar>
      <button onClick={handleCreateEvent}>Create Event</button>
    </div>
  );
}

export default GroupPage;
