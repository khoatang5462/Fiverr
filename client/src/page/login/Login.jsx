import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './Login.scss';
import axios from 'axios';
import { newRequest } from '../../utils/newRequest.js';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const handleSubmit = async (e)=>{
    e.preventDefault()
    try{
     const res =  await  newRequest.post("auth/login", {
        email,
        password
      })
      localStorage.setItem("currentUser", JSON.stringify(res.data))
      navigate("/")
    }catch(err){
      setError(err.response.data) 
      
    }
  }


  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Continue with your email</h1>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group password-input">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={e=>setPassword(e.target.value)}
              required
            />
            <span className="toggle-password" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button type="submit">Login</button>
        {error && error}
      </form>
    </div>
  );
};