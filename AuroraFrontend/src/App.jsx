import './App.css'
import Modal from './components/modal/modal.jsx';
import Backdrop from './components/backdrop/backdrop.jsx';
import Calendar from './components/calendar/calendar.jsx'
import Outlet from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from "./pages/Registration/Registration.jsx"
import Home from "./pages/Home/Home.jsx"
import CreateGroup from "./pages/CreateGroup/CreateGroup.jsx"
import EditGroup from './pages/EditGroup/EditGroup.jsx';
import { useEffect } from 'react';
import Cookies from 'universal-cookie';
import ViewGroup from './pages/ViewGroup/ViewGroup.jsx';
function App() {
  const cookies = new Cookies();
  useEffect( () => {
    async function Refresh(){
    if(cookies.get("ExpirationDate")-Date.now()<5*60*1000 && cookies.get("JWT")!=null){
      try {
        var Refresh = {refreshToken: cookies.get("JWTRefresh")};
        const response = await fetch('https://localhost:7242/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Refresh)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        cookies.set('JWT', "Bearer " + json.accessToken, { path: '/' });
        cookies.set('JWTRefresh',json.refreshToken,{path: '/'})
        cookies.set('ExpirationDate',json.expiresIn*1000+Date.now(), {path: '/'})
        try {
          const response = await fetch('https://localhost:7242/api/Auth/roles', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
              'Authorization': cookies.get("JWT")
             },
          });
          const json = await response.json();
          cookies.set("Roles",json.roles[0],{path:'/'});
        }
        catch(error){
            console.log('Error getting role:',error);
          }
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
    else return ()=>{};
  }Refresh()},
  [])
  return (
    <div>
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
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/Group/Create" element={<CreateGroup/>}/>
          <Route path="/Group/Edit" element={<EditGroup/>}/>
          <Route path="/Group/Show" element={<ViewGroup/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
