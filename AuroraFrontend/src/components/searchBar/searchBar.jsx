import React, { useEffect, useState, useRef } from "react";
import "./searchBar.css";
import Cookies from "universal-cookie";
import Backdrop from "../backdrop/backdrop.jsx";
import  Modal  from "../Modal/modal.jsx";
import Login from "../login/login.jsx"
import { useNavigate } from 'react-router-dom'; 

function SearchBar() {
  // Declaring all the cookies and necessary reactive variables for creating
  //  the Logged In and not Logged In states, searching groups after the category
  //  or only after the name and description
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
    // Sending search request towards the backend depending on the useCategory reactive variable
    if (!useCategory) {
      try {
        // Search just in the name and description of the group
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
      // Search in the categories of the group
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
      {/* The search bar */}
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
        {/* The reactive part that depends on the login state of the user. */}
        {/* If they are logged in, then their profile pic appears. It is a dropdown menu. */}
        {loggedIn == true && (
          <>
            <div className="bottom">
              <div className="navbar-item-profile">
                <img src={"https://localhost:7242/api/ApplicationUsers/pfp/" + cookies.get("UserId")} alt= "Profile Picture" className="img-gr" onClick={() => setIsOpen(!isOpen)}/>
              </div>
            </div>
            {/* If their picture is pressed, then there appears a menu with some options.
              There are the buttons that redirect the user towards: their calendar, their notifications, 
              their profile edit area and logout.*/}
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
        {/* If the user is not logged in, the login button appears */}
        {loggedIn==false&&<button className="login-button" onClick={(e) => {e.preventDefault();setIsModalOpen(!isModalOpen)}}>
            Login
            </button>}
      </form>
    </div>
    {/* The login modal appears if the login button is pressed */}
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
