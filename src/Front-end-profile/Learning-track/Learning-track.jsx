import React from 'react'
import './Learning-track.css'
const LearningTrack = () => {
  return (
    <div className='lt-wrapper'>
        <div className='plaid-background-lt lt-bg'></div>
        <div className='lt-react-wrapper'>
            <div className='lt-react-track'>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-html-css-js hovertext z'>HTML, CSS and JS</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-react-concept-jsx hovertext z'>React concept and JSX</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-hooks hovertext z'>React hooks</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-props-drilling hovertext z'>Props, Props-drilling and State Management</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-composition-advance-hooks hovertext z'>Composition and Advance Hooks</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-react-query-api-call hovertext z'>React Query</div>
                </div>
            </div>
            <div className='lt-programming'>React.js</div>
        </div>
        <div className='lt-node-wrapper'>
            <div className='lt-node-track'>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-basics hovertext z'>basics</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-crud hovertext z'>CRUD</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-socket hovertext z'>Socket</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-apicall-handle hovertext z'>API call</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-nosql-sql hovertext z'>NO-SQL and SQL</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-cloud hovertext z'>Cloud</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-largedata-security hovertext z'>Large Data and Security</div>
                </div>
            </div>
            <div className='lt-programming'>NODE.js</div>
        </div>
    </div>
)
}

export default LearningTrack
