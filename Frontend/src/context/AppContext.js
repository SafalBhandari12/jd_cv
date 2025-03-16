import React, { createContext, useState, useContext } from "react";

// Create the context
const AppContext = createContext();

// Custom hook to use the AppContext
export const useAppContext = () => useContext(AppContext);

// AppProvider component to wrap around the application
export const AppProvider = ({ children }) => {
  // State to manage resumes and job descriptions
  const [resumes, setResumes] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);

  // Function to add a new resume
  const addResume = (resume) => {
    setResumes((prevResumes) => [...prevResumes, resume]);
  };

  // Function to add a new job description
  const addJobDescription = (jobDescription) => {
    setJobDescriptions((prevJobDescriptions) => [
      ...prevJobDescriptions,
      jobDescription,
    ]);
  };

  // Function to update the status of a job application
  const updateApplicationStatus = (resumeId, jobId, status) => {
    setResumes((prevResumes) =>
      prevResumes.map((resume) =>
        resume.id === resumeId
          ? {
              ...resume,
              applications: resume.applications.map((app) =>
                app.jobId === jobId ? { ...app, status } : app
              ),
            }
          : resume
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        resumes,
        jobDescriptions,
        addResume,
        addJobDescription,
        updateApplicationStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
