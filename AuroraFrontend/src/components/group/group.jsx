import React from "react";
import "./group.css";
import { useNavigate } from "react-router";

// Crearea componentei de grup
// Aceasta va vizibila pe pagina principala
// Apasand-o, iti va aparea o fereastra cu optiunea de join
function Group(props) {
  const { name, image, description } = props;
  const nav = useNavigate();
  return (
    <div className="group">
      <div className="group-info">
        <img className="group-image" src={image}></img>
        <div className="group-details">
          {description && description !== "" ? (
            <>
              <p className="group-name">{name}</p>
              <p className="group-description">{description}</p>
            </>
          ) : (
            <p className="group-name-solo">{name}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Group;
