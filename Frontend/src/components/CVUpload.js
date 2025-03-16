// File: src/components/CVUpload.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CVUpload() {
  const [position, setPosition] = useState("");
  const [university, setUniversity] = useState("");
  const [salary, setSalary] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { addResume } = useAppContext();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setError("");
      } else {
        setFile(null);
        setError("Please upload a PDF or Word document");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!position || !university || !salary || !file) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);

    // Simulate processing
    setTimeout(() => {
      addResume({
        position,
        university,
        expectedSalary: salary,
        file: file.name,
      });

      setIsLoading(false);
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className='max-w-3xl mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Upload Your CV</h1>
        <p className='text-gray-600'>
          Upload your CV to find matching job opportunities
        </p>
      </div>

      <div className='card mb-8'>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md'>
              {error}
            </div>
          )}

          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='position'
            >
              Position You're Looking For
            </label>
            <input
              id='position'
              type='text'
              className='input-field'
              placeholder='e.g. Data Scientist, Software Engineer'
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='university'
            >
              University Name
            </label>
            <input
              id='university'
              type='text'
              className='input-field'
              placeholder='e.g. Stanford University'
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>

          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='salary'
            >
              Expected Salary (USD)
            </label>
            <input
              id='salary'
              type='number'
              className='input-field'
              placeholder='e.g. 100000'
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <div className='mb-6'>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='cv'
            >
              Upload CV
            </label>
            <div className='flex items-center justify-center w-full'>
              <label className='flex flex-col rounded-lg border-2 border-dashed w-full h-32 p-10 group text-center cursor-pointer'>
                <div className='h-full w-full text-center flex flex-col items-center justify-center'>
                  {!file ? (
                    <>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-10 h-10 text-primary-500 group-hover:text-primary-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                        />
                      </svg>
                      <p className='text-gray-500 pointer-none text-sm mt-2'>
                        Drag & drop or click to select PDF or Word files
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-10 h-10 text-green-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <p className='text-gray-700 text-sm mt-2'>{file.name}</p>
                    </>
                  )}
                </div>
                <input
                  type='file'
                  className='hidden'
                  onChange={handleFileChange}
                  accept='.pdf,.doc,.docx'
                />
              </label>
            </div>
          </div>

          <div className='flex justify-end'>
            <button type='submit' className='btn-primary' disabled={isLoading}>
              {isLoading ? (
                <span className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Upload CV"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className='card bg-gray-50 border border-gray-200'>
        <h3 className='text-lg font-medium text-gray-800 mb-4'>How It Works</h3>
        <div className='space-y-4'>
          <div className='flex items-start'>
            <div className='flex-shrink-0 bg-primary-100 rounded-full p-1'>
              <span className='flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white text-sm'>
                1
              </span>
            </div>
            <div className='ml-4'>
              <h4 className='text-md font-medium text-gray-800'>
                Upload Your CV
              </h4>
              <p className='text-sm text-gray-600'>
                Our system automatically extracts relevant information from your
                CV
              </p>
            </div>
          </div>
          <div className='flex items-start'>
            <div className='flex-shrink-0 bg-primary-100 rounded-full p-1'>
              <span className='flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white text-sm'>
                2
              </span>
            </div>
            <div className='ml-4'>
              <h4 className='text-md font-medium text-gray-800'>
                AI-Powered Matching
              </h4>
              <p className='text-sm text-gray-600'>
                Our AI analyzes job listings and matches them to your skills and
                experience
              </p>
            </div>
          </div>
          <div className='flex items-start'>
            <div className='flex-shrink-0 bg-primary-100 rounded-full p-1'>
              <span className='flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white text-sm'>
                3
              </span>
            </div>
            <div className='ml-4'>
              <h4 className='text-md font-medium text-gray-800'>
                Get Personalized Insights
              </h4>
              <p className='text-sm text-gray-600'>
                Receive feedback on how to improve your CV and increase your
                chances
              </p>
            </div>
          </div>
          <div className='flex items-start'>
            <div className='flex-shrink-0 bg-primary-100 rounded-full p-1'>
              <span className='flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white text-sm'>
                4
              </span>
            </div>
            <div className='ml-4'>
              <h4 className='text-md font-medium text-gray-800'>
                Apply With Confidence
              </h4>
              <p className='text-sm text-gray-600'>
                Apply to jobs knowing exactly how well your profile matches the
                requirements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CVUpload;