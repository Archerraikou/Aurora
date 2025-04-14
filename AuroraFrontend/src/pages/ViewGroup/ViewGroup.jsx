import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';
import './ViewGroup.css'
import fetchCategories from '../../utils/utils';
import {useLocation} from 'react-router-dom';
import GetRole from '../../utils/GetUserRoleInGroup.jsx';

function ViewGroup(){
    const [categories, setCategories] = useState([]);
    const [role, setRole] = useState(null);
    const [groupCategories,setGroupCategories] = useState([]);
    const [formFields, setFormFields] = useState({groupName: "", groupDescription: "", groupPicture: "", isPrivate: "", dateCreated: "", admin: "", groupCategory: [] });
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
    const handleJoin=async ()=>{
      if(!formFields.isPrivate)
        try {
              const response = await fetch('https://localhost:7242/api/Groups/join?id='+id, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json',
                  'Authorization':cookies.get("JWT")
                 },
              });
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              navigate("/");
            } catch (error) {
              console.error('Error during login:', error);
          }
      else {
        try {
          const response = await fetch('https://localhost:7242/api/Groups/request?id='+id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginInfo)
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        } 
        catch (error) {
          console.error('Error during login:', error);
        }
      }
    }
    useEffect(() => {
      const fetchData = async () => {
          const categories = await fetchCategories();
          setCategories(categories);
      };
  
      fetchData();
    }, []);  
    
    useEffect(() => {
      const updatedGroupCategories = [];
      for (const category of categories) {
        for (const categoryId of formFields.groupCategory) {
          if (category.id === categoryId) {
            updatedGroupCategories.push(category.categoryName);
          }
        }
      }
      setGroupCategories(updatedGroupCategories);
    
    }, [categories, formFields.groupCategory]);
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
              setFormFields(prevFields => ({
                ...prevFields,
                groupName: data.name,
                groupDescription: data.description,
                groupPicture: data.picture,
                groupCategory: data.categories,
                isPrivate: data.isPrivate,
                dateCreated: data.date,
                admin: data.admin
              }));
              console.log(formFields);
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
    return (
      <>
      {cookies.get("JWT")!=null && <div className="group-container">
        <div className="group-header">
          <img src={`C:/School/ProiectMDS/Aurora/${formFields.groupPicture}`} className="group-image" alt="Group" />
          <h1 className="group-name">{formFields.groupName}</h1>
        </div>

        <p className="group-description">{formFields.groupDescription}</p>

        <div className="categories">
          <p className="categories-title">Categories</p>
          <ul>
            {groupCategories.map((category, i) => (
              <li key={i} className="category-item">{category}</li>
            ))}
          </ul>
        </div>

        <div className="group-footer">
          <p className="group-owner">{formFields.admin}</p>
          <p className="group-date">{new Date(formFields.dateCreated).toLocaleDateString()}</p>
        </div>

        {role=="None" && <button className="join-button" onClick={handleJoin}>
          {!formFields.isPrivate ? "Join the group" : "Request to join the group"}
        </button>}
      </div>}
      </>

    

    )
}
export default ViewGroup