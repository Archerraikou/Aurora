import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import './EditGroup.css';
import {useLocation} from 'react-router-dom';
import fetchCategories from '../../utils/utils.jsx'
import GetRole from '../../utils/GetUserRoleInGroup.jsx';
import Modal from '../../components/modal/modal.jsx';

function EditGroup(){
    const [formFields, setFormFields] = useState({GroupName: "", GroupDescription: "", Picture: "", groupCategory:[], isPrivate: "" });
    const [role, setRole] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [initialGroupName, setInitialGroupName] = useState(null);
    const [initialGroupDesc, setInitialGroupDesc] = useState(null);
    const [initialPrivate, setInitialPrivate] = useState(null);
    const { groupName, groupDescription, Picture, groupCategory, isPrivate  } = formFields;
    const cookies = new Cookies();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    useEffect(() => {
      const fetchRole = async () => {
          const role = await GetRole(id);
          setRole(role);
      };
      fetchRole();
  }, [id]);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('id');
        const fetchGroupInfo = async () => {
          try {
            const response = await fetch(`https://localhost:7242/api/Groups/showGroup?Id=${id}`, {
              headers: {
                'Authorization': cookies.get('JWT')
              }
            });
            if (response.ok) {
              const data = await response.json();
              setInitialGroupDesc(data.description);
              setInitialGroupName(data.name);
              setInitialPrivate(data.isPrivate);
              setFormFields({
                groupName: data.name,
                groupDescription: data.description,
                Picture: '', 
                groupCategory: data.categories,
                isPrivate: data.isPrivate
              });
            } else {
              console.error('Failed to fetch group info');
            }
          } catch (error) {
            console.error('Error fetching group info:', error);
          }
        };
    
        if (id) {
          fetchGroupInfo();
        }
      }, [location.search]);
      useEffect(() => {
        const fetchData = async () => {
            const categs = await fetchCategories();
            setCategories(categs);
        };
    
        fetchData();
      }, []);    
      const handleChange = (event) => {
        const { name, value, type, files, checked } = event.target;
      
        if (type === 'file') {
          setFormFields((prevFields) => ({
            ...prevFields,
            [name]: files[0],
          }));
        } else if (type === 'checkbox') {
          setFormFields((prevFields) => ({
            ...prevFields,
            [name]: checked,
          }));
        } else {
          setFormFields((prevFields) => ({
            ...prevFields,
            [name]: value,
          }));
        }
      };
    const handleDelete = async (e) =>{
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7242/api/Groups/deleteGroup?id=${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization' : cookies.get('JWT')
            }});
            if (!response.ok) {
                navigate("/");
            }
            else {
                console.log("Group deletion failed");
            };
        } catch (error) {
            console.error('Error during group creation:', error);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("groupDescription", groupDescription);
        formData.append("IsPrivate", isPrivate);
        selectedCategories.forEach((categoryId) => {
        formData.append("groupCategory", categoryId);
        });
        if (Picture) {
        formData.append("Picture", Picture);
        };
        try {
            const response = await fetch(`https://localhost:7242/api/Groups/editGroup?id=${id}`, {
            method: 'POST',
            headers: { 
                'Authorization' : cookies.get('JWT')
            },
            body: formData
            });
            if (!response.ok) {
                const json = await response.json();
            }
            else {
                console.log("Group edited");
                navigate("/");
            };
        } catch (error) {
            console.error('Error during group creation:', error);
        }
    };
    return (
      <>
      {(cookies.get("Roles")=="Admin" || role=="Admin") && <Modal className="modal">
        <h1>Edit a group</h1>
            <form onSubmit={handleSubmit} className='registerForm'>
                <label className='input-label'>Group Name</label>
                <input defaultValue={initialGroupName} type="text" name="groupName" onChange={handleChange} className='input-field'></input>
                <label className='input-label'>Group Description</label>
                <textarea name="groupDescription" defaultValue={initialGroupDesc} onChange={handleChange} className='input-field'></textarea>
                <label className='input-label'>Is the group private</label>
                <input checked={isPrivate} type = "checkbox" name="isPrivate" onChange={handleChange} className='input-field'></input>
                <label className='input-label'>Group picture</label>
                <input className='input-label' type="file" name="Picture" onChange={handleChange}></input>
                <label className='input-label'>Categories</label>
                <select multiple value={selectedCategories} onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setSelectedCategories(selectedOptions);
                }} className='input-field'>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>
                    {category.categoryName}
                    </option>
                ))}
                </select>
                <button type="submit" className='registerButton'>Edit group</button>
            </form>
            <button onClick={handleDelete} id='deleteButton'>Delete the group</button>
      </Modal>}
      </>
    )
}
export default EditGroup