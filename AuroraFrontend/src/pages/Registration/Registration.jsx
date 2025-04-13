import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';
import './Registration.css'

function Registration(){
    const [formFields, setFormFields] = useState({nickname: "", email: "", password: "" });
    const { nickname, email, password } = formFields;
    const navigate = useNavigate();
    const [passRequirements,setPassRequirements] = useState([]);
    var auxPassRequirements = []
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
      console.log(registerInfo);
      try {
        const response = await fetch('https://localhost:7242/api/Auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerInfo)
        });
        console.log(response);
        if (!response.ok) {
            const json = await response.json();
            auxPassRequirements= json.map(item => item.description)
            console.log(auxPassRequirements)
            setPassRequirements([...auxPassRequirements]);

        }
        else {
            console.log("Account created");
            navigate("/");
        };
      } catch (error) {
        console.error('Error during login:', error);
      }
    };
    return (
      <div className="centering">
        <h1>Register for Aurora</h1>
            <form onSubmit={handleSubmit} className='registerForm'>
                <label className='input-label'>Username</label>
                <input placeholder='Username' type="text" name="nickname" onChange={handleChange} className='input-field'></input>
                <label className='input-label'>Email</label>
                <input placeholder='Email' type = "text" name="email" onChange={handleChange} className='input-field'></input>
                <label className='input-label'>Password</label>
                <input placeholder='Password' type = "password" name="password" onChange={handleChange} className='input-field'></input>
                <ul>
                    {passRequirements.map((item,index)=>{
                       return <li key={index} className='passwordReq'>{item}</li>
                    })}
                </ul>
                <button type="submit" className='registerButton'>Create account</button>
            </form>
      </div>
    )
}
export default Registration