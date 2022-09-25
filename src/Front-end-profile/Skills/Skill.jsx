import React from 'react'
import './skill.css'
import jsIcon from '../../svgIcons/js.svg'
import cssIcon from '../../svgIcons/css3-alt.svg'
import htmlIcon from '../../svgIcons/html5.svg'


const Skill = () => {
  const [showCard, setShowCard] = React.useState(true)
  const [showSkill, setShowSkill] = React.useState({class:"s-skill-level", skill:"React" })
  const [items, setItems] = React.useState({ head:"", icon:"", title:[]})

  const sendItems=(head, icon)=>{
    setItems({head:head, icon:icon})
    if (head== 'vanilla JS'){
      setItems({title:['Intermediate Knowledge', 'Yet, i have not seen any problem in designing the complex work with present knowledge']})
    } else if (head== 'HTML'){
      setItems({title:['Advance knowledge', 'Done lots of work with react, jsx, as well as html']})
    }else if (head== 'CSS'){
      setItems({title:['Advance Knowledge', 'Been able to create perfect website and trouleshoot easily']})
    }else if (head== 'JSX'){
      setItems({title:['I know the basics', 'I have done the synchronous and asynchronous functions']})
    }else if (head== 'Node.js'){
    setItems({title:['I know the basics', 'I have done the synchronous and asynchronous functions']})
  } else if (head== 'Express.js'){
    setItems({title:['I know the basics', 'I have done the synchronous and asynchronous functions']})
  }else if (head== 'Socket.io'){
    setItems({title:['I know the basics', 'I have done the synchronous and asynchronous functions']})
  }
}
  const reducer=(state, action)=>{
    switch (action.type){
      case 'JS':
        return {
        showJS:!state.showJS, showHTML:state.showHTML, showCSS:state.showCSS
      }
      case 'HTML':
        return {
        showJS:state.showJS, showHTML:!state.showHTML, showCSS:state.showCSS
      }
      case 'CSS':
        return {
          showJS:state.showJS, showHTML:state.showHTML, showCSS:!state.showCSS
      }
    }
  }
  const [state, dispatch] = React.useReducer(reducer,{showJS:false, showHTML:false, showCSS:false})
  const [react, setReact] = React.useState('')
  return (
    <div>
      <div className='s-react-wrapper' id="s-react">
        <div className='s-react-card-wrapper'>
          <div className={showCard?'s-react-card-hidden':'s-react-card-dissapear'} onClick={()=>[setShowCard(!showCard), setReact("react"), setShowSkill({skill:"React", class:"s-skill-level"})]}>
            <div className='s-waterfall plaid-background-waterfall'></div>
            <div className='s-skill'>React</div>
            <div className='s-skill-level'></div>
          </div>
          <div className={showCard?'s-react-card-hidden s-react-card-hidden-letter':'s-react-card-dissapear'} onClick={()=>setShowCard(!showCard)}>
            <div className='s-waterfall'>Continuous Learning</div>
            
          </div>
          <div className={showCard?'s-react-card-hidden':'s-react-card-dissapear'} onClick={()=>[setShowCard(!showCard),setReact("node"), setShowSkill({skill:"Node", class:"s-skill-level-node"})]}>
            <div className='s-waterfall plaid-background-waterfall'></div>
            <div className='s-skill'>Node</div>
            <div className='s-skill-level-node'></div>
          </div>
        </div>
        <div  className={showCard? 's-react-card-dissapear':'s-card-open'}>
          <div onClick={()=>setShowCard(!showCard)} className='s-react-card-hidden-container'>
            <div className='s-react-card-hidden'>
              <div className='s-waterfall plaid-background-waterfall'></div>
              <div className='s-skill'>{showSkill.skill}</div>
              <div className={showSkill.class}></div>
            </div>
          </div>
          {react == 'react'?
          <div className='s-react-subskills'>
            <div className='s-react-relative-card'>
              <div className='s-html' onClick={()=>[sendItems('HTML', 'htmlIcon'), dispatch({type:"HTML"})]}>
                <div className='s-head'>HTML</div>
                <img src={htmlIcon} className='s-icon'></img>
                <button className='btn'>Click</button>
              </div>
              <div className='s-css-framer-motion' onClick={()=>[sendItems('CSS', 'cssIcon'), dispatch({type:"CSS"})]}>
                <div className='s-head'>CSS</div>
                <img src={cssIcon} className='s-icon'></img>
                <button className='btn'>Click</button>
              </div>
              <div className='s-vanilla-js' onClick={()=>[sendItems('vanilla JS', 'jsIcon'), dispatch({type:"JS"})]}>
                <div className='s-head'>JS</div>
                <img src={jsIcon} className='s-icon' ></img>
                <button className='btn'>Click</button>
              </div>
            </div>
            <div className='s-react-absolute-card'>
              {/* <div className='s-react-absolute-left'>
                  <img src="" className='s-react-absolute-icons'></img>
                  <div className='s-react-absolute-head'>{items.head}</div>
              </div> */}
              <div className='s-react-absolute-right'>
                <div className='s-react-absolute-head'>{items.head}</div>
                {
                  items.title.map((list)=><div className='s-react-list'>{list}</div>)
                }
              </div>
            </div>
          </div>:
          <div className='s-node-subskills'>
            <div className='s-react-relative-card'>
              <div className='s-html' onClick={()=>[sendItems('HTML', 'htmlIcon'), dispatch({type:"HTML"})]}>
                <div className='s-head'>Node.js</div>
                <img src={htmlIcon} className='s-icon'></img>
                <button className='btn'>Click</button>
              </div>
              <div className='s-css-framer-motion' onClick={()=>[sendItems('CSS', 'cssIcon'), dispatch({type:"CSS"})]}>
                <div className='s-head'>Express.js</div>
                <img src={cssIcon} className='s-icon'></img>
                <button className='btn'>Click</button>
              </div>
              <div className='s-vanilla-js' onClick={()=>[sendItems('vanilla JS', 'jsIcon'), dispatch({type:"JS"})]}>
                <div className='s-head'>Socket.io</div>
                <img src={jsIcon} className='s-icon' ></img>
                <button className='btn'>Click</button>
              </div>
            </div>
            <div className='s-react-absolute-card'>
              {/* <div className='s-react-absolute-left'>
                  <img src="" className='s-react-absolute-icons'></img>
                  <div className='s-react-absolute-head'>{items.head}</div>
              </div> */}
              <div className='s-react-absolute-right'>
                <div className='s-react-absolute-head'>{items.head}</div>
                {
                  items.title.map((list)=><div className='s-react-list'>{list}</div>)
                }
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default Skill