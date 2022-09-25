import React from 'react'
import './Learning-track.css'
const LearningTrack = () => {
  return (
    <div className='lt-wrapper' id="lt-wrapper">
        <div className='plaid-background-lt lt-bg'></div>
        <div className='lt-react-wrapper'>
            <div className='lt-react-track'>
                <div className='lt-hover-control'>
                    <div data-hover="From basic to advance" className='lt-html-css-js hovertext z'>HTML, CSS and JS</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Fundamental concept as well as jsx" className='lt-react-concept-jsx hovertext z'>React concept and JSX</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="All the useful react hooks" className='lt-hooks hovertext z'>React hooks</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Ways to pass value in child" className='lt-props-drilling hovertext z'>Props, Props-drilling and State Management</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Optimized way and advance hooks for better performance" className='lt-composition-advance-hooks hovertext z'>Composition and Advance Hooks</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="To fetch data from api in more better way and control the errors" className='lt-react-query-api-call hovertext-l z'>React Query</div>
                </div>
            </div>
            <div className='lt-programming'>React.js</div>
        </div>
        <div className='lt-node-wrapper'>
            <div className='lt-node-track'>
                <div className='lt-hover-control'>
                    <div data-hover="Basics of Node.js" className='lt-basics hovertext z'>basics</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Perform the crud operation" className='lt-crud hovertext z'>CRUD</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Instant connection" className='lt-socket hovertext z'>Socket</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Yet to learn in complete" className='lt-apicall-handle hovertext z'>API call</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Only basics of MongoDB and Learning" className='lt-nosql-sql hovertext z'>NO-SQL and SQL</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Yet to learn" className='lt-cloud hovertext z'>Cloud</div>
                </div>
                <div className='lt-hover-control'>
                    <div data-hover="Yet to learn" className='lt-largedata-security hovertext z'>Large Data and Security</div>
                </div>
            </div>
            <div className='lt-programming'>NODE.js</div>
        </div>
    </div>
)
}

export default LearningTrack
