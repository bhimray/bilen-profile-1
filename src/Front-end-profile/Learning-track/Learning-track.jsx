import React from 'react'
import './Learning-track.css'
const LearningTrack = () => {
  return (
    <div className='lt-wrapper'>
        <div className='lt-react-wrapper'>
            <div className='lt-react-track'>
                <div className='lt-html-css-js'>HTML, CSS and JS</div>
                <div className='lt-react-concept-jsx'>React concept and JSX</div>
                <div className='lt-hooks'>React hooks</div>
                <div className='props-props-drilling'>Props, Props-drilling and State Management</div>
                <div className='lt-composition-advance-hooks'>Composition and Advance Hooks</div>
                <div className='lt-react-query-api-call'>React Query</div>
            </div>
            <div className='lt-programming'>React.js</div>
        </div>
        <div className='lt-node-wrapper'>
            <div className='lt-node-track'>
                <div className='lt-basics'>basics</div>
                <div className='lt-crud'>CRUD</div>
                <div className='lt-socket'>Socket</div>
                <div className='lt-apicall-handle'>API call</div>
                <div className='lt-nosql-sql'>NO-SQL and SQL</div>
                <div className='lt-cloud'>Cloud</div>
                <div className='lt-largedata-security'>Large Data and Security</div>
            </div>
            <div className='lt-programming'>NODE.js</div>
        </div>
    </div>
)
}

export default LearningTrack