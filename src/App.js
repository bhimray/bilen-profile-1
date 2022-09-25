import './App.css';
import Introduction from './Front-end-profile/Introduction/Introduction'
import LearningTrack from './Front-end-profile/Learning-track/Learning-track'
import Links from './Front-end-profile/Links/Links';
import Skill from './Front-end-profile/Skills/Skill';
// import FrameAndBorder from './Front-end-profile/Frames and aux/FrameAndBorder'

function App() {
  return (
    <div className="App spectrum-background">
      <Introduction/>
      <LearningTrack/>
      <Links/>
      <Skill/>      
    </div>
  );
}

export default App;
