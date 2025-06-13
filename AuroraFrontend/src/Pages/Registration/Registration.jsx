import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

function Registration() {
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: ""
    });
    const [passRequirements, setPassRequirements] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmationLink, setShowConfirmationLink] = useState(false);
    const [confirmationLink, setConfirmationLink] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPassRequirements([]);
        
        try {
            const response = await fetch('https://localhost:7242/api/Auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            console.log("Registration response:", data); // Debug logging
            if (!response.ok) {
                // Handle different error formats
                const errors = data.errors || data.Errors || [data.message || "Registration failed"];
                setPassRequirements(errors);
                return;
            }
    
            setSuccessMessage(data || "Registration successful!");
            if (data.ConfirmationLink) {
                setConfirmationLink(data.ConfirmationLink);
                setShowConfirmationLink(true);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setPassRequirements(["Network error. Please try again."]);
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
                    value={formData.nickname}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                <label className='input-label'>Email</label>
                <input 
                    placeholder='Email' 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                <label className='input-label'>Password</label>
                <input 
                    placeholder='Password' 
                    type="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange} 
                    className='input-field'
                    required
                />
                
                {/* Password requirements list */}
                <ul>
                    {passRequirements.map((item, index) => (
                        <li key={index} className='passwordReq'>{item}</li>
                    ))}
                </ul>
                
                <button type="submit" className='registerButton'>Create account</button>
            </form>
            <p>{successMessage}</p>
        </div>
    );
}

export default Registration;