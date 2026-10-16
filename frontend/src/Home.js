import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import HomeImage from './Home.png'; // Update with the correct path to your image inside 'src'

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{ backgroundImage: `url(${HomeImage})` }}>
      <button className="login-button" onClick={() => navigate('/login')}>
       <b>Go to Login</b> 
      </button>
    </div>
  );
}
