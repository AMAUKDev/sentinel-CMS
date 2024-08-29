import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Dashboard from './components/pages/Dashboard';
import Contact from './components/pages/Contact';
import ErrorPage from './components/pages/ErrorPage';

import { DarkModeProvider } from './context/DarkModeContext'; // Import DarkModeProvider
import { JobProvider} from "./context/JobContext.jsx";


function App() {
  return (
    <Router basename='cms/'>
      <DarkModeProvider>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <JobProvider>
                <Dashboard />
              </JobProvider>
            }
          />

          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<Navigate replace to="/dashboard" />} />

          {/* Catch-all route for 404 errors */}
          <Route path='*' element={<ErrorPage />}/>
        </Routes>
      </DarkModeProvider>
    </Router>
  );
};


export default App;
