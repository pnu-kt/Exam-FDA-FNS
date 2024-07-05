import React, { useState, useEffect } from 'react';
import './SettingAdminPage.css';
import { useNavigate } from 'react-router-dom';

const SettingAdminPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleGoBack = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate('/admin');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Subject submitted:', subject);
      setSubject('');
      fetchSubjects(); // Refresh the list of subjects after adding a new one
    } catch (error) {
      console.error('Error submitting subject:', error);
    }
  };

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
    <div className="setting-page">
      <div className="top-left-button-container">
        <button onClick={handleGoBack} className="top-left-button">Admin Dashboard</button>
      </div>
      <h1>ใส่ชื่อวิชาของคุณ</h1>
      <form onSubmit={handleSubmit}>
        <label>วิชาที่เปิดสอน:</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <div className="dashboard-header">
        <h1>รายชื่อวิชาสำหรับ Admin</h1>
        <p>รายชื่อวิชา</p>
      </div>
      <div className="dashboard-content">
        {subjects.map((subj, index) => (
          <p key={index}>{subj}</p>
        ))}
      </div>
    </div>
  );
};

export default SettingAdminPage;
