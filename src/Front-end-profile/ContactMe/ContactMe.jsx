import React from 'react'
import phoneIcon from '../../svgIcons/phone-solid.svg'
import facebookIcon from '../../svgIcons/square-facebook.svg'
import whatsAppIcon from '../../svgIcons/square-whatsapp.svg'
import emailIcon from '../../svgIcons/envelope-open-text-solid.svg'
import './ContactMe.css'
const ContactMe = () => {
  return (
    <div>
        <div className="c-me-wrapper">
            <a href="tel:+977986-401-6596" className="c-medium">
                <div><img src={phoneIcon} alt="" className='c-image' /></div>
                <div className="c-address">Call me</div>
            </a>
            <a href = "mailto: raybimlendra@gmail.com"className="c-medium">
                <div><img src={emailIcon} alt="" className='c-image' /></div>
                <div className="c-address">Email me</div>
            </a>
            <div href="facebook" className="c-medium">
                <div><img src={facebookIcon} alt="" className='c-image' /></div>
                <div className="c-address">Message me</div>
            </div>
            <a href="https://api.whatsapp.com/send?phone=+9779864016596" className="c-medium">
                <div><img src={whatsAppIcon} alt="" className='c-image' /></div>
                <div className="c-address">WhatsApp me</div>
            </a>
        </div>
    </div>
  )
}

export default ContactMe