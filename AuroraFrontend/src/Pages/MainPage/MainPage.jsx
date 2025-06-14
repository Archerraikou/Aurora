import React from "react";
import Group from "../../components/group/group";
import "./MainPage.css";
import {useState, useEffect} from 'react';
import Cookies from "universal-cookie";
function MainPage() {
  const cookies = new Cookies();
  const [groups,setGroups] = useState([])
  //Luam toate grupurile, sau cele din care user-ul nu face parte daca este logat
  useEffect(() => {
      const fetchGroupInfo = async () => {
          try {
              const response = await fetch(`https://localhost:7242/api/Groups/index`, {
                  headers: {
                      'Authorization': cookies.get('JWT')
                  }
              });
              if (response.ok) {
                  const data = await response.json();
                  console.log(data);
                  setGroups(data);
              } else {
                  console.error('Failed to fetch group info');
              }
          } catch (error) {
              console.error('Error fetching group info:', error);
          }
      };
        fetchGroupInfo();
  }, [location.search]);
  return (
    <div className="main-container">
      <div className="group-list overflow">
        <h2>Toate grupurile:</h2>
        {groups.map((group)=>{
          return <Group name={group.name} image={group.picture} description={group.description} id={group.id} key={group.id}></Group>
        })}
      </div>
    </div>
  );
}

export default MainPage;
