import React, { useState } from 'react'
import './Featured.scss'
import { useNavigate } from 'react-router-dom';

export const Featured = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const popularTags = ["Web Design", "WordPress", "Logo Design", "AI Services"];

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/gigs?search=${input}`);
  };

  return (
    <div className="featured">
      <div className="_container">
        <div className="left">
          <h1>
            Find the perfect <span>freelance</span> services for your business
          </h1>
          <div className="search">
            <div className="searchInput">
              <img src="./img/search.png" alt="" />
              <input type="text" placeholder='Try "building mobil app"' />
            </div>
            <button>Search</button>
          </div>
          <div className="popular">
            <span>Popular:</span>
            <button>Web Design</button>
            <button>WordPress</button>
            <button>Logo Design</button>
            <button>AI Services</button>
          </div>
        </div>
        <div className="right">
          <img src="./img/man.png" alt="" />
        </div>
      </div>
    </div>
  );
};
