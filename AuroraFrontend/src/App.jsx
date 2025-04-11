import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Cookies from 'universal-cookie';
import Login from './components/login/login.jsx';
import './App.css'
import Modal from './components/modal/modal.jsx';
import Backdrop from './components/backdrop/backdrop.jsx';
import Calendar from './components/calendar/calendar.jsx'
import Outlet from 'react'

function App() {
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
            <Login closeModal={() => setIsModalOpen(false)}></Login>
          </Modal>

        </>
    )}
    <Calendar></Calendar>
    </div>
  )
}

export default App
