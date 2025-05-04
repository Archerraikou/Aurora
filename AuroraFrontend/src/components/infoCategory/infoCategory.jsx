import './InfoCategory.css'
import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie';

function InfoCategory( categorie ){
    categorie=categorie.categorie;
    const [isVisible, setIsVisible] = useState(true);
    const handleDelete = async (e) =>{
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7242/api/Categories/delete?id=${categorie.id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization' : cookies.get('JWT')
            }});
            if (!response.ok) {
                console.log("Category deletion failed");
            }
            else {
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Error during category deletion:', error);
        }
    }
  const cookies = new Cookies();
  const role = cookies.get("Roles");
  return (
    <>
    {isVisible&&<div className="info-box-wrapper">
      <div className="hover-box">
        <div className="large-box">
          {categorie.categoryDescription}
        </div>
        <div className="small-box">
          <span className="text">{categorie.categoryName}</span>
          {role=='Admin'&&<button className="close-btn" onClick={handleDelete}>×</button>}
        </div>
      </div>
    </div>}
    </>
  );
}
export default InfoCategory