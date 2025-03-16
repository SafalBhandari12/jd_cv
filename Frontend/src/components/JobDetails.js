// components/JobDetails.jsx
import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobContext } from '../contexts/JobContext';
import { formatDate } from '../utils/formatters';
import MatchScoreChart from './MatchScoreChart';
// import CandidateDetails from './CandidateDetails';

function JobDetails() {
  const { id } = useParams();
  const { getJob } = useContext(JobContext);
  const navigate = useNavigate();
  const job = getJob(id);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("candidates");

  if (!job) {
    return (
      <div className='container mx-auto mt-8 px-4'>
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>
                Job not found
              </h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>
                  The job posting you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
              <div className='mt-4'>
                <button
                  type='button'
                  onClick={() => navigate("/dashboard")}
                  className='rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200'
                >
                  Go back to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>{job.title}</h1>
          <p className='text-gray-600'>
            {job.department} • {job.location} • {job.type}
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50'
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg bg-white p-4 shadow-md'>
          <h3 className='mb-2 text-lg font-semibold'>Salary Range</h3>
          <p className='text-2xl text-indigo-600'>
            ${job.salaryMin.toLocaleString()} - $
            {job.salaryMax.toLocaleString()}
          </p>
        </div>
        <div className='rounded-lg bg-white p-4 shadow-md'>
          <h3 className='mb-2 text-lg font-semibold'>Candidates Matched</h3>
          <p className='text-2xl text-indigo-600'>{job.candidates.length}</p>
        </div>
        <div className='rounded-lg bg-white p-4 shadow-md'>
          <h3 className='mb-2 text-lg font-semibold'>Posted On</h3>
          <p className='text-2xl text-indigo-600'>
            {formatDate(job.createdAt)}
          </p>
        </div>
      </div>

      <div className='mb-6'>
        <div className='mb-4 border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`py-4 text-sm font-medium ${
                activeTab === "candidates"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Matched Candidates
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 text-sm font-medium ${
                activeTab === "details"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Job Details
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 text-sm font-medium ${
                activeTab === "analytics"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {activeTab === "candidates" && (
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='col-span-1 lg:col-span-2'>
                <h2 className='mb-4 text-xl font-semibold'>
                  Matched Candidates
                </h2>
                <div className='overflow-hidden rounded-lg border border-gray-200'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Rank
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Name
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Match Score
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Skills Match
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Experience
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {job.candidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className={`hover:bg-gray-50 ${
                            selectedCandidate?.id === candidate.id
                              ? "bg-indigo-50"
                              : ""
                          }`}
                        >
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='text-sm text-gray-900'>
                              #{candidate.matchRank}
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='font-medium text-gray-900'>
                              {candidate.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {candidate.email}
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='flex items-center'>
                              <div className='h-2 w-full rounded-full bg-gray-200'>
                                <div
                                  className='h-2 rounded-full bg-indigo-600'
                                  style={{ width: `${candidate.matchScore}%` }}
                                ></div>
                              </div>
                              <span className='ml-2 text-sm font-medium text-gray-900'>
                                {candidate.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='text-sm text-gray-900'>
                              {candidate.skillsMatch}%
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='text-sm text-gray-900'>
                              {candidate.yearsOfExperience} years
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-sm'>
                            <button
                              onClick={() => setSelectedCandidate(candidate)}
                              className='rounded bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100'
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-span-1'>
                {selectedCandidate ? (
                  <div className='rounded-lg border border-gray-200 bg-white p-4'>
                    <div className='mb-4 flex justify-between'>
                      <h3 className='text-lg font-semibold'>
                        Candidate Profile
                      </h3>
                      <button
                        onClick={() => setSelectedCandidate(null)}
                        className='text-gray-400 hover:text-gray-500'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    </div>
                    <div className='mb-4 border-b border-gray-200 pb-4 text-center'>
                      <div className='mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full bg-indigo-100'>
                        <div className='flex h-full w-full items-center justify-center text-2xl font-bold text-indigo-600'>
                          {selectedCandidate.name.charAt(0)}
                        </div>
                      </div>
                      <h4 className='text-lg font-medium'>
                        {selectedCandidate.name}
                      </h4>
                      <p className='text-gray-600'>{selectedCandidate.title}</p>
                    </div>
                    <div className='mb-4'>
                      <div className='mb-2 flex justify-between'>
                        <span className='text-sm text-gray-600'>
                          Match Score
                        </span>
                        <span className='font-medium'>
                          {selectedCandidate.matchScore}%
                        </span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-indigo-600'
                          style={{ width: `${selectedCandidate.matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className='mb-4'>
                      <h5 className='mb-2 font-medium'>Contact Information</h5>
                      <p className='text-sm text-gray-600'>
                        Email: {selectedCandidate.email}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Phone: {selectedCandidate.phone}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Location: {selectedCandidate.location}
                      </p>
                    </div>
                    <div className='mb-4'>
                      <h5 className='mb-2 font-medium'>Top Skills</h5>
                      <div className='flex flex-wrap gap-2'>
                        {selectedCandidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className='inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className='mt-4 flex space-x-2'>
                      <button className='flex-1 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700'>
                        Contact
                      </button>
                      <button className='flex-1 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
                        View CV
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 text-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='mx-auto h-12 w-12 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                      No candidate selected
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      Select a candidate from the list to view their profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Job Details</h2>
            <div className='mb-6'>
              <h3 className='mb-2 text-lg font-medium'>Job Description</h3>
              <p className='whitespace-pre-line text-gray-700'>
                {job.description}
              </p>
            </div>
            <div className='mb-6'>
              <h3 className='mb-2 text-lg font-medium'>Requirements</h3>
              <p className='whitespace-pre-line text-gray-700'>
                {job.requirements}
              </p>
            </div>
            <div className='mb-6'>
              <h3 className='mb-2 text-lg font-medium'>Responsibilities</h3>
              <p className='whitespace-pre-line text-gray-700'>
                {job.responsibilities}
              </p>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-6 text-xl font-semibold'>Match Analytics</h2>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <div>
                <h3 className='mb-4 text-lg font-medium'>
                  Match Score Distribution
                </h3>
                <MatchScoreChart candidates={job.candidates} />
              </div>
              <div>
                <h3 className='mb-4 text-lg font-medium'>
                  Top Skills Among Candidates
                </h3>
                <div className='mt-2 overflow-hidden rounded-lg border border-gray-200'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Skill
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Count
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {getTopSkills(job.candidates).map((skill, index) => (
                        <tr key={index}>
                          <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                            {skill.name}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                            {skill.count}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='flex items-center'>
                              <div className='h-2 w-24 rounded-full bg-gray-200'>
                                <div
                                  className='h-2 rounded-full bg-indigo-600'
                                  style={{ width: `${skill.percentage}%` }}
                                ></div>
                              </div>
                              <span className='ml-2 text-sm text-gray-900'>
                                {skill.percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get top skills among candidates
function getTopSkills(candidates) {
  const skillCount = {};

  // Count occurrences of each skill
  candidates.forEach((candidate) => {
    candidate.skills.forEach((skill) => {
      if (skillCount[skill]) {
        skillCount[skill]++;
      } else {
        skillCount[skill] = 1;
      }
    });
  });

  // Convert to array and sort by count
  const skillsArray = Object.entries(skillCount).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / candidates.length) * 100),
  }));

  // Sort by count (descending)
  skillsArray.sort((a, b) => b.count - a.count);

  // Return top 5 skills
  return skillsArray.slice(0, 5);
}

export default JobDetails;
                    