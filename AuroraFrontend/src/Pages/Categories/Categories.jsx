import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';
import './Categories.css'
import fetchCategories from '../../utils/utils.jsx';
import {useLocation} from 'react-router-dom';
import GetRole from '../../utils/GetUserRoleInGroup.jsx';
import Backdrop from '../../components/backdrop/backdrop.jsx';
import Modal from '../../components/Modal/modal.jsx';
import InfoCategory from '../../components/infoCategory/infoCategory.jsx';

function Categories(){
    const [formFields, setFormFields] = useState({ categoryName: "", categoryDescription: "" });
    const { categoryName, categoryDescription } = formFields;
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormFields((prevFields) => ({
        ...prevFields,
        [name]: value,
        }));
    };
    const [categories, setCategories] = useState([]);
    const cookies = new Cookies();
    const role = cookies.get("Roles");
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            const categories = await fetchCategories();
            setCategories(categories);
        };
    
        fetchData();
      }, []);
    const handleSubmit = async (e) => {
        setIsModalOpen(false);
        e.preventDefault();
        const categInfo = { categoryName, categoryDescription };
        try {
          const response = await fetch('https://localhost:7242/api/Categories/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': cookies.get("JWT")
             },
            body: JSON.stringify(categInfo)
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          else {
            location.reload();
          }
        }
        catch(error) {
            console.error('Error creating category:', error);
        }
    }
    return(
        <>
            <div className='categories'>
                {categories.map((e)=>{
                    return <InfoCategory categorie={e}/>;
                })}
                {role=='Admin' && <button className="create-button" onClick={() => setIsModalOpen(!isModalOpen)}>
                    Create new category
                    </button>}
            </div>
                {isModalOpen && (
                    <>
                    <Backdrop onClick={() => setIsModalOpen(false)} />
                    <Modal>
                        <form onSubmit={handleSubmit}>
                            <label className='input-label'>Name</label>
                            <input placeholder='Name' type = "text" name="categoryName" onChange={handleChange} className='input-field'></input><br></br>
                            <label className='input-label'>Description</label>
                            <textarea placeholder='Description' type = "text" name="categoryDescription" onChange={handleChange} className='input-field'></textarea><br></br>
                            <button type="submit">Create new category</button>
                        </form>
                    </Modal>
                    </>
                )}
        </>
    )
}
export default Categories;