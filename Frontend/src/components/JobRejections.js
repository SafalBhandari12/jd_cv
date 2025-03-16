import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

function JobRejections() {
  const { resumes } = useAppContext();
  const [selectedResume, setSelectedResume] = useState(
    resumes.length > 0 ? resumes[0].id : null
  );

  const currentResume = resumes.find((r) => r.id === selectedResume);

  return (
    <div className='max-w-6xl mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Improvement Suggestions
        </h1>
        <p className='text-gray-600'>
          Get insights on how to improve your CV for better matching
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className='card text-center py-12'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
            No CVs Uploaded Yet
          </h2>
          <p className='text-gray-600 mb-6'>
            Upload your CV to get improvement suggestions
          </p>
          <a href='/upload' className='btn-primary'>
            Upload CV
          </a>
        </div>
      ) : (
        <>
          <div className='mb-6'>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='resumeSelect'
            >
              Select CV
            </label>
            <select
              id='resumeSelect'
              className='input-field'
              value={selectedResume}
              onChange={(e) => setSelectedResume(parseInt(e.target.value))}
            >
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.position} - {resume.university}
                </option>
              ))}
            </select>
          </div>

          {currentResume && currentResume.rejections.length === 0 ? (
            <div className='card text-center py-8'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 text-green-400 mx-auto mb-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                Your CV is Looking Great!
              </h2>
              <p className='text-gray-600'>
                We don't have any improvement suggestions for this CV at the
                moment.
              </p>
            </div>
          ) : (
            currentResume && (
              <div className='space-y-6'>
                <div className='card bg-amber-50 border border-amber-200'>
                  <div className='flex items-center mb-4'>
                    <div className='p-2 rounded-full bg-amber-100 text-amber-600 mr-4'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <h2 className='text-xl font-semibold text-gray-800'>
                      Improvement Areas
                    </h2>
                  </div>
                  <p className='text-gray-700 mb-4'>
                    Based on the job descriptions where your CV didn't match
                    well, we've identified areas that you can improve to
                    increase your chances of getting hired.
                  </p>
                </div>

                {currentResume.rejections.map((rejection) => (
                  <div key={rejection.id} className='card'>
                    <div className='flex flex-col md:flex-row md:justify-between md:items-start'>
                      <div className='mb-4 md:mb-0'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                          {rejection.position}
                        </h3>
                        <p className='text-gray-600'>{rejection.company}</p>
                      </div>
                    </div>

                    <div className='mt-4 p-4 bg-red-50 rounded-lg border border-red-100'>
                      <h4 className='text-red-700 text-sm font-medium mb-1'>
                        Gap Identified
                      </h4>
                      <p className='text-gray-800'>{rejection.reason}</p>
                    </div>

                    <div className='mt-4 p-4 bg-green-50 rounded-lg border border-green-100'>
                      <h4 className='text-green-700 text-sm font-medium mb-1'>
                        Suggestion
                      </h4>
                      <p className='text-gray-800'>{rejection.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default JobRejections;
