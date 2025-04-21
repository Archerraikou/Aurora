import Modal from '../../components/modal/modal.jsx';
import Backdrop from '../../components/backdrop/backdrop.jsx';
import Cookies from 'universal-cookie';
import Login from '../../components/login/login.jsx';
import { useEffect, useState } from 'react'
import './Home.css'
import Calendar from '../../components/calendar/calendar.jsx';

function Home(){
    const cookies = new Cookies();
    const [loggedIn, setLoggedIn] = useState(cookies.get("JWT")!=null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    return(
        <>
            {!loggedIn&&<button className="login-button" onClick={() => setIsModalOpen(!isModalOpen)}>
            Login
            </button>}
            {loggedIn&&<button className="login-button" onClick={() => {
                cookies.set("JWT",null);
                cookies.set("JWTRefresh",null)
                cookies.set("Roles",null);
                cookies.set("ExpirationDate",null)
                setLoggedIn(false);
            }}>
            Logout
            </button>}
            <div className="app-container">
                {isModalOpen && (
                    <>
                    <Backdrop onClick={() => setIsModalOpen(false)} />
                    <Modal>
                        <Login closeModal={() => {setLoggedIn(true);setIsModalOpen(false)}}></Login>
                    </Modal>
                    </>
                )}
            </div>
            <Calendar></Calendar>
        </>
    )
}
export default Home