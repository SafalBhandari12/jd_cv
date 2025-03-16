import React, { useState } from "react";

function Login({ setIsLoggedIn }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setOtpSent(true);
    setError("");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // Any OTP will work
    if (otp.length > 0) {
      setIsLoggedIn(true);
    } else {
      setError("Please enter OTP");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[80vh]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-primary-800'>Match Minds</h1>
          <p className='text-gray-600 mt-2'>
            Find the perfect job match for your skills
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
            {otpSent ? "Verify OTP" : "Login to Your Account"}
          </h2>

          {error && <p className='text-red-500 mb-4'>{error}</p>}

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className='mb-4'>
                <label
                  className='block text-gray-700 text-sm font-medium mb-2'
                  htmlFor='phone'
                >
                  Phone Number
                </label>
                <input
                  id='phone'
                  type='tel'
                  className='input-field'
                  placeholder='Enter your phone number'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type='submit' className='w-full btn-primary mt-4'>
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className='mb-4'>
                <label
                  className='block text-gray-700 text-sm font-medium mb-2'
                  htmlFor='otp'
                >
                  One-Time Password
                </label>
                <input
                  id='otp'
                  type='text'
                  className='input-field'
                  placeholder='Enter OTP sent to your phone'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button type='submit' className='w-full btn-primary mt-4'>
                Verify & Login
              </button>
              <button
                type='button'
                className='w-full btn-secondary mt-2'
                onClick={() => setOtpSent(false)}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
