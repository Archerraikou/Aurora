import Modal from '../../components/modal/modal.jsx';
import Backdrop from '../../components/backdrop/backdrop.jsx';
import Cookies from 'universal-cookie';
import Login from '../../components/login/login.jsx';
import { useEffect, useState } from 'react';
import './Home.css';

function Home() {
  const cookies = new Cookies();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // On mount: check login status
  useEffect(() => {
    const jwt = cookies.get("JWT");
    const localFlag = localStorage.getItem("isLoggedIn");
    if (jwt && localFlag === "true") {
      setLoggedIn(true);
    }
  }, []);

  const handleModalClose = () => {
    const jwt = cookies.get("JWT");
    if (jwt) {
      localStorage.setItem("isLoggedIn", "true");
      setLoggedIn(true);
    }
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    cookies.remove("JWT", { path: '/' });
    cookies.remove("JWTRefresh", { path: '/' });
    cookies.remove("Roles", { path: '/' });
    cookies.remove("ExpirationDate", { path: '/' });
    localStorage.removeItem("isLoggedIn");
    setLoggedIn(false);
  };

  return (
    <>
      {!loggedIn && (
        <button className="login-button" onClick={() => setIsModalOpen(true)}>
          Login
        </button>
      )}
      {loggedIn && (
        <button className="login-button" onClick={handleLogout}>
          Logout
        </button>
      )}

      <div className="app-container">
        {isModalOpen && (
          <>
            <Backdrop onClick={handleModalClose} />
            <Modal>
              <Login closeModal={handleModalClose} />
            </Modal>
          </>
        )}
      </div>
    </>
  );
}

export default Home;
