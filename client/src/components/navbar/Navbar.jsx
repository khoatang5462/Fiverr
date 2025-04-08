import React, { useEffect, useState } from 'react'
import './Navbar.scss'
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { newRequest } from '../../utils/newRequest.js';

export const Navbar = () => {
    const [active, setActive] = useState(false);
    const [open, setOpen] = useState(false)
    const {pathname} = useLocation()

    const isActive = ()=>{
        window.scrollY > 0 ? setActive(true): setActive(false)
    }
    useEffect(()=>{
        window.addEventListener("scroll", isActive);
        return ()=>{
            window.removeEventListener("scroll", isActive)
        }
    },[])
    const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const handleLogout = async ()=>{
    try {
      await newRequest.post("/logout")
      localStorage.setItem("currentUser", null)
      navigate("/")

    } catch (err) {
      console.log(err)
      
    }
  }
    return (
        <div className={active || pathname !=='/'? " navbar active": "navbar"}>
            <div className='_container'>
                <div className="logo">
                   <Link to="/"><span className='text'>fiverr</span> </Link> 
                    <span className='dot'>.</span>

                </div>
                <div className="links">
                    <span>Fiverr Busines</span>
                    <span>Explore</span>
                    <span>English</span>
                    <span>Sign in</span>
                   {!currentUser ?.isSeller && <span>Become a seller</span>} 
                    {!currentUser && <button>Join</button>}
                    {
                        currentUser &&( 
                        <div className="user" onClick={()=>setOpen(!open)}>
                            <img src={currentUser.img|| "/img/novatar.jpg"} alt="" />
                            <span>{currentUser?.user.userName}</span>
                            {open && <div className="options">
                                {
                                    currentUser?.isSeller &&(
                                        <>
                                        <Link to='/myGigs'>Gigs</Link>
                                        <Link to='/add'>Add New Gig</Link>

                                        </>
                                    )
                                }
                                <Link to='/orders'>Orders</Link>
                                <Link to='/messages'>Messages</Link>
                                <Link onClick={handleLogout()}>Logout</Link>

                            </div>}
                        </div>)
                    }
                </div>
            </div>
            { (active || pathname !== '/') && (
                <>
            
                <hr />
                <div className="menu">
                <Link className="link menuLink" to="/">
              Graphics & Design
            </Link>
            <Link className="link menuLink" to="/">
              Video & Animation
            </Link>
            <Link className="link menuLink" to="/">
              Writing & Translation
            </Link>
            <Link className="link menuLink" to="/">
              AI Services
            </Link>
            <Link className="link menuLink" to="/">
              Digital Marketing
            </Link>
            <Link className="link menuLink" to="/">
              Music & Audio
            </Link>
            <Link className="link menuLink" to="/">
              Programming & Tech
            </Link>
            <Link className="link menuLink" to="/">
              Business
            </Link>
            <Link className="link menuLink" to="/">
              Lifestyle
            </Link>
                </div>
                <hr />
            </>
            )}
        </div>
    )
}
