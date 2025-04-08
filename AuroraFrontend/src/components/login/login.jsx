import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie';
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
    e.preventDefault(); // prevent form refresh
    console.log({ email, password });

    const loginInfo = { email, password };
    console.log(loginInfo);

    try {
      const response = await fetch('https://localhost:7242/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo)
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const json = await response.json();
      const cookies = new Cookies();
      cookies.set('JWT', "Bearer " + json.token, { path: '/' });
      console.log('Cookie set:', cookies.get('JWT'));
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type = "text" name="email" onChange={handleChange}></input>
        <input type = "password" name="password" onChange={handleChange}></input>
        <button type="submit" onClick={closeModal}>Login
        </button>
      </form>
    </>
  )
}

export default Login
