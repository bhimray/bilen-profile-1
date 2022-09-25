import React from 'react'
import './Frame.css'

const FrameAndBorder = ({className=""}) => {
  return (
    <div className={`frame-container ${className}`}>
        <div className="f-border-line-t">
            <div className="f-moving-line"></div>
        </div>
        <div className="f-border-line-b">
            <div className="f-moving-line"></div>
        </div>
        <div className="f-border-line-l">
            <div className="f-moving-line"></div>
        </div>
        <div className="f-border-line-r">
            <div className="f-moving-line"></div>
        </div>
    </div>
  )
}

export default FrameAndBorder