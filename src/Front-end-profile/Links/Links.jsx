import React from 'react'
import GitHubIcon from '../../svgIcons/square-git.svg'
// import NetlifyIcon from '../../svgIcons/' 
// import LinkedInIcon from '../../svgIcons/'
import './Links.css'

const Links = () => {
  return (
    <div className="l-card-wrapper">
      <div className='l-bg '></div>
      <div className="l-github-card">
        <div className="l-name">GitHub</div>
        <img src={GitHubIcon} className="l-image"/>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
      <div className="l-github-card">
        <div className="l-name">GitHub</div>
        <img src="" className="l-image"/>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
      <div className="l-github-card">
        <div className="l-name">GitHub</div>
        <img src="" className="l-image"/>
        <a href="">
          <button className="l-visit">Visit</button>
        </a>
      </div>
    </div>
  )
}

export default Links