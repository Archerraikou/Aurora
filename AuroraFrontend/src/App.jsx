import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Cookies from 'universal-cookie';
import Login from './components/login/login.jsx';
import './App.css'
import Modal from './components/modal/modal.jsx';
import Backdrop from './components/backdrop/backdrop.jsx';
import Outlet from 'react'
import UserPage from './Pages/UserPage/UserPage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return(
  <Router>
    <Routes>
      <Route path="/user/*" element ={<UserPage />} />
    </Routes>
  </Router> 
  );
}

export default App
