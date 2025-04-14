import React from "react";
import Group from "../../components/group/group";
import "./MainPage.css";

function MainPage() {
  // Cand voi avea la ce sa dau fetch, atunci voi comenta
  return (
    <div className="main-container">
      <div className="group-list overflow">
        <h2>Toate grupurile:</h2>
        {/* Aici in mod normal am face fetch la grupuri, dar pt ele inca nu exista, voi crea unele hardcodate, doar de design */}
        <Group
          name="Ceva"
          image="https://m.media-amazon.com/images/M/MV5BNWE2MjYwZGUtZGJlNS00MWZkLTg1OGQtNzI4YzQ3ZmYxZmY5XkEyXkFqcGc@._V1_.jpg"
          description="Grup de fraieri"
        ></Group>
        <hr></hr>
        <Group
          name="Altceva"
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYx_otcHXRu_qWv6JNzHWx9M3tbS8RrcngDg&s"
          description="Grup de frauda economica asupra statului roman"
        ></Group>
      </div>
    </div>
  );
}

export default MainPage;
