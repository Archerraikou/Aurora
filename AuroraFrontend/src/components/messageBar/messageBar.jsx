import "./messageBar.css";

function MessageBar() {
  return (
    <div className="footer-mesage">
      <div>
        <form className="form">
          <input
            type="text"
            className="message-bar"
            placeholder="scrie un mesaj"
          ></input>
        </form>
      </div>
    </div>
  );
}

export default MessageBar;
