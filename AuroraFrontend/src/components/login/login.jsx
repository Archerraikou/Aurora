import { useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';  
import './login.css';

function Login({ closeModal }) {
  // Definim starea pentru câmpurile formularului: email și parolă
  const [formFields, setFormFields] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { email, password } = formFields; //pentru acces ușor
  const navigate = useNavigate(); 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };
  // Funcția care gestionează trimiterea formularului
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validare simplă: verificăm dacă email și parola sunt completate
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const loginInfo = { email, password };

    try {
            // Trimitem cererea POST către API-ul de login
      const loginRes = await fetch('https://localhost:7242/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });
      // Dacă răspunsul este 401 (neautorizat), afișăm mesaj de eroare specific
      if (loginRes.status === 401) {
        const message = await loginRes.text();
        setError(message || 'Unauthorized: Please check your credentials or confirm your email.');
        return;
      }
      // Dacă răspunsul este altceva decât 2xx, aruncăm o eroare generică
      if (!loginRes.ok) {
        throw new Error('Login failed. Please try again later.');
      }
 // Obținem datele JSON din răspuns
      const loginData = await loginRes.json();
      console.log('Login response data:', loginData);
 // Creăm un obiect Cookies pentru a salva token-urile și alte informații
      const cookies = new Cookies();

      const { accessToken, refreshToken, expiration } = loginData;
 // Creăm un obiect Cookies pentru a salva token-urile și alte informații
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
 // Cerem rolurile utilizatorului pentru a le stoca în cookies
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
       // Dacă funcția closeModal este disponibilă, o apelăm (ex: în cazul unui modal de login)
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