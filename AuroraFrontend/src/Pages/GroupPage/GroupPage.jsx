import { Route, Routes, useParams } from "react-router-dom";
import MembersBar from "../../components/membersBar/membersBar";
import MessageBar from "../../components/messageBar/messageBar";
import MessageList from "../../components/messageList/messageList";
import ChatComponent from "../../components/chatcomponent/chatcomponent";
import { useNavigate, useLocation } from "react-router-dom";
import "./GroupPage.css";

function GroupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.pathname.replace("/Group/Menu/", "");
  const handleCreateEvent = () => {
    navigate(`/Event/Create/${groupId}`);
    location.reload();
  };
  return (
    <div className="container">
      <div className="flex">

        <ChatComponent groupId={groupId}/>
        {/* <MessageList></MessageList>
        <MessageBar></MessageBar> */}
      </div>
      <MembersBar></MembersBar>
    </div>
  );
}

export default GroupPage;
