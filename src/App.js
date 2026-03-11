import { useState } from 'react';
import './App.css';
import profileImage from './images/profile.webp';
import { useViewerCounter } from './hooks/useViewerCounter';

const capabilities = [
  {
    title: 'Autonomous Systems',
    description:
      'Design and implementation of autonomy stacks including perception, planning, and control for robotic systems operating in complex environments.',
  },
  {
    title: 'Model Predictive Control',
    description:
      'Development of optimal control strategies including nonlinear MPC for trajectory tracking, navigation, and dynamic system control.',
  },
  {
    title: 'Robotics Simulation',
    description:
      'Building and validating robotic systems in simulation environments including Gazebo, ROS, and Quanser Interactive Labs.',
  },
  {
    title: 'Multi-Agent Systems',
    description:
      'Research into distributed control and coordination for multiple robotic agents using graph-theoretic and optimization-based methods.',
  },
  {
    title: 'Systems Engineering',
    description:
      'Designing integrated robotics systems that combine sensing, estimation, planning, and control into deployable pipelines.',
  },
];

const projects = [
  {
    id: 'qcar',
    title: 'End-to-End Autonomous Vehicle Control & Planning System (QUANSER QCAR)',
    overview:
      'Head of the QCAR Autonomous Racing Team, designing and deploying a real-time model-based control and planning stack on physical autonomous vehicle hardware.',
    platform: 'UT Dallas | Dec 2025 - Present',
    problem:
      'Autonomous racing vehicles require real-time planning and control that preserves stability, safety, and deterministic behavior on hardware.',
    approach:
      'Designed and deployed a model-based control architecture for autonomous vehicle lateral and longitudinal dynamics, optimizing controller behavior for smoothness, stability, and safety while prioritizing deterministic performance over end-to-end learning.',
    architecture: 'Perception -> Planning -> MPC -> Vehicle dynamics -> Hardware deployment',
    technologies: ['Python', 'OpenCV', 'TensorFlow', 'ACADOS', 'QUANSER QCAR'],
    features: [
      'Real-time model-based control architecture',
      'Lateral and longitudinal vehicle control',
      'Physical hardware deployment',
      'Safety- and stability-oriented controller tuning',
    ],
    results: [
      'Built an end-to-end autonomous control and planning stack on physical hardware.',
      'Improved control behavior for smoothness, stability, and safety in real time.',
    ],
    links: ['GitHub (placeholder)', 'Technical report', 'System demo video'],
  },
  {
    id: 'imitation-mpc',
    title: 'Real-Time Neural Approximation of Constrained MPC via Imitation Learning',
    overview:
      'Designed a constrained MPC for an unstable dynamic system and trained a neural network policy to approximate the feedback law.',
    platform: 'UT Dallas | Feb 2025 - Present',
    problem:
      'Constrained MPC is powerful but can be computationally demanding for real-time control of unstable systems.',
    approach:
      'Implemented a constrained MPC for a Linear Inverted Pendulum Model, trained a deep neural network policy using behavior cloning, then deployed and evaluated the learned controller in closed-loop simulation.',
    architecture: 'MPC expert -> Behavior cloning -> Learned policy -> Closed-loop simulation',
    technologies: ['Python', 'PyTorch', 'MPC', 'Optimal Control', 'Robotics Simulation'],
    features: [
      'Constrained MPC design',
      'Imitation learning via behavior cloning',
      'Closed-loop learned controller evaluation',
      'Robustness and distribution shift analysis',
    ],
    results: [
      'Demonstrated neural approximation of MPC feedback for an unstable dynamic system.',
      'Evaluated stability, tracking error, and disturbance rejection in closed loop.',
    ],
    links: ['GitHub (placeholder)', 'Technical note', 'Simulation video placeholder'],
  },
  {
    id: 'lap-time-mpc',
    title: 'Model Predictive Control for Disturbance-Aware Lap Time Optimization in Autonomous Racing Vehicles',
    overview:
      'Developed an MPC formulation for lap-time optimization under disturbances and model uncertainty using two-step sequential programming.',
    platform: 'UT Dallas | Sep 2025 - Dec 2025',
    problem:
      'Autonomous racing controllers must optimize lap time while keeping the true vehicle trajectory within a safe region despite disturbances and model mismatch.',
    approach:
      'Formulated the disturbance-aware lap-time optimization problem and developed an MPC that constrains the actual trajectory within a safety region around the nominal racing line.',
    architecture: 'Nominal racing line -> Disturbance model -> Sequential optimization -> Safety-constrained MPC',
    technologies: ['MATLAB', 'Simulink', 'ACADOS'],
    features: [
      'Lap-time optimization under uncertainty',
      'Safety-region constrained control',
      'Sequential programming workflow',
      'Autonomous racing formulation',
    ],
    results: [
      'Built a control formulation for racing performance under disturbances and uncertainty.',
      'Combined performance optimization with trajectory safety constraints.',
    ],
    links: ['GitHub (placeholder)', 'Controller diagram placeholder', 'Simulation result placeholder'],
  },
  {
    id: 'al-ilqr',
    title: 'Optimal Trajectory Following Using AL-iLQR with Chance-Constrained Dynamic Obstacle Avoidance',
    overview:
      'Developed an augmented AL-iLQR algorithm for trajectory tracking with dynamic obstacle avoidance under chance constraints.',
    platform: 'UT Dallas | Feb 2025 - May 2025',
    problem:
      'Trajectory-following controllers must remain computationally feasible while handling dynamic obstacles and uncertainty in real time.',
    approach:
      'Modeled a linear quadrotor system, discretized the dynamics with RK4, and used an LTV approximation to enable real-time constrained tracking with dynamic obstacle avoidance.',
    architecture: 'Reference trajectory -> AL-iLQR optimizer -> Chance constraints -> Quadrotor tracking',
    technologies: ['iLQR', 'Python'],
    features: [
      'Augmented AL-iLQR controller',
      'Chance-constrained obstacle avoidance',
      'RK4 discretization',
      'LTV approximation for real-time feasibility',
    ],
    results: [
      'Demonstrated reliable obstacle avoidance in simulation.',
      'Analyzed causes of deviation from the reference trajectory to guide controller refinement.',
    ],
    links: ['GitHub (placeholder)', 'Trajectory plot placeholder', 'Simulation demo placeholder'],
  },
  {
    id: 'plc-counting',
    title: 'Detecting and Counting the Number of Objects on a Production Line Using PLC',
    overview:
      'Developed a PLC-controlled counting and container replacement system on real Allen-Bradley hardware.',
    platform: 'Wilkes University | Feb 2024 - May 2024',
    problem:
      'Production systems need reliable automated counting, replacement, and alarming logic to reduce manual monitoring and improve throughput.',
    approach:
      'Built and deployed a PLC program to detect object counts in a container, trigger automatic replacement with an empty container, and raise alarms for completion or faults.',
    architecture: 'Sensing -> PLC logic -> Container replacement -> Alarm handling',
    technologies: ['PLC', 'Allen-Bradley'],
    features: [
      'Real hardware PLC deployment',
      'Automated object counting',
      'Container replacement logic',
      'Fault and completion alarming',
    ],
    results: [
      'Implemented the automation logic on real hardware.',
      'Reduced reliance on manual counting and process monitoring.',
    ],
    links: ['GitHub (placeholder)', 'PLC ladder diagram placeholder', 'Hardware demo placeholder'],
  },
  {
    id: 'agri-sort',
    title: 'Agri Sort: Sorting Fruits and Vegetables Using Image Classification on a Moving Belt',
    overview:
      'Developed a robotic sorting system for fruits and vegetables using ROS and Gazebo with image-based classification.',
    platform: 'UT Dallas | Feb 2025 - May 2025',
    problem:
      'Agricultural sorting systems need automated perception and motion workflows to classify moving objects accurately and reduce manual intervention.',
    approach:
      'Designed and simulated a conveyor-belt-based robotic sorting system, combining ROS, Gazebo, and image classification with AWS Recognition.',
    architecture: 'Image capture -> Classification -> Sorting logic -> Conveyor actuation',
    technologies: ['Python', 'ROS', 'Gazebo', 'AWS Recognition'],
    features: [
      'Robotic sorting workflow',
      'Conveyor belt simulation',
      'Image classification on moving objects',
      'Reduced manual intervention',
    ],
    results: [
      'Improved sorting accuracy through image-based classification.',
      'Built a full perception-to-sorting pipeline in simulation.',
    ],
    links: ['GitHub (placeholder)', 'System diagram placeholder', 'Simulation demo placeholder'],
  },
];

const researchExperience = {
  role: 'V2V Communication for Autonomous Vehicles Using DeePC',
  org: 'Current Ongoing Work',
  period: 'Current',
  overview:
    'Current work focused on connected autonomous vehicles, data-enabled predictive control, and communication-aware closed-loop coordination.',
  bullets: [
    'Focus areas: V2V communication, DeePC, autonomous vehicle coordination, robust closed-loop behavior',
    'Extends the control portfolio from model-based autonomy toward communication-enabled autonomy',
    'Built on coursework in robust control, optimal control, optimization, robot control, and vehicle dynamics',
  ],
};

const industryExperiences = [
  {
    role: 'Software Developer',
    org: 'Silicon Soft and IT Consultant Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    period: 'Jan 2022 - Dec 2023',
    overview:
      'Worked across mobile and web application development, helping expand the company workflow into newer cross-platform and modern frontend stacks.',
    bullets: [
      'Gained confidence in learning and delivering assigned work on time.',
      'Improvised the journey for mobile application development for the first time in the company using Kotlin, Jetpack Compose, and the .NET framework.',
      'Worked on a cross-platform mobile application with other team members using SQL, Kotlin, KMM, and KTOR.',
      'Developed a government web application using React and JavaScript.',
      'Handled two projects under my responsibility and led team members.',
    ],
  },
  {
    role: 'Maintenance Engineer (Trainee)',
    org: 'Gorkha Brewery Pvt. Ltd. (Carlsberg Group)',
    location: 'Chitwan, Nepal',
    period: 'Jul 2021 - Dec 2021',
    overview:
      'Worked on industrial production systems focusing on efficiency improvements and reliability engineering.',
    bullets: [
      'Implemented Kaizen to find out the root problem in the production line and presented a detailed solution.',
      'Performed extended data acquisition and trend analysis to identify system-level energy losses and recommend efficiency improvements.',
      'Awarded Kaizen Star of the Month in November 2021.',
    ],
  },
];

const stackGroups = [
  { label: 'Programming', items: ['Python', 'MATLAB', 'JavaScript', 'SQL', 'PLC'] },
  { label: 'Robotics', items: ['ROS', 'Gazebo', 'MoveIt', 'Quanser QCar'] },
  { label: 'Simulation', items: ['Simulink', 'ANSYS', 'Modeling and Simulation'] },
  {
    label: 'Control & Robotics Concepts',
    items: ['Model Predictive Control', 'Optimal Control', 'Robotics Navigation', 'Multi-Agent Systems', 'Robust Control'],
  },
  { label: 'Engineering Tools', items: ['Docker', 'Git', 'Linux'] },
];

const researchInterests = [
  'Autonomous Vehicles',
  'Robot Navigation',
  'Model Predictive Control',
  'Optimal Control',
  'Multi-Agent Robotics',
  'Learning-Enabled Robotics',
  'Robust Autonomous Systems',
];

const philosophyPoints = [
  'Engineering credibility comes from closed-loop thinking: sensing, estimation, planning, control, and validation must work as one system.',
  'Simulation should reduce deployment risk, not just produce attractive demos.',
  'Robotics software should be built for repeatability, observability, and safe iteration in uncertain environments.',
];

function App() {
  const [expandedProject, setExpandedProject] = useState(projects[0].id);
  const viewerCounter = useViewerCounter();

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#hero">
          Bimlendra Ray
        </a>
        <nav className="topnav">
          <a href="#capabilities">Capabilities</a>
          <a href="#projects">Projects</a>
          <a href="#research">Research</a>
          <a href="#experience">Experience</a>
          <a href="#stack">Stack</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero section" id="hero">
          <div className="hero-copy">
            <p className="kicker">Controls and Robotics Engineer</p>
            <h1>
              Bimlendra Ray
              <span> building reliable autonomous systems through control, robotics, and systems engineering.</span>
            </h1>
            <p className="hero-subtitle">
              Autonomous Systems • Model Predictive Control • Robot Navigation • Multi-Agent Systems
            </p>
            <p className="hero-text">
              I am a Mechanical Engineering graduate researcher at The University of Texas at Dallas specializing in
              dynamic systems and control. My work focuses on building reliable autonomous systems through model-based
              control, robotics simulation, and system-level engineering.
            </p>
            <p className="hero-text">
              I develop navigation and control algorithms for robotic systems including autonomous vehicles, multi-agent
              systems, and robotic platforms operating in uncertain environments. My work integrates perception,
              planning, and control pipelines using modern robotics tools and optimization-based control methods.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="mailto:bimlendra.ray@utdallas.edu">
                Contact
              </a>
              <a className="button button-secondary" href="#projects">
                View Projects
              </a>
              <a className="button button-download" href="/Bimlendra_Ray_Resume.pdf" download>
                Download Resume
              </a>
            </div>

            <div className="hero-meta">
              <div>
                <span className="meta-label">Location</span>
                <strong>Richardson, Texas</strong>
              </div>
              <div>
                <span className="meta-label">Status</span>
                <strong>Actively seeking robotics, autonomy, and control engineering roles.</strong>
              </div>
              <div>
                <span className="meta-label">Expected Graduation</span>
                <strong>May 2026</strong>
              </div>
            </div>

            {/* <div className="viewer-strip">
              <div className="viewer-card">
                <span className="meta-label">Total Viewers</span>
                <strong>{viewerCounter.loading ? '...' : viewerCounter.total}</strong>
              </div>
              <div className="viewer-card">
                <span className="meta-label">Monthly</span>
                <strong>{viewerCounter.loading ? '...' : viewerCounter.monthly}</strong>
              </div>
              <div className="viewer-card">
                <span className="meta-label">Yearly</span>
                <strong>{viewerCounter.loading ? '...' : viewerCounter.yearly}</strong>
              </div>
            </div> */}

            {/* <p className="viewer-note">Counts are stored in this browser and persist unless local browser data is cleared.</p>

            {viewerCounter.error ? <p className="viewer-note">{viewerCounter.error}</p> : null} */}
          </div>

          <div className="hero-visual">
            <div className="portrait-frame">
              <img src={profileImage} alt="Bimlendra Ray" />
            </div>
            <div className="hero-card">
              <p>Engineering focus</p>
              <strong>Model predictive control, robotics simulation, autonomous navigation, and deployable autonomy pipelines.</strong>
            </div>
          </div>
        </section>

        <section className="section" id="capabilities">
          <div className="section-heading">
            <p className="section-kicker">Engineering Capabilities</p>
            <h2>Systems-level autonomy work with control engineering at the core.</h2>
          </div>
          <div className="focus-grid capabilities-grid">
            {capabilities.map((capability) => (
              <article className="focus-card capability-card" key={capability.title}>
                <h3>{capability.title}</h3>
                <span>{capability.description}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section work-section" id="projects">
          <div className="section-heading">
            <p className="section-kicker">Featured Projects</p>
            <h2>Detailed project breakdowns built for robotics and control engineering review.</h2>
          </div>

          <div className="project-cards">
            {projects.map((project) => {
              const expanded = expandedProject === project.id;
              return (
                <article
                  className={`project-detail-card${expanded ? ' expanded' : ''}`}
                  key={project.id}
                >
                  <button
                    className="project-toggle"
                    type="button"
                    onClick={() => setExpandedProject(expanded ? '' : project.id)}
                  >
                    <div>
                      <span className="project-tag">{project.platform || project.overview}</span>
                      <h3>{project.title}</h3>
                      <p>{project.overview}</p>
                    </div>
                    <strong>{expanded ? 'Collapse' : 'Expand'}</strong>
                  </button>

                  {expanded && (
                    <div className="project-expanded">
                      <div className="project-expanded-grid">
                        <div className="detail-block">
                          <span>Problem</span>
                          <p>{project.problem}</p>
                        </div>
                        <div className="detail-block">
                          <span>Approach</span>
                          <p>{project.approach}</p>
                        </div>
                        {project.architecture && (
                          <div className="detail-block">
                            <span>System Architecture</span>
                            <p>{project.architecture}</p>
                          </div>
                        )}
                        <div className="detail-block">
                          <span>Technologies</span>
                          <div className="chip-row">
                            {project.technologies.map((item) => (
                              <span className="chip" key={item}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="detail-block">
                          <span>Key Features</span>
                          <ul>
                            {project.features.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="detail-block">
                          <span>Results</span>
                          <ul>
                            {project.results.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="asset-row">
                        <div className="asset-placeholder">Project video placeholder</div>
                        <div className="asset-placeholder">System diagram placeholder</div>
                        <div className="asset-placeholder">GitHub / report links placeholder</div>
                      </div>

                      <div className="project-links">
                        {project.links.map((link) => (
                          <a href="#contact" key={link}>
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="section experience-section" id="research">
          <div className="section-heading">
            <p className="section-kicker">Research</p>
            <h2>Current work on connected autonomous vehicles and DeePC-driven control.</h2>
          </div>

          <div className="timeline">
            <article className="timeline-item">
              <div className="timeline-top">
                <div>
                  <p>Research</p>
                  <h3>{researchExperience.role}</h3>
                  <strong className="timeline-org">{researchExperience.org}</strong>
                </div>
                <span>{researchExperience.period}</span>
              </div>
              <p className="timeline-summary">{researchExperience.overview}</p>
              <ul>
                {researchExperience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section experience-section" id="experience">
          <div className="section-heading">
            <p className="section-kicker">Experience</p>
            <h2>Professional engineering experience across company and manufacturing environments.</h2>
          </div>

          <div className="timeline">
            {industryExperiences.map((item) => (
              <article className="timeline-item" key={`${item.org}-${item.period}`}>
                <div className="timeline-top">
                <div>
                  <p>Industry</p>
                  <h3>{item.role}</h3>
                  <strong className="timeline-org">{item.org}</strong>
                  {item.location ? <span className="timeline-location">{item.location}</span> : null}
                </div>
                  <span>{item.period}</span>
                </div>
                <p className="timeline-summary">{item.overview}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section single-panel-section" id="stack">
          <div className="skills-card">
            <p className="section-kicker">Technical Stack</p>
            <h2>Tools, platforms, and control engineering foundations.</h2>
            <div className="skill-groups">
              {stackGroups.map((group) => (
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

        <section className="section single-panel-section">
          <div className="education-card">
            <p className="section-kicker">Research Interests</p>
            <h2>Where I want to keep going deeper.</h2>
            <div className="chip-row interest-row">
              {researchInterests.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section single-panel-section">
          <div className="education-card">
            <p className="section-kicker">Education</p>
            <h2>Academic foundation</h2>
            <div className="education-entry">
              <strong>University of Texas at Dallas</strong>
              <span>M.S. Mechanical Engineering (Dynamic Systems and Control)</span>
              <p>Expected Graduation: May 2026</p>
              <p>GPA: 3.4</p>
              <p>Focus Areas: Robotics, Control Systems, Optimization, Autonomous Vehicles</p>
            </div>
            <div className="education-entry">
              <strong>Uttarakhand Technical University</strong>
              <span>B.Tech Mechanical Engineering</span>
              <p>2020</p>
            </div>
          </div>
        </section>

        <section className="section single-panel-section">
          <div className="contact-panel philosophy-card">
            <p className="section-kicker">Engineering Philosophy</p>
            <h2>Reliable autonomy requires integrated engineering, not isolated algorithms.</h2>
            <div className="philosophy-points">
              {philosophyPoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-panel">
            <p className="section-kicker">Contact</p>
            <h2>Open to robotics, autonomy, and control engineering opportunities.</h2>
            <div className="contact-grid">
              <div>
                <span>Email</span>
                <a href="mailto:bimlendra.ray@utdallas.edu">bimlendra.ray@utdallas.edu</a>
              </div>
              <div>
                <span>Alternate Email</span>
                <a href="mailto:raybimlendra@gmail.com">raybimlendra@gmail.com</a>
              </div>
              <div>
                <span>Phone</span>
                <a href="tel:+16823744919">+1 682 374 4919</a>
              </div>
              <div>
                <span>LinkedIn</span>
                <a href="https://www.linkedin.com/in/raybimlendra/" target="_blank" rel="noreferrer">
                  linkedin.com/in/raybimlendra
                </a>
              </div>
              <div>
                <span>Location</span>
                <strong>Richardson, Texas</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
