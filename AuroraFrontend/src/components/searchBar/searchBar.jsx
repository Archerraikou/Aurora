import React, { useEffect, useState, useRef } from "react";
import "./searchBar.css";
import Cookies from "universal-cookie";
import Backdrop from "../backdrop/backdrop.jsx";
import  Modal  from "../Modal/modal.jsx";
import Login from "../login/login.jsx"
import { useNavigate } from 'react-router-dom'; 
function SearchBar() {
  const cookies = new Cookies();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [useCategory, setUseCategory] = useState(false);
  const [loggedIn, setLoggedIn] = useState(cookies.get("JWT")!=null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId,setUserId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate(); 

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useCategory) {
      try {
        const response = await fetch(
          `https://localhost:7242/api/Groups/search?search=${search}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies.get("JWT"),
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          navigate("/Search", { state: json});
        } else {
          navigate("/Search", { state: []});
        }
      } catch (error) {
        console.error("Error during search:", error);
        setResults([]);
      }
    } else {
      try {
        const response = await fetch(
          `https://localhost:7242/api/Groups/search?search=${search}&&param=1`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies.get("JWT"),
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          navigate("/Search", { state: json});
        } else {
          navigate("/Search", { state: []});
        }
      } catch (error) {
        console.error("Error during search:", error);
        setResults([]);
      }
    }
  };

  return (
    <>
    <div>
      <form className="header" onSubmit={handleSubmit}>
        <input
          className="search-bar"
          type="text"
          name="search"
          placeholder="Search"
          value={search}
          onChange={handleChange}
        />

        <div className="useCategory">
          <input
            type="checkbox"
            name="useCategory"
            id="useCategory"
            onChange={() => setUseCategory(!useCategory)}
          />
          <label htmlFor="useCategory">Search by Category</label>
        </div>
        <button className="btn" type="submit">
          Search
        </button>
        {loggedIn == true && (
          <>
            <div className="bottom">
              <div className="navbar-item-profile">
                <img src={"https://localhost:7242/api/ApplicationUsers/pfp/" + cookies.get("UserId")} alt= "Profile Picture" className="img-gr" onClick={() => setIsOpen(!isOpen)}/>
              </div>
            </div>
            {isOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={(e)=>{e.preventDefault();navigate('/user/edit/'+cookies.get("UserId"))}}>Profile</button>
                <button className="dropdown-item" onClick={(e)=>{e.preventDefault();navigate('/notifications')}}>Notifications</button>
                <button className="dropdown-item" onClick={(e)=>{e.preventDefault();navigate('/calendar')}}>Calendar</button>
                <button className="dropdown-item" onClick={(e)=>{
                  e.preventDefault();
                  location.reload();
                  cookies.set("JWT",null);
                  cookies.set("JWTRefresh",null)
                  cookies.set("Roles",null);
                  cookies.set("ExpirationDate",null)
                  cookies.set("UserId",null)
                  setLoggedIn(false);
                }}>Logout</button>
              </div>
            )}
          </>
        )}

        {loggedIn==false&&<button className="login-button" onClick={(e) => {e.preventDefault();setIsModalOpen(!isModalOpen)}}>
            Login
            </button>}
      </form>
    </div>
    {isModalOpen && (
      <>
        <Backdrop onClick={() => setIsModalOpen(false)} />
        <Modal>
        <Login closeModal={() => {setLoggedIn(true);setIsModalOpen(false)}}></Login>
        </Modal>
      </>
    )}
    </>
    
  );
}

export default SearchBar;
