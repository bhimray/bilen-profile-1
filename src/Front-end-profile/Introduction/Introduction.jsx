import React from 'react'
import './introduction.css'
import profile from '../../images/profile.webp'
import UsersGearSolid from '../../svgIcons/users-gear-solid.svg'
import {Link} from 'react-scroll'
import FrameAndBorder from '../Frames and aux/FrameAndBorder'

const Introduction = () => {
  return (
    <div className='i-wrapper'>
        <div className='i-navigation'>
            <Link to="l-card-wrapper" smooth={true} duration={500} className='i-nav'>Links</Link>
            <Link to="pr-projects" smooth={true} duration={800} className='i-nav'>Projects</Link>
            <Link to="s-react" smooth={true} duration={800} className='i-nav'>Skills</Link>
        </div>
        <div className='i-profile-image-container'>
            <div className='i-image-container'>
                <img src={profile} className='i-profile-imge'/>
                <FrameAndBorder className="positioncls"/>
            </div>
            <div className='i-about'>
                <div className='i-about-name'>Bimlendra Ray</div>
                <span className='i-about-details'>
                    I am Passionate Web developer. I have been working on website design for a year.
                    With me you will get promising and astounding website design without any glitch in the system.
                    Your idea or wish is the only things that i need to know to bring that forth in reality because
                    this is what i do and will continue to do. Not only the beautiness but also the beautiness of the website.
                    I can provide higly optimized website for speed and grip. Scroll down to see some of my project that 
                    might resemble your need, if not, do not hesitate to contact me for your new idea and like.
                </span>
            </div>
        </div>
    </div>
  )
}

export default Introduction