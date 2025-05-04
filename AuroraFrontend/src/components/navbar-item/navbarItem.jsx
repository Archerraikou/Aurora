import { useNavigate } from "react-router";
import "./NavbarItem.css";

function NavbarItem(props) {
  const { image, name, Profname } = props;
  const nav = useNavigate();
  return (
    // Va trebui modificata 100% ca sa fie "wraped" intr-un <a>

    <div className="navbar-item">
      <img src={image} className="img-group"></img>
      {Profname ? (
        <p className="nume-group">{Profname}</p>
      ) : (
        <p className="name-group">{name}</p>
      )}
    </div>
  );
}

export default NavbarItem;
