import MainPage from "./Pages/MainPage/MainPage.jsx";
import Navbar from "./components/navbar/navbar.jsx";
import SearchBar from "./components/searchBar/searchBar.jsx";
import Auth from "./Pages/Authentification/auth.jsx";
import GroupPage from "./Pages/GroupPage/GroupPage.jsx";
import CreateEvent from "./Pages/CreateEvent/CreateEvent.jsx";
import './App.css'
import Modal from './components/modal/modal.jsx';
import Backdrop from './components/backdrop/backdrop.jsx';
import Calendar from './components/calendar/calendar.jsx'
import Outlet from 'react'
import Registration from "./Pages/Registration/Registration.jsx"
import Home from "./Pages/Home/Home.jsx"
import CreateGroup from "./Pages/CreateGroup/CreateGroup.jsx"
import EditGroup from './Pages/EditGroup/EditGroup.jsx';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import ViewGroup from './Pages/ViewGroup/ViewGroup.jsx';
import EditEvent from './Pages/EditEvent/EditEvent.jsx';
import IndexUserPage from './Pages/IndexUserPage/IndexUserPage.jsx';
import ShowUserPage from './Pages/ShowUserPage/ShowUserPage.jsx';
import EditUserPage from './Pages/EditUserPage/EditUserPage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  const [isModalOpen,setIsModalOpen]= useState(false);
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

    <>
    <Navbar></Navbar>
      <SearchBar></SearchBar>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<Home />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Group/Create" element={<CreateGroup/>}/>
        <Route path="/Group/Edit" element={<EditGroup/>}/>
        <Route path="/Group/Show" element={<ViewGroup/>}/>
        <Route path="/Group/Menu/*" element={<GroupPage />} />
        <Route path='/Event/Create/:groupId' element={<CreateEvent/>}></Route>
        <Route path='/Event/Edit/:id' element={<EditEvent/>}></Route>
        <Route path="/user/:userId" element = {<ShowUserPage />} />
        <Route path="/user/" element ={<IndexUserPage />} />
        <Route path="/user/edit/:userId" element={<EditUserPage/>}/>
      </Routes>
      </>
  )
}

export default App;
