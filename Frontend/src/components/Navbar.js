import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-primary-700 text-white"
      : "text-primary-100 hover:bg-primary-600 hover:text-white";
  };

  return (
    <nav className='bg-primary-800 shadow-lg'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between'>
          <div className='flex space-x-4'>
            <div className='flex items-center py-4'>
              <span className='font-bold text-white text-xl'>Match Minds</span>
            </div>
            <div className='hidden md:flex items-center space-x-1'>
              <Link
                to='/dashboard'
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/dashboard"
                )}`}
              >
                Dashboard
              </Link>
              <Link
                to='/upload'
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/upload"
                )}`}
              >
                Upload CV
              </Link>
              <Link
                to='/matches'
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/matches"
                )}`}
              >
                Job Matches
              </Link>
              <Link
                to='/rejections'
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                  "/rejections"
                )}`}
              >
                Improvement Suggestions
              </Link>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <button className='px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700'>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
