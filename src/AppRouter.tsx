// AppRouter.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CreateUser from './createUser';
import LoginPage from './loginPage'; // Import your login page component
import EventSearchPage from './eventSearchPage';
import EventPage from './eventPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/return-results" element={<EventSearchPage />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        {/* Add other routes as needed */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
