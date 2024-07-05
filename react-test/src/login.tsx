import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./login.css";

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.username.trim() === '' || form.password.trim() === '') {
      setFormError('Please fill in both username and password.');
      return;
    }

    setFormError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        const state = { role: data.role, username: form.username };
        if (data.role === 'admin') {
          navigate('/admin', { state });
        } else if (data.role === 'user') {
          navigate('/user', { state });
        } else {
          navigate('/', { state });
        }
      } else {
        setFormError('Invalid username or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError('An error occurred while logging in. Please try again.');
    }
  };

  const ClickToRegister = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="top-left-button-container">
        <button onClick={ClickToRegister} className="top-left-button">Register</button>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="form-title">Login</h1>
        <label className="form-label">
          Username:
          <input
            type="text"
            value={form.username}
            onChange={(event) =>
              setForm({ ...form, username: event.target.value })
            }
            className="form-input"
          />
        </label>
        <label className="form-label">
          Password:
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            className="form-input"
          />
        </label>
        <button type="submit" className="form-button">Login</button>
        {formError && <p style={{ color: 'red' }} className="error-message">{formError}</p>}
      </form>
    </div>
  );
};

export default Login;
