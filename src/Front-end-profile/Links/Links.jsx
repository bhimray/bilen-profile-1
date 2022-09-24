import React from 'react'
import GitHubIcon from '../../svgIcons/square-git.svg'
import NetlifyIcon from '../../svgIcons/netlify.svg' 
import LinkedInIcon from '../../svgIcons/linkedin.svg'
import './Links.css'

const Links = () => {
  return (
    <div className="l-card-wrapper">
      <div className='l-bg '></div>
      <div className="l-github-card">
        <div className="l-name">GitHub</div>
        <div className='l-image-wrapper'>
          <img src={GitHubIcon} className="l-image"/>
        </div>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
      <div className="l-github-card">
        <div className="l-name">LinkedIn</div>
        <div className='l-image-wrapper'>
          <img src={LinkedInIcon} className="l-image"/>
        </div>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
      <div className="l-github-card">
        <div className="l-name">Netlify</div>
        <div className='l-image-wrapper'>
          <img src={NetlifyIcon} className="l-image"/>
        </div>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
    </div>
  )
}

export default Links