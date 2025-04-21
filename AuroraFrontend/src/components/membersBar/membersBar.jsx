import NavbarItem from "../navbar-item/navbarItem";
import "./MembersBar.css";

function MembersBar() {
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
            name="Admin"
            image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwVLdSDmgrZN7TkzbHJb8dD0_7ASUQuERL2A&s"
          ></NavbarItem>
          <NavbarItem
            name="SOTD"
            image="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
          ></NavbarItem>
        </div>
      </div>
    </div>
  );
}

export default MembersBar;
