
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import Login from "../../components/login/login.jsx";
import "./auth.css";
import Modal from "../../components/Modal/modal.jsx";
import Backdrop from "../../components/backdrop/backdrop.jsx";
import Calendar from "../../components/calendar/calendar.jsx";

function Auth() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="app-container">
      <button className="login-button" onClick={() => setIsModalOpen(!isModalOpen)}>
        Login
      </button>
      {isModalOpen && (
        <>
          <Backdrop onClick={() => setIsModalOpen(false)} />
          <Modal>
            <Login closeModal={() => setIsModalOpen(false)} />
          </Modal>
        </>
      )}
    </div>
  );
}

export default Auth;
