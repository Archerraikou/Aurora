import MyProfile from "../myProfile/myProfile";
import NavbarItem from "../navbar-item/navbarItem";
import "./navbar.css";
import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="sidebar">
      <Link to="/" className="home-button">
        Aurora
      </Link>
      <hr></hr>
      <div className="sidebar-list overflow">
        {/* Nu avem grupuri propriu zis, asa ca voi hardcoda cateva */}
        <Link to="/groups/1">
          <NavbarItem
            name="Grup 1"
            image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBIGFIMbph9mGT6QaZHW07QQzMD12rtFlBv_NaF6PwK2J5KJH_8XOi5lNEsAZuNR89w0Q&usqp=CAU"
          ></NavbarItem>
        </Link>
        <hr></hr>
        <NavbarItem
          name="Grup 2"
          image="https://i.pinimg.com/736x/93/b7/07/93b70735dd8d5e707589ce7cbd078215.jpg"
        ></NavbarItem>
        <hr></hr>
        <NavbarItem
          name="Add Group"
          image="https://globalsymbols.com/uploads/production/image/imagefile/16237/17_16238_c25962bd-e354-440f-b77b-5c820e96d8c0.png"
        ></NavbarItem>
      </div>
      <MyProfile
        name="Diocletian"
        image="https://avatars.githubusercontent.com/u/110779745?v=4"
      ></MyProfile>
    </nav>
  );
}

export default Navbar;
