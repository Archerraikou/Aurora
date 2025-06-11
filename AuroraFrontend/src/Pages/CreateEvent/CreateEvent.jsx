import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/Modal/modal';
import './CreateEvent.css'
import fetchUsers from '../../utils/fetchUsers'

function CreateEvent(){
    // Declaring formFields collectors, the id of the group using the URL and cookies
    const [formFields, setFormFields] = useState({Title: "", Date: "", Description: "", Color: "#ff0000" });
    const location = useLocation();
    const groupId = location.pathname.replace("/Event/Create/", "");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { title, date, description, color} = formFields;
    const cookies = new Cookies();
    const navigate = useNavigate();
    const [passRequirements,setPassRequirements] = useState([]);
    var auxPassRequirements = []
    useEffect(() => {
        if(groupId)
        {
            // Getting the users that are in said group
            const fetchData = async () => {
            const users = await fetchUsers(groupId);
            setUsers(users);
            };
    
            fetchData();
        }
      }, []);

      const handleChange = (event) => {
        const { name, value } = event.target;
        setFormFields((prevFields) => ({
          ...prevFields,
          [name]: value,
        }));
      };
    
    // Handler for submiting the form
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
        // Calling the backend method to send the data
        try {
            const response = await fetch('https://localhost:7242/api/events/new', {
            method: 'POST',
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
                console.log("Event created");
                navigate(`/Group/Menu/${groupId}`);
                location.reload();
            };
        } catch (error) {
            console.error('Error during event creation:', error);
        }
    };

    return (
        // The Create Event form itself
        <>
        {cookies.get("JWT")!=null && <Modal className ='modal'>
          <h1>Create a new event</h1>
              <form onSubmit={handleSubmit} className='registerForm'>
                  <label className='input-label'>Event Title</label>
                  <input type="text" name="title" onChange={handleChange} className='input-field'></input>
                  <label className='input-label'>Event Description</label>
                  <textarea name="description" onChange={handleChange} className='input-field'></textarea>
                  <label className='input-label'>Event Color</label>
                  <input type="color" name="color" defaultValue={color} onChange={handleChange} className='input-field'></input>
                  <label className='input-label'>Event  Date and Hour</label>
                  <input type="datetime-local" name="date" defaultValue={date} onChange={handleChange} className='input-field'></input>
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
                  <button type="submit" className='registerButton'>Create event</button>
              </form>
        </Modal>}
        </>
      )
}

export default CreateEvent