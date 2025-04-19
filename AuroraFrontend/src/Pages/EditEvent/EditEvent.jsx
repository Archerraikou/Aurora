import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/modal/modal';
import './EditEvent.css';
import fetchUsers from '../../utils/fetchUsers';
import GetRole from '../../utils/GetUserRoleInGroup.jsx';

function CreateEvent(){
    const [formFields, setFormFields] = useState({Title: "", Date: "", Description: "", Color: "#ff0000", Users: [] });
    const [role, setRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [initialTitle, setInitialTitle] = useState(null);
    const [initialDesc, setInitialDesc] = useState(null);
    const [initialDate, setInitialDate] = useState(null);
    const [initialColor, setInitialColor] = useState("#00FF00");
    const { title, date, description, color} = formFields;
    const cookies = new Cookies();
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.pathname.replace("/Event/Edit/", "");
    const [groupId, setGroupId] = useState(null);

      useEffect(() => {
          const id = location.pathname.replace("/Event/Edit/", "");
          const  fetchEventInfo = async () => {
            try {
              const response = await fetch(`https://localhost:7242/api/events/show?id=${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                  'Authorization': cookies.get('JWT')
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                setInitialDesc(data.description);
                setInitialTitle(data.title);
                const formattedDate = data.date.replace('Z', '');
                setInitialDate(formattedDate);
                setInitialColor(data.color);
                setGroupId(data.groupId);
                setFormFields({
                    title: data.title,
                    date: data.date,
                    description: data.description,
                    color: data.color,
                    users: data.Users
                });
              } else {
                console.error('Failed to fetch event info');
              }
            } catch (error) {
              console.error('Error fetching event info:', error);
            }
        };
        if (id) {
             fetchEventInfo();
        }
    }, [location.pathname]);
    
    const [passRequirements,setPassRequirements] = useState([]);
    var auxPassRequirements = []
    useEffect(() => {
        if(groupId)
        {
            const fetchData = async () => {
            const users = await fetchUsers(groupId);
            setUsers(users);
            };
    
            fetchData();}
      }, [groupId]);

      const handleChange = (event) => {
        const { name, value } = event.target;
        setFormFields((prevFields) => ({
          ...prevFields,
          [name]: value,
        }));
      };

    const handleSubmit= async (e)=>{
        e.preventDefault();
        const formData = {
            title: title,
            date: date,
            description: description,
            color: color,
            userIds: selectedUsers,
            groupId: groupId
        };
        console.log("Form data before sending:", JSON.stringify(formData));
        try {
            const response = await fetch(`https://localhost:7242/api/events?id=${id}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'Authorization' : cookies.get('JWT')
            },
            body: JSON.stringify(formData)
            });
            if (!response.ok) {
                const json = await response.json();
            }
            else {
                console.log("Event edited");
                navigate(`/Group/Menu/${groupId}`);
            };
        } catch (error) {
            console.error('Error during event edit:', error);
        }
    };

    const handleDelete = async (e) =>{
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7242/api/events?id=${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization' : cookies.get('JWT')
            }});
            console.log(response);
            if (response.ok) {
                navigate("/auth");
            }
            else {
                console.log("Event deletion failed");
            };
        } catch (error) {
            console.error('Error during event deletion:', error);
        }
    }

    return (
        <>
        {cookies.get("JWT")!=null && <Modal className ='modal'>
          <h1>Edit an event</h1>
              <form onSubmit={handleSubmit} className='registerForm'>
                  <label className='input-label'>Event Title</label>
                  <input type="text" name="title" defaultValue={initialTitle} onChange={handleChange} className='input-field'></input>
                  <label className='input-label'>Event Description</label>
                  <textarea name="description" defaultValue={initialDesc} onChange={handleChange} className='input-field'></textarea>
                  <label className='input-label'>Event Color</label>
                  <input type="color" name="color" defaultValue={initialColor} onChange={handleChange} className='input-field'></input>
                  <label className='input-label'>Event  Date and Hour</label>
                  <input type="datetime-local" name="date" defaultValue={initialDate} onChange={handleChange} className='input-field'></input>
                  <label className='input-label'>Users</label>
                  <select multiple value={selectedUsers} onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                      setSelectedUsers(selectedOptions);
                  }} className='input-field'>
                  {users.map(user => (
                      <option key={user.id} value={user.id}>
                      {user.nickname}
                      </option>
                  ))}
                  </select>
                  <button type="submit" className='registerButton'>Edit event</button>
              </form>
              <button onClick={handleDelete} id='deleteButton'>Delete the event</button>
        </Modal>}
        </>
      )
}

export default CreateEvent