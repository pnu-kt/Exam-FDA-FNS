import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';

interface RegisterForm {
  Username: string;
  Password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Username: '',
    Password: '',
    confirmPassword: '',
    role: 'user'
  });
  

  const [formError, setFormError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (form.Username.trim() === '' || form.Password.trim() === '' || form.confirmPassword.trim() === '') {
      setFormError('Please fill in username, password, and confirmPassword');
      return;
    }
  
    if (form.Password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
  
      if (!response.ok) {
        console.error('Server responded with error:', response.status, response.statusText);
        throw new Error('Network response was not ok');
      }
      setFormError('');

      navigate('/login');
  
    } catch (error) {
      console.error('Error registering user:', error);
      setFormError('Failed to register. Please try again.');
    }
  };
  

  const clickToLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate('/login');
  };

  return (
    <div className="register-container">
  <h1>Register</h1>
  <div className="top-left-button-container">
    <button onClick={clickToLogin} className="top-left-button">Log in</button>
  </div>
  <form onSubmit={handleSubmit} className="register-form">
    <label>
      Username:
      <input
        type="text"
        value={form.Username}
        onChange={(event) =>
          setForm({ ...form, Username: event.target.value })
        }
        className="form-input"
      />
    </label>
    <br />
    <label>
      Password:
      <input
        type="password"
        value={form.Password}
        onChange={(event) =>
          setForm({ ...form, Password: event.target.value })
        }
        className="form-input"
      />
    </label>
    <br />
    <label>
      Confirm Password:
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(event) =>
          setForm({ ...form, confirmPassword: event.target.value })
        }
        className="form-input"
      />
    </label>
    <br />
    <label>
      Role:
      <select
        value={form.role}
        onChange={(event) =>
          setForm({ ...form, role: event.target.value })
        }
        className="form-input"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </label>
    <br />
    <button type="submit" className="submit-button">Register</button>
    {formError && <p style={{color:'red'}} className="error-message">{formError}</p>}
  </form>
</div>

  );
};

export default Register;
