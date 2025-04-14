import MembersBar from "../../components/membersBar/membersBar";
import MessageBar from "../../components/messageBar/messageBar";
import MessageList from "../../components/messageList/messageList";
import "./GroupPage.css";

function GroupPage() {
  return (
    <div className="container">
      <div className="flex">
        <MessageList></MessageList>
        <MessageBar></MessageBar>
      </div>
      <MembersBar></MembersBar>
    </div>
  );
}

export default GroupPage;
