import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { JobContext } from "../contexts/JobContext";

function JobForm() {
  const { addJob } = useContext(JobContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    salaryMin: 50000,
    salaryMax: 100000,
    cv: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "salaryMin" || name === "salaryMax" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      cv: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Add job and get the ID
      const jobId = addJob(formData);

      // Navigate to the job details page
      navigate(`/job/${jobId}`);
    } catch (error) {
      console.error("Error adding job:", error);
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          Create New Job Posting
        </h1>
        <p className='text-gray-600'>
          Fill in the details to create a new job posting.
        </p>
      </div>

      <div className='rounded-lg bg-white p-6 shadow-md'>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 gap-6'>
            {/* Position */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Position*
              </label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'
                required
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Salary Range ($)*
              </label>
              <div className='flex space-x-4'>
                <input
                  type='number'
                  name='salaryMin'
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'
                  required
                />
                <input
                  type='number'
                  name='salaryMax'
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'
                  required
                />
              </div>
            </div>

            {/* Submit CV (PDF) */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Submit CV (PDF)*
              </label>
              <input
                type='file'
                name='cv'
                accept='application/pdf'
                onChange={handleFileChange}
                className='w-full'
                required
              />
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <svg
                    className='mr-2 h-5 w-5 animate-spin text-white'
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
                </div>
              ) : (
                "Create Job Posting"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobForm;
