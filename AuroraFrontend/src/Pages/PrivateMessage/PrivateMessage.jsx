import Cookies from 'universal-cookie';
import { useParams } from "react-router-dom";
import ChatComponent from "../../components/chatcomponent/chatcomponent.jsx"
function PrivateMessage()
{
    // Mesajele private sunt niste grupuri practic.
    // Doar ca in loc ca id-ul "chat-ului" sa fie groupId-ul... 
    // O sa concatenez id-ul userului curent si id-ul userului
    // cu care se face chat-ul privat 
    // (id-urile o sa fie sortate crescator ca sa fim siguri 
    //  ca nu se fac 2 chaturi private)

    const cookies = new Cookies();
    const currentUsersId = cookies.get('UserId')
    const otherUsersId = useParams();


    // Not enough time, folosim grupuri
    // var pmId;
    // if(currentUsersId > otherUsersId)
    //     pmId = currentUsersId + otherUsersId;
    // else pmId = otherUsersId + currentUsersId;
    return (
        <div className="container">
            <div className="flex">
                <ChatComponent groupId={pmId}/>
            </div>
        </div>
    );
}

export default PrivateMessage;