import MainPage from "./Pages/MainPage/MainPage.jsx";
import Navbar from "./components/navbar/navbar.jsx";
import SearchBar from "./components/searchBar/searchBar.jsx";
import Auth from "./pages/Authentification/auth.jsx";
import GroupPage from "./Pages/GroupPage/GroupPage.jsx";
import CreateEvent from "./Pages/CreateEvent/CreateEvent.jsx";

import './App.css'
import Modal from './components/Modal/modal.jsx';
import Backdrop from './components/backdrop/backdrop.jsx';
import Calendar from './components/calendar/calendar.jsx'
import Outlet from 'react'
import Registration from "./Pages/Registration/Registration.jsx"
import CreateGroup from "./Pages/CreateGroup/CreateGroup.jsx"
import EditGroup from './Pages/EditGroup/EditGroup.jsx';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import ViewGroup from './pages/ViewGroup/ViewGroup.jsx';
import Login from './components/login/login.jsx';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage.jsx';
import NotificationDetailPage from './pages/NotificationDetailPage/NotificationDetailPage.jsx';

import EditEvent from './Pages/EditEvent/EditEvent.jsx';
import IndexUserPage from './Pages/IndexUserPage/IndexUserPage.jsx';
import ShowUserPage from './Pages/ShowUserPage/ShowUserPage.jsx';
import EditUserPage from './Pages/EditUserPage/EditUserPage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexGroupMembers from "./Pages/IndexGroupMembers/IndexGroupMembers.jsx";
import Categories from "./Pages/Categories/Categories.jsx";
import QuizGenerate from "./Pages/QuizGenerate/QuizGenerate.jsx";
import Call from "./Pages/Call/Call.jsx";
import MessageTestPage from "./Pages/MessageTestPage/MessageTestPage.jsx";
import SearchResults from "./Pages/SearchResults/SearchResults.jsx";
import OAuth from "./Pages/OAuth/OAuth.jsx";
function App() {
  const [isModalOpen,setIsModalOpen]= useState(false);
  const cookies = new Cookies();

  useEffect(() => {
    async function refreshToken() {
      const exp = cookies.get("ExpirationDate");
      const jwt = cookies.get("JWT");
      const refreshToken = cookies.get("JWTRefresh");

      if (exp && jwt && refreshToken && exp - Date.now() < 5 * 60 * 1000) {
        try {
          const body = { refreshToken };

          const response = await fetch('https://localhost:7242/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          cookies.set('JWT', `Bearer ${data.accessToken}`, { path: '/' });
          cookies.set('JWTRefresh', data.refreshToken, { path: '/' });
          cookies.set('ExpirationDate', data.expiresIn * 1000 + Date.now(), { path: '/' });

          // Get user role after refresh
          const roleResponse = await fetch('https://localhost:7242/api/Auth/roles', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.accessToken}`
            }
          });

          const roleData = await roleResponse.json();
          if (roleData?.roles?.length > 0) {
            cookies.set("Roles", roleData.roles[0], { path: '/' });
          }

        } catch (error) {
          console.error('Error during token refresh:', error);
        }
      }
    }

    refreshToken();
  }, []);

  return (
      <>
      <Navbar></Navbar>
      <SearchBar></SearchBar>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Group/Create" element={<CreateGroup />} />
        <Route path="/Group/Edit" element={<EditGroup />} />
        <Route path="/Group/Show" element={<ViewGroup />} />
        <Route path="/Group/Menu/*" element={<GroupPage />} />
        <Route path="/Call/*" element={<Call />}></Route>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notification/:id" element={<NotificationDetailPage />} />
        <Route path='/Event/Create/:groupId' element={<CreateEvent/>}></Route>
        <Route path='/Event/Edit/:id' element={<EditEvent/>}></Route>
        <Route path="/user/:userId" element = {<ShowUserPage />} />
        <Route path="/user/" element ={<IndexUserPage />} />
        <Route path="/user/edit/:userId" element={<EditUserPage/>}/>
        <Route path="/Group/Users" element={<IndexGroupMembers/>}/>
        <Route path="/Categories" element={<Categories/>}/>
        <Route path="/Quiz" element={<QuizGenerate/>}/>
        <Route path="/messagetest/:groupId" element={<MessageTestPage/>}/>
        <Route path="/Search" element={<SearchResults/>}/>
        <Route path="/Calendar" element={<Calendar/>}/>
        <Route path="/OAuth" element={<OAuth/>}/>
      </Routes>
    </>
  );
}

export default App;
