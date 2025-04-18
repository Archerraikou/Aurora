import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

function Registration() {
    const [formFields, setFormFields] = useState({ nickname: "", email: "", password: "" });
    const { nickname, email, password } = formFields;
    const navigate = useNavigate();
    const [passRequirements, setPassRequirements] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmationLink, setShowConfirmationLink] = useState(false);
    const [confirmationLink, setConfirmationLink] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormFields((prevFields) => ({
            ...prevFields,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const registerInfo = { nickname, email, password };
        setPassRequirements([]);
        
        try {
          const response = await fetch('https://localhost:7242/api/Auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerInfo)
          });
      
          const json = await response.json();
      
          if (!response.ok) {
            if (Array.isArray(json)) {
              setPassRequirements(json.map(item => item.description));
            } else {
              console.error("Unknown error format", json);
            }
          } else {
            console.log("Account created:", json.message);
            navigate("/");
          }
        } catch (error) {
          console.error('Error during registration:', error);
        }
      };
      

    return (
        <div className="centering">
            <h1>Register for Aurora</h1>
            {successMessage && (
                <div className="success-message">
                    <p>{successMessage}</p>
                    {showConfirmationLink && (
                        <p>
                            Development link: <a href={confirmationLink} target="_blank" rel="noopener noreferrer">Confirm Email</a>
                        </p>
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit} className='registerForm'>
                <label className='input-label'>Username</label>
                <input 
                    placeholder='Username' 
                    type="text" 
                    name="nickname" 
                    value={nickname}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                <label className='input-label'>Email</label>
                <input 
                    placeholder='Email' 
                    type="email" 
                    name="email" 
                    value={email}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                <label className='input-label'>Password</label>
                <input 
                    placeholder='Password' 
                    type="password" 
                    name="password" 
                    value={password}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                <ul>
                    {passRequirements.map((item, index) => (
                        <li key={index} className='passwordReq'>{item}</li>
                    ))}
                </ul>
                
                <button type="submit" className='registerButton'>Create account</button>
            </form>
        </div>
    );
}

export default Registration;