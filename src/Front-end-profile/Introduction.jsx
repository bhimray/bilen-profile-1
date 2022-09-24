import React from 'react'
import './introduction.css'
import UsersGearSolid from '../svgIcons/users-gear-solid.svg'
const Introduction = () => {
  return (
    <div>
        <div className='i-navigation'>
            <div className='i-nav'>Links</div>
            <div className='i-nav'>Projects</div>
            <div className='i-nav'>Skills</div>
        </div>
        <div className='i-profile-image-container'>
            <div className='i-image-container'>
                <img src={UsersGearSolid} style={{width:'15rem'}} className='i-profile-imge'/>
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