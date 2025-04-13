import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Cookies from "universal-cookie";
import Login from "./components/login/login.jsx";
import "./App.css";
import Modal from "./components/modal/modal.jsx";
import Backdrop from "./components/backdrop/backdrop.jsx";
import Overlay from "./components/overlay/overlay.jsx";
import MainPage from "./Pages/MainPage/MainPage.jsx";
import Navbar from "./components/navbar/navbar.jsx";
import SearchBar from "./components/searchBar/searchBar.jsx";
import { Routes, Route } from "react-router-dom";
import Auth from "./Pages/Authentification/auth.jsx";
import GroupPage from "./Pages/GroupPage/GroupPage.jsx";

// Mai jos definim rutele
// path = "/" => pagina default
// path - "/auth" => pagina de autentificare
function App() {
  return (
    <>
      <Navbar></Navbar>
      <SearchBar></SearchBar>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/groups/*" element={<GroupPage />} />
      </Routes>
    </>
  );
}

export default App;
