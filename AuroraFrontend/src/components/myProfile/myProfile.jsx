import Group from "../group/group";
import NavbarItem from "../navbar-item/navbarItem";
import "./MyProfile.css";

function MyProfile(props) {
  const { name, image } = props;
  return (
    <div className="bottom">
      {/* <hr></hr> */}
      <NavbarItem name={name} image={image}></NavbarItem>
    </div>
  );
}

export default MyProfile;
