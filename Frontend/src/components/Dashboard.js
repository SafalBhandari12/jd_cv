// File: src/components/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { resumes } = useAppContext();

  // Options for charts
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Resume Performance",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  // Data for charts
  const barData = {
    labels: resumes.map((resume) => resume.position),
    datasets: [
      {
        label: "ATS Score",
        data: resumes.map((resume) => resume.atsScore),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
      },
      {
        label: "Salary Percentile",
        data: resumes.map((resume) => resume.salaryPercentile),
        backgroundColor: "rgba(45, 212, 191, 0.6)",
      },
    ],
  };

  const matchData = {
    labels: resumes.map((resume) => resume.position),
    datasets: [
      {
        label: "Job Matches",
        data: resumes.map((resume) => resume.matches.length),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
      {
        label: "Rejections",
        data: resumes.map((resume) => resume.rejections.length),
        borderColor: "rgb(244, 63, 94)",
        backgroundColor: "rgba(244, 63, 94, 0.5)",
      },
    ],
  };

  return (
    <div className='py-6 max-w-7xl mx-auto'>
      <div className='mb-10'>
        <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
        <p className='text-gray-600'>
          View your CV performance across different metrics
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
          <Link to='/upload' className='btn-primary'>
            Upload CV
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='card'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              CV Performance Metrics
            </h2>
            <div className='h-64'>
              <Bar options={barOptions} data={barData} />
            </div>
          </div>

          <div className='card'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              Job Match Statistics
            </h2>
            <div className='h-64'>
              <Line options={barOptions} data={matchData} />
            </div>
          </div>

          <div className='card col-span-1 md:col-span-2'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              CV Summary
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full bg-white'>
                <thead>
                  <tr>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      Position
                    </th>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      University
                    </th>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      ATS Score
                    </th>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      University Rank
                    </th>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      Salary Percentile
                    </th>
                    <th className='py-3 px-4 text-left bg-gray-100 font-semibold text-gray-700'>
                      Job Matches
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((resume, index) => (
                    <tr
                      key={resume.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className='py-3 px-4 text-gray-800'>
                        {resume.position}
                      </td>
                      <td className='py-3 px-4 text-gray-800'>
                        {resume.university}
                      </td>
                      <td className='py-3 px-4'>
                        <span
                          className={`inline-block px-2 py-1 rounded ${
                            resume.atsScore >= 80
                              ? "bg-green-100 text-green-800"
                              : resume.atsScore >= 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {resume.atsScore}%
                        </span>
                      </td>
                      <td className='py-3 px-4 text-gray-800'>
                        #{resume.universityRank}
                      </td>
                      <td className='py-3 px-4 text-gray-800'>
                        {resume.salaryPercentile}%
                      </td>
                      <td className='py-3 px-4 text-primary-700 font-medium'>
                        <Link to='/matches'>
                          {resume.matches.length} matches
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Link
          to='/upload'
          className='card bg-white hover:bg-gray-50 transition-colors'
        >
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-primary-100 text-primary-600'>
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
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <h3 className='text-lg font-medium text-gray-900'>Upload CV</h3>
              <p className='text-gray-600'>
                Add a new CV to find more job matches
              </p>
            </div>
          </div>
        </Link>

        <Link
          to='/matches'
          className='card bg-white hover:bg-gray-50 transition-colors'
        >
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-green-100 text-green-600'>
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <h3 className='text-lg font-medium text-gray-900'>Job Matches</h3>
              <p className='text-gray-600'>
                View and apply to matched job opportunities
              </p>
            </div>
          </div>
        </Link>

        <Link
          to='/rejections'
          className='card bg-white hover:bg-gray-50 transition-colors'
        >
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-amber-100 text-amber-600'>
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                Improvement Suggestions
              </h3>
              <p className='text-gray-600'>Get insights to improve your CV</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
