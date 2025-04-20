import { useState } from 'react';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';
import './login.css';

function Login({ closeModal }) {
  const [formFields, setFormFields] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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
    setError("");
    const loginInfo = { email, password };

    try {
      const loginRes = await fetch('https://localhost:7242/api/Auth/login', {
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
      const cookies = new Cookies();
      cookies.set('JWT', 'Bearer ' + loginData.accessToken, { path: '/' });
      cookies.set('JWTRefresh', loginData.refreshToken, { path: '/' });
      cookies.set('ExpirationDate', loginData.expiresIn * 1000 + Date.now(), { path: '/' });

      try {
        const rolesRes = await fetch('https://localhost:7242/api/Auth/roles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': cookies.get('JWT'),
          },
        });

        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          if (rolesData.roles && rolesData.roles.length > 0) {
            cookies.set('Roles', rolesData.roles[0], { path: '/' });
          }
        } else {
          console.log('Failed to fetch roles');
        }
      } catch (roleErr) {
        console.error('Error getting roles:', roleErr);
      }

      if (closeModal) {
        closeModal();
      } else {
        window.location.href = '/';
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

        <Link to="/Registration">Create an account</Link><br /><br />

        {error && <div className="error-message">{error}</div>}

        <button type="submit">Login</button>
      </form>
    </>
  );
}

export default Login;