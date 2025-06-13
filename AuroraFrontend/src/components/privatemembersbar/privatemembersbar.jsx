import React, {useState, useEffect, useRef} from 'react';
import Cookies from 'universal-cookie';
import NavbarItem from "../navbar-item/navbarItem";
import "./privatemembersbar.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function PrivateMembersBar() {
  const cookies = new Cookies();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const othersId = location.pathname.replace("/PM/", "");
  
  useEffect(()=>{
    const getOtherUser = async () =>
    {
        try
        {
          const response = await fetch(`https://localhost:7242/api/User/${othersId}`,
          {
            method: 'GET',
            headers: {
              Authorization: cookies.get('JWT'),
            },
          });
        if (!response.ok) {
          const errorText = await response.text; // Get error details from response body
          throw new Error(
            `Failed to fetch user: ${response.status} ${response.statusText}. Server: ${errorText}`,
          );
        }
          const data = await response.json();
          setUser(data);
        }
        catch(e)
        {
          console.log(e.message);
        }
        finally
        {
          setLoading(false);
        }
    }
    getOtherUser();
  }, [othersId])
  
  if(loading)
  {
      return (<div>Loading...</div>)
  }

  console.log(user)
  return (
  <div className="members-list">
    <img
      className="profile-picture"
      src={`https://localhost:7242/api/User/pfp/${othersId}`}
      alt={user?.nick ? `${user.nick}'s profile picture` : 'User profile picture'}
      onError={(e) => {
        e.target.onerror = null; // Prevent infinite loop if default also fails
        e.target.src = 'https://localhost:7242/images/defaultpp.jpg';
      }}
    />
    <div className="align">
      {/* Ensure user object is available before accessing its properties */}
      <h3>{user?.nick || 'Loading Nickname...'}</h3>
      <h3>Description</h3>
      <hr />
      <div className="description">
        {user?.profileDescription || 'No Description Available.'}
      </div>
    </div>
  </div>
  );
}

export default PrivateMembersBar;
