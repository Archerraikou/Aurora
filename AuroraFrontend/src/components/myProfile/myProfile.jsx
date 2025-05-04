import Group from "../group/group";
import NavbarItem from "../navbar-item/navbarItem";
import "./MyProfile.css";

function MyProfile(props) {
  const { name, image } = props;
  return (
    <div className="bottom">
      <div className="navbar-item-profile">
        <img src={image} className="img-gr" />
      </div>
    </div>
  );
}

export default MyProfile;
