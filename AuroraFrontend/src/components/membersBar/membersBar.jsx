import NavbarItem from "../navbar-item/navbarItem";
import "./MembersBar.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function MembersBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.pathname.replace("/Group/Menu/", "");
  console.log(groupId)
  const handleCreateEvent = () => {
    navigate(`/Event/Create/${groupId}`);
  };

  const joinCall = () => {
    navigate(`/Call/${groupId}`);
  };

  return (
    <div className="members-list">
      <div className="align">
        <h3>Numele Grupului</h3>
        <h3>DESCRIERE</h3>
        <hr></hr>
        <div className="description">
          Acest grup este la fel de real precum vocile din capul meu
        </div>
        <h3>Membri:</h3>
        <hr></hr>
        <div className="members">
          <NavbarItem
            Profname="Admin"
            image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwVLdSDmgrZN7TkzbHJb8dD0_7ASUQuERL2A&s"
          ></NavbarItem>
          <NavbarItem
            Profname="SOTD"
            image="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
          ></NavbarItem>
        </div>
        <button onClick={handleCreateEvent}>Create Event</button>
        <button onClick={joinCall}>Join Call</button>
        {<button onClick={()=>{navigate(`/Group/Show?id=${groupId}`)}}>Show group</button>}
      </div>
    </div>
  );
}

export default MembersBar;
