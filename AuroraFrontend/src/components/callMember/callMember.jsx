import "./callMember.css";

function CallMember(props) {
  const { name, image } = props;
  return (
    <div className="call-member-container">
      <img src={image} className="call-member-image"></img>
      <p className="call-member-name">{name}</p>
    </div>
  );
}

export default CallMember;
