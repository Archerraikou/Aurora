import NavbarItem from "../navbar-item/navbarItem";
import "./MembersBar.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, {useState, useEffect, useRef} from 'react';
import Cookies from 'universal-cookie';

function MembersBar() {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const groupId = location.pathname.replace("/Group/Menu/", "");
  const [groupInfo, setGroupInfo] = useState(null)
  const [members, setMembers] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    const getGroupInfo = async () =>{
      const response = await fetch(`https://localhost:7242/api/Groups/showGroup?Id=${groupId}`,{
        method: 'GET',
        headers: {
          Authorization: cookies.get('JWT'),
        },
        }
      )
      if(!response.ok)
      {
        throw new Error("Bad response");
      }
      const data = await response.json();
      setGroupInfo(data);
    }

    const getMembers = async () =>{
      const response = await fetch(`https://localhost:7242/api/UserGroups?groupId=${groupId}`,{
          method: 'GET',
          headers: {
            Authorization: cookies.get('JWT'),
          },
        }
      )
      if(!response.ok)
      {
        throw new Error("Bad response");
      }
      const data = await response.json();
      setMembers(data);
    }
    try
    {
      getGroupInfo();
      getMembers();
    }catch (e)
    {
      console.log(e.message)
    }
  },[])

  useEffect(()=>
  {
    if(groupInfo && members)
    {
      setLoading(false);
    }
  }, [groupInfo, members])
  const handleCreateEvent = () => {
    navigate(`/Event/Create/${groupId}`);
  };

  const joinCall = () => {
    navigate(`/Call/${groupId}`);
  };
  const leaveGroup=async ()=>{
      try {
          const response = await fetch(`https://localhost:7242/api/Groups/leave?id=${groupId}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': cookies.get("JWT")
              }
          });

          if (!response.ok) {
              throw new Error('The owner cannot leave the group');
          }
          else {
              navigate("/");
              location.reload();
          }
      } catch (error) {
          console.error('Error during group join/request:', error);
          alert("The owner cannot leave the group.");
      }
  };
  if(loading)
  {
    return (<div> Loading </div>)
  }
      console.log(groupInfo)
      console.log(members)
  return (
    <div className="members-list">
      <div className="align">
        <h3>{groupInfo.name}</h3>
        <h3></h3>
        <hr></hr>
        <div className="description">
          {groupInfo.description}
        </div>
        <h3>Membri:</h3>
        <hr></hr>

        <div className="members">
          {
            members.map((membru)=>{
              console.log(membru.nickname)
              if(membru !== "Admin" && membru!=="User")
              {
                return(
                <NavbarItem 
                  Profname= {membru.nickname}
                  image = {"https://localhost:7242/api/ApplicationUsers/pfp/" + membru.id}
                ></NavbarItem>)
              }
              else
              {
                <></> 
              }
            })
          }
          {/* <NavbarItem
            Profname="Admin"
            image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwVLdSDmgrZN7TkzbHJb8dD0_7ASUQuERL2A&s"
          ></NavbarItem>
          <NavbarItem
            Profname="User"
            image="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
          ></NavbarItem> */}
        </div>
        <button onClick={handleCreateEvent}>Create Event</button>
        <button onClick={joinCall}>Join Call</button>
        {<button onClick={()=>{navigate(`/Group/Show?id=${groupId}`)}}>Show group</button>}
        <button className="leaveButton" onClick={leaveGroup}>Leave group</button>
      </div>
    </div>
  );
}

export default MembersBar;
