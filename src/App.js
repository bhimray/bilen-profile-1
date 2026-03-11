import './App.css';
import profileImage from './images/profile.webp';

const focusAreas = [
  {
    eyebrow: 'Research',
    title: 'Autonomous systems and controls',
    description:
      'Graduate work centered on autonomous vehicles, robot control, navigation, multi-agent systems, MPC, and robustness-driven engineering.',
  },
  {
    eyebrow: 'Simulation',
    title: 'Modeling that supports decisions',
    description:
      'Hands-on work across MATLAB, Simulink, ANSYS, Gazebo, and ROS to analyze system behavior before hardware deployment.',
  },
  {
    eyebrow: 'Execution',
    title: 'Engineering with operational impact',
    description:
      'Production experience solving root-cause issues, improving efficiency, and turning analysis into measurable process improvements.',
  },
];

const experience = [
  {
    role: 'Autonomous Vehicles Research',
    org: 'University of Texas at Dallas',
    period: 'Current',
    summary:
      'Researching autonomous vehicle systems with emphasis on controls, modeling, navigation, and learning-enabled robotics workflows.',
    highlights: [
      'Focused coursework in robust control, optimal control, optimization, robot control, MPC, and vehicle dynamics.',
      'Uses QUANSER QCar, ROS, Gazebo, MoveIt, Docker, TensorFlow, and deep learning concepts in the research stack.',
    ],
  },
  {
    role: 'Maintenance Engineer Trainee',
    org: 'Gorkha Brewery Pvt. Ltd. (Carlsberg Group)',
    period: 'Jul 2021 - Dec 2021',
    summary:
      'Worked on production-line improvement, root-cause analysis, and system-level efficiency gains in a manufacturing environment.',
    highlights: [
      'Presented Kaizen-based solutions to recurring production issues.',
      'Helped deliver a design modification that increased annual output by roughly 0.12 million bottles.',
    ],
  },
];

const featuredWork = [
  {
    title: 'Autonomous Vehicles',
    type: 'Current research',
    description:
      'A continuing effort around controls, navigation, and system modeling for autonomous vehicle behavior.',
  },
  {
    title: 'Composite Material Review',
    type: 'Undergraduate research',
    description:
      'Built a foundation in analytical thinking through research on composite materials during undergraduate study.',
  },
  {
    title: 'Process Improvement Initiatives',
    type: 'Industry work',
    description:
      'Applied Kaizen, data acquisition, and trend analysis to improve machine reliability and production efficiency.',
  },
];

const skillGroups = [
  {
    label: 'Programming',
    items: ['Python', 'MATLAB', 'JavaScript', 'SQL', 'PLC'],
  },
  {
    label: 'Tools',
    items: ['ROS', 'Gazebo', 'MoveIt', 'Docker', 'QUANSER QCar', 'MicroLogix 1100'],
  },
  {
    label: 'Simulation',
    items: ['Simulink', 'ANSYS', 'Modeling and Simulation'],
  },
  {
    label: 'Concepts',
    items: ['Controller Design', 'Multi-agent Systems', 'Robustness Analysis', 'Deep Learning'],
  },
];

function App() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#hero">
          Bimlendra Ray
        </a>
        <nav className="topnav">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero section" id="hero">
          <div className="hero-copy">
            <p className="kicker">Mechanical Engineering Graduate Researcher</p>
            <h1>
              Building around autonomy,
              <span> controls, robotics, and practical engineering impact.</span>
            </h1>
            <p className="hero-text">
              Based in Richardson, Texas, I am completing an M.S. in Mechanical
              Engineering at The University of Texas at Dallas with work spanning
              autonomous vehicles, model-based control, simulation, and
              production-system problem solving.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="mailto:bimlendra.ray@utdallas.edu">
                Email Me
              </a>
              <a
                className="button button-secondary"
                href="https://www.linkedin.com/in/raybimlendra/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>

            <div className="hero-meta">
              <div>
                <span className="meta-label">Expected Graduation</span>
                <strong>May 2026</strong>
              </div>
              <div>
                <span className="meta-label">Current GPA</span>
                <strong>3.4</strong>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="portrait-frame">
              <img src={profileImage} alt="Bimlendra Ray" />
            </div>
            <div className="hero-card">
              <p>Current focus</p>
              <strong>Autonomous vehicles, robot control, MPC, ROS, and deep learning.</strong>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-heading">
            <p className="section-kicker">Positioning</p>
            <h2>An updated portfolio for where your career is now.</h2>
          </div>

          <div className="about-grid">
            <div className="about-panel">
              <p>
                This portfolio now reflects a graduate engineering profile rather
                than the older frontend-focused site. It emphasizes research,
                controls, robotics, simulation, and engineering work that links
                theory to deployment.
              </p>
            </div>

            <div className="stats-panel">
              <div className="stat-card">
                <span>Education</span>
                <strong>UT Dallas</strong>
                <p>M.S. Mechanical Engineering (DSC)</p>
              </div>
              <div className="stat-card">
                <span>Research</span>
                <strong>Autonomous Vehicles</strong>
                <p>Current graduate project</p>
              </div>
              <div className="stat-card">
                <span>Industry</span>
                <strong>Kaizen + analytics</strong>
                <p>Manufacturing improvement work</p>
              </div>
            </div>
          </div>

          <div className="focus-grid">
            {focusAreas.map((area) => (
              <article className="focus-card" key={area.title}>
                <p>{area.eyebrow}</p>
                <h3>{area.title}</h3>
                <span>{area.description}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section experience-section" id="experience">
          <div className="section-heading">
            <p className="section-kicker">Experience</p>
            <h2>Research-driven and industry-tested.</h2>
          </div>

          <div className="timeline">
            {experience.map((item) => (
              <article className="timeline-item" key={item.role}>
                <div className="timeline-top">
                  <div>
                    <p>{item.org}</p>
                    <h3>{item.role}</h3>
                  </div>
                  <span>{item.period}</span>
                </div>
                <p className="timeline-summary">{item.summary}</p>
                <ul>
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section work-section" id="work">
          <div className="section-heading">
            <p className="section-kicker">Selected Work</p>
            <h2>Projects and engineering themes worth highlighting.</h2>
          </div>

          <div className="work-grid">
            {featuredWork.map((item) => (
              <article className="work-card" key={item.title}>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section education-skills">
          <div className="education-card">
            <p className="section-kicker">Education</p>
            <h2>Academic foundation</h2>
            <div className="education-entry">
              <strong>University of Texas at Dallas</strong>
              <span>Richardson, Texas</span>
              <p>M.S. in Mechanical Engineering (DSC), expected May 2026</p>
            </div>
            <div className="education-entry">
              <strong>Uttarakhand Technical University</strong>
              <span>Dehradun, India</span>
              <p>B.Tech. in Mechanical Engineering, 2020</p>
            </div>
          </div>

          <div className="skills-card">
            <p className="section-kicker">Toolkit</p>
            <h2>Technical stack</h2>
            <div className="skill-groups">
              {skillGroups.map((group) => (
                <div className="skill-group" key={group.label}>
                  <strong>{group.label}</strong>
                  <div className="chip-row">
                    {group.items.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-panel">
            <p className="section-kicker">Contact</p>
            <h2>Open to research, engineering, and technical collaboration.</h2>
            <p>
              Reach out for graduate research opportunities, controls and robotics
              work, or broader engineering roles where modeling, analysis, and
              implementation need to come together.
            </p>

            <div className="contact-links">
              <a href="mailto:bimlendra.ray@utdallas.edu">bimlendra.ray@utdallas.edu</a>
              <a href="tel:+16823744919">+1 682 374 4919</a>
              <a href="https://www.linkedin.com/in/raybimlendra/" target="_blank" rel="noreferrer">
                linkedin.com/in/raybimlendra
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
