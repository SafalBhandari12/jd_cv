// File: src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CVUpload from "./components/CVUpload";
import JobMatches from "./components/JobMatches";
import JobRejections from "./components/JobRejections";
import Navbar from "./components/Navbar";
import { AppProvider } from "./context/AppContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppProvider>
      <Router>
        <div className='min-h-screen bg-gray-50'>
          {isLoggedIn && <Navbar />}
          <div className='container mx-auto px-4 py-8'>
            <Routes>
              <Route
                path='/'
                element={
                  !isLoggedIn ? (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                  ) : (
                    <Navigate to='/upload' />
                  )
                }
              />
              <Route
                path='/dashboard'
                element={isLoggedIn ? <Dashboard /> : <Navigate to='/' />}
              />
              <Route
                path='/upload'
                element={isLoggedIn ? <CVUpload /> : <Navigate to='/' />}
              />
              <Route
                path='/matches'
                element={isLoggedIn ? <JobMatches /> : <Navigate to='/' />}
              />
              <Route
                path='/rejections'
                element={isLoggedIn ? <JobRejections /> : <Navigate to='/' />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
