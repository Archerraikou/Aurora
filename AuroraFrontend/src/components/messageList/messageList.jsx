import "./MessageList.css";
import MessageBar from "../messageBar/messageBar";

function MessageList() {
  return (
    <>
      <div className="message-list">
        <p>Aici vor fi mesajele</p>
        <p className="current-user-message">Momentan nu-i nimic</p>
        <p className="current-user-message">Mesaj trimis de userul actual</p>
        <p>Mesaj trimis de alt user</p>
        {/* <MessageBar></MessageBar> */}
      </div>
    </>
  );
}

export default MessageList;
