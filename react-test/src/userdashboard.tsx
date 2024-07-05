import React, { useState, useEffect } from 'react';
import './userdashboard.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const UserDashboard: React.FC = () => {

  const [subjects, setSubjects] = useState<string[]>([]);
  const navigate = useNavigate();
    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      navigate('/login');
    };
    const location = useLocation();
    const { role, username } = location.state as { role: string; username: string };
    console.log(username);

    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/subjects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        setSubjects(data.map((subject: { subject: string }) => subject.subject));
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
  
    useEffect(() => {
      fetchSubjects();
    }, []);

  return (
    <div className="user-dashboard">
      <div className="top-left-button-container">
        <button onClick={handleSubmit} className="top-left-button">Log out</button>
      </div>
      <div className="dashboard-header">
        <h1>วิชาที่เปิดสอน</h1>
        <p>Welcome, {username}!</p>
      </div>
      <div className="dashboard-content">
        {subjects.map((subj, index) => (
          <p key={index}>{subj}</p>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
