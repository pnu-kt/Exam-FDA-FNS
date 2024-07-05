// App.tsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Register from './register';
import Login from './login';
import AdminDashboard from './admindashboard';
import UserDashboard from './userdashboard';
import settingAdminpage from './settingAdminpage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={React.createElement(Register)} />
        <Route path="/login" element={React.createElement(Login)} />
        <Route path="/admin" element={React.createElement(AdminDashboard)} />
        <Route path="/user" element={React.createElement(UserDashboard)} /> 
        <Route path="/setting" element={React.createElement(settingAdminpage)} /> 
      </Routes>
    </BrowserRouter>
  );
};

export default App;