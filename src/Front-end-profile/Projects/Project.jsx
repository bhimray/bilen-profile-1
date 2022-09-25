import React from 'react'
import './project.css'
import codeForkIcon from '../../svgIcons/code-fork-solid.svg'
const Project = () => {
  return (
    <div>
      <div className="pr-projects">
        <div className="r-project">
          <div className="imgae-container">
            <img src={codeForkIcon} alt="" className='r-image' />
          </div>
          <div className="project-head">Hotel App</div>
          <div className="project-details"><h4>First project</h4>, In this 
          project i have used all concept possible to make website for the hotel on my own and google and stackoverflow help. While doing this
          project i have learned things like routing and some css error while changing state and other basic flaw that i was unaware of.</div>
        </div>
        <div className="r-project">
          <div className="image-container">
            <img src={codeForkIcon} alt="" className='r-image' />
          </div>
          <div className="project-head">Gym App</div>
          <div className="project-details">This project is actually build for real Gym. Here, actually i have implemented all the css tricks and used some react-node packages for to 
          make website more interactive and dynamic. The most important feature is email sending, easy scroll and beautiful appearance. I tried to make database within the page and make a call 
          to use it wherever it is necessary to display. This project really lifted me up.</div>
        </div>
        <div className="r-project">
          <div className="image-container">
            <img src={codeForkIcon} alt="" className='r-image' />
          </div>
          <div className="project-head">Dry Cleaner Project</div>
          <div className="project-details">This project is a contract project for dry cleaner company which i got from direct contact. I built this project for mobile friendly only but yet it is good for large screen. This 
          website have lots of advance features like horizontal scrolling and changing state. The appearance is astounding and lastly, have facebook messenger connected to it for easy communication.</div>
        </div>
        <div className="r-project">
          <div className="image-container">
            <img src={codeForkIcon} alt="" className='r-image' />
          </div>
          <div className="project-head">My Profile</div>
          <div className="project-details">Finally, My profile itself is great example of the knowledge of react. In all these mentioned project i might not have used some other concept like React Query
          .However, i am well verse in that too. State management and error handling is also well known to me. I have done some other small project which you can see on my GitHub profile.</div>
        </div>
      </div>
    </div>
  )
}

export default Project