import Cookies from "universal-cookie";
import NavbarItem from "../navbar-item/navbarItem";
import "./navbar.css";
import { Link } from "react-router";
import {useState, useEffect} from 'react';
function Navbar() {
  const cookies = new Cookies();
    const [groups,setGroups] = useState([])
    //Luam grupurile din care face parte utilizatorul
    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const response = await fetch(`https://localhost:7242/api/Groups/notIndex`, {
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
    <nav className="sidebar">
      <Link to="/" className="home-button">
        Aurora
      </Link>
      <hr></hr>
      <div className="sidebar-list overflow">
      {groups.map((group)=>{
          return <Link to={`/Group/Menu/${group.id}`}>
            <NavbarItem name={group.name} image={group.picture}></NavbarItem>
            </Link>
        })}
        <Link to="/Group/Create">
          <NavbarItem
            name="Add Group"
            image="https://globalsymbols.com/uploads/production/image/imagefile/16237/17_16238_c25962bd-e354-440f-b77b-5c820e96d8c0.png"
          ></NavbarItem>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
