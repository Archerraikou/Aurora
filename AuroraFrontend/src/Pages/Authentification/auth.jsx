import React, { useState } from 'react';
import Login from '../../components/login/login.jsx';
import Modal from '../../components/modal/modal.jsx';
import Backdrop from '../../components/backdrop/backdrop.jsx';
import './auth.css';

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
