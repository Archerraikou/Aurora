import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import {Link} from 'react-router-dom'
import './login.css'


function Login({ closeModal }) {
  const [formFields, setFormFields] = useState({ email: "", password: "" });
  const { email, password } = formFields;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginInfo = { email, password };
    try {
      const response = await fetch('https://localhost:7242/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      const cookies = new Cookies();
      cookies.set('JWT', "Bearer " + json.accessToken, { path: '/' });
      cookies.set('JWTRefresh',json.refreshToken,{path: '/'})
      cookies.set('ExpirationDate',json.expiresIn*1000+Date.now(), {path: '/'})
      try {
        const response = await fetch('https://localhost:7242/api/Auth/roles', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Authorization': cookies.get("JWT")
           },
        });
        const json = await response.json();
        cookies.set("Roles",json.roles[0],{path:'/'});
      }
      catch(error){
          console.log('Error getting role:',error);
        }
      closeModal();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className='input-label'>Email</label>
        <input placeholder='Email' type = "text" name="email" onChange={handleChange} className='input-field'></input><br></br>
        <label className='input-label'>Password</label>
        <input placeholder='Password' type = "password" name="password" onChange={handleChange} className='input-field'></input><br></br>
        <Link to="/Registration">Create an account</Link><br></br><br></br>
        <button type="submit">Login</button>
      </form>
    </>
  )
}

export default Login
