import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

function JobMatches() {
  const { resumes, updateResumeStatus } = useAppContext();
  const [selectedResume, setSelectedResume] = useState(
    resumes.length > 0 ? resumes[0].id : null
  );
  const [viewJob, setViewJob] = useState(null);

  const currentResume = resumes.find((r) => r.id === selectedResume);

  const handleApply = (matchId) => {
    updateResumeStatus(selectedResume, matchId, "applied");
  };

  const handleIgnore = (matchId) => {
    updateResumeStatus(selectedResume, matchId, "ignored");
  };

  return (
    <div className='max-w-6xl mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Job Matches</h1>
        <p className='text-gray-600'>
          View and apply to jobs that match your profile
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className='card text-center py-12'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
            No CVs Uploaded Yet
          </h2>
          <p className='text-gray-600 mb-6'>
            Upload your CV to start matching with job opportunities
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

          {currentResume && currentResume.matches.length === 0 ? (
            <div className='card text-center py-8'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 text-gray-400 mx-auto mb-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                No Matches Found
              </h2>
              <p className='text-gray-600'>
                We haven't found any matches for this CV yet.
              </p>
            </div>
          ) : viewJob ? (
            <div className='card'>
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-800'>
                    {viewJob.position}
                  </h2>
                  <p className='text-lg text-gray-600'>{viewJob.company}</p>
                </div>
                <button
                  onClick={() => setViewJob(null)}
                  className='text-gray-500 hover:text-gray-700'
                >
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
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium text-gray-500'>
                    Location
                  </span>
                  <p className='text-gray-800'>{viewJob.location}</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium text-gray-500'>
                    Salary Range
                  </span>
                  <p className='text-gray-800'>{viewJob.salary}</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium text-gray-500'>
                    Alignment Score
                  </span>
                  <p className='text-green-600 font-semibold'>
                    {viewJob.alignmentScore}%
                  </p>
                </div>
              </div>

              <div className='mb-8'>
                <h3 className='text-lg font-medium text-gray-800 mb-2'>
                  Job Description
                </h3>
                <p className='text-gray-700 whitespace-pre-line'>
                  {viewJob.description}
                </p>
              </div>

              <div className='flex space-x-4'>
                {viewJob.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApply(viewJob.id);
                        setViewJob({ ...viewJob, status: "applied" });
                      }}
                      className='btn-primary'
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => {
                        handleIgnore(viewJob.id);
                        setViewJob({ ...viewJob, status: "ignored" });
                      }}
                      className='btn-secondary'
                    >
                      Not Interested
                    </button>
                  </>
                )}
                {viewJob.status === "applied" && (
                  <div className='inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
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
                    Applied
                  </div>
                )}
                {viewJob.status === "ignored" && (
                  <div className='inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                    Ignored
                  </div>
                )}
              </div>
            </div>
          ) : (
            currentResume && (
              <div className='grid grid-cols-1 gap-6'>
                {currentResume.matches.map((match) => (
                  <div
                    key={match.id}
                    className='card hover:shadow-md transition-shadow'
                  >
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                      <div className='mb-4 md:mb-0'>
                        <h3 className='text-xl font-semibold text-gray-800'>
                          {match.position}
                        </h3>
                        <p className='text-gray-600'>
                          {match.company} • {match.location}
                        </p>
                        <p className='text-gray-500 text-sm mt-1'>
                          Salary: {match.salary}
                        </p>
                      </div>
                      <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2'>
                        <div className='flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 mr-1'
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
                          {match.alignmentScore}% Match
                        </div>
                        {match.status === "applied" ? (
                          <span className='inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
                            Applied
                          </span>
                        ) : match.status === "ignored" ? (
                          <span className='inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm'>
                            Ignored
                          </span>
                        ) : (
                          <button
                            onClick={() => setViewJob(match)}
                            className='px-3 py-1 bg-white border border-primary-500 text-primary-600 rounded-full text-sm font-medium hover:bg-primary-50 transition-colors'
                          >
                            View Details
                          </button>
                        )}
                      </div>
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

export default JobMatches;
