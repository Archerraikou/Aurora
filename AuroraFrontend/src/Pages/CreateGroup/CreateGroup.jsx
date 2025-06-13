import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal/modal';
import './CreateGroup.css'
import fetchCategories from '../../utils/utils';

function CreateGroup(){
    const [formFields, setFormFields] = useState({GroupName: "", GroupDescription: "", Picture: "", isPrivate: false });
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { groupName, groupDescription, Picture, groupCategory, isPrivate  } = formFields;
    const cookies = new Cookies();
    const navigate = useNavigate();
    const [passRequirements,setPassRequirements] = useState([]);
    var auxPassRequirements = []
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        var IsPrivate = isPrivate
        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("groupDescription", groupDescription);
        formData.append("IsPrivate", IsPrivate);
        selectedCategories.forEach((categoryId) => {
        formData.append("groupCategory", categoryId);
        });
        if (Picture) {
        formData.append("Picture", Picture);
        };
        console.log(formData);
        try {
            const response = await fetch('https://localhost:7242/api/Groups/newGroup', {
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
                console.log("Group created");
                navigate("/");
                location.reload();
            };
        } catch (error) {
            console.error('Error during group creation:', error);
        }
    };
    return (
      <>
      {cookies.get("JWT")!=null && <Modal className ='modal'>
        <h1>Create a new group</h1>
            <form onSubmit={handleSubmit} className='registerForm'>
                <label className='input-label'>Group Name</label>
                <input type="text" name="groupName" onChange={handleChange} className='input-field'></input>
                <label className='input-label'>Group Description</label>
                <textarea name="groupDescription" onChange={handleChange} className='input-field'></textarea>
                <label className='input-label'>Is the group private</label>
                <input type = "checkbox" name="isPrivate" onChange={handleChange} className='input-field'></input>
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
                <button type="submit" className='registerButton'>Create group</button>
            </form>
      </Modal>}
      </>
    )
}
export default CreateGroup