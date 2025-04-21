import MainPage from "./Pages/MainPage/MainPage.jsx";
import Navbar from "./components/navbar/navbar.jsx";
import SearchBar from "./components/searchBar/searchBar.jsx";
import Auth from "./pages/Authentification/auth.jsx";
import GroupPage from "./Pages/GroupPage/GroupPage.jsx";
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from "./pages/Registration/Registration.jsx"
import Home from "./pages/Home/Home.jsx"
import CreateGroup from "./pages/CreateGroup/CreateGroup.jsx"
import EditGroup from './pages/EditGroup/EditGroup.jsx';
import { useEffect } from 'react';
import Cookies from 'universal-cookie';
import ViewGroup from './pages/ViewGroup/ViewGroup.jsx';
import Login from './components/login/login.jsx';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage.jsx';
import NotificationDetailPage from './pages/NotificationDetailPage/NotificationDetailPage.jsx';

function App() {
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
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Home />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Group/Create" element={<CreateGroup />} />
        <Route path="/Group/Edit" element={<EditGroup />} />
        <Route path="/Group/Show" element={<ViewGroup />} />
        <Route path="/Group/Menu/*" element={<GroupPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notification/:id" element={<NotificationDetailPage />} />
      </Routes>
    </>
  );
}

export default App;
