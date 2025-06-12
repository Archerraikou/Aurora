import { useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';  
import './login.css';

function Login({ closeModal }) {
  const [formFields, setFormFields] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { email, password } = formFields;
  const navigate = useNavigate(); 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const loginInfo = { email, password };

    try {
      const loginRes = await fetch('https://localhost:7242/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });

      if (loginRes.status === 401) {
        const message = await loginRes.text();
        setError(message || 'Unauthorized: Please check your credentials or confirm your email.');
        return;
      }

      if (!loginRes.ok) {
        throw new Error('Login failed. Please try again later.');
      }

      const loginData = await loginRes.json();
      console.log('Login response data:', loginData);

      const cookies = new Cookies();
      const { accessToken, refreshToken, expiresIn } = loginData;

      cookies.set('JWT', 'Bearer ' + accessToken, { path: '/' });
      cookies.set('JWTRefresh', refreshToken, { path: '/' });
      cookies.set('ExpirationDate', expiresIn*1000+ Date.now(), { path: '/' });


      localStorage.setItem("isLoggedIn", "true");
      const roleResponse = await fetch('https://localhost:7242/api/Auth/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });

      const roleData = await roleResponse.json();
      if (roleData?.roles?.length > 0) {
        cookies.set("Roles", roleData.roles[0], { path: '/' });
      }
      const response = await fetch(`https://localhost:7242/api/ApplicationUsers/currentUser`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });
      if (response.ok) {
          const data = await response.json();
          cookies.set("UserId",data.id, { path: '/' });
      } else {
          console.error('Failed to fetch group info');
      }
      if (closeModal) {
        location.reload()
        closeModal();
      } else {
        navigate('/');
        location.reload();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className="input-label">Email</label>
        <input
          placeholder="Email"
          type="text"
          name="email"
          value={email}
          onChange={handleChange}
          className="input-field"
        /><br />

        <label className="input-label">Password</label>
        <input
          placeholder="Password"
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          className="input-field"
        /><br />

        <a href="/Registration">Create an account</a><br /><br />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Login</button>
        <button className="Google" onClick={()=>{window.location.href="https://localhost:7242/api/Auth/login/google"}}>Sign in with google</button>
      </form>
    </>
  );
}

export default Login;