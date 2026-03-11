import { useState } from 'react';
import './App.css';
import profileImage from './images/profile.webp';
import ProjectObservatory from './ProjectObservatory';

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
    id: 'autonomous-systems',
    title: 'Autonomous Systems Project Portfolio',
    overview:
      'Project work around autonomous vehicles, navigation, control integration, and system-level autonomy pipelines.',
    platform: 'Autonomous systems engineering',
    problem:
      'Autonomous systems need reliable coordination between perception, planning, and control to operate safely in uncertain environments.',
    approach:
      'Developed autonomy-oriented project work spanning navigation, closed-loop control, robotics simulation, and integration across the system stack.',
    architecture: 'Perception -> Estimation -> Planning -> Control -> Validation',
    technologies: ['Python', 'ROS', 'Gazebo', 'Quanser QCar', 'Optimization', 'Control design'],
    features: [
      'System-level autonomy thinking',
      'Integrated planning and control workflows',
      'Simulation-first validation',
      'Robotics deployment mindset',
    ],
    results: [
      'Established a project base in autonomous systems engineering.',
      'Built experience connecting controls, robotics, and validation workflows.',
    ],
    links: ['GitHub (placeholder)', 'System diagram', 'Project video placeholder'],
  },
  {
    id: 'av',
    title: 'Autonomous Vehicle Navigation and Control System',
    overview:
      'Development of a closed-loop autonomous vehicle control system using model predictive control and perception integration.',
    platform: 'Quanser QCar autonomous vehicle platform',
    problem:
      'Autonomous vehicles must navigate complex road networks while maintaining stability, avoiding obstacles, and obeying traffic rules.',
    approach:
      'Designed a nonlinear model predictive controller in the Frenet coordinate frame to perform trajectory tracking and vehicle stabilization. Integrated perception modules for obstacle detection and traffic signal interpretation.',
    architecture: 'Perception -> Localization -> Planning -> Control -> Vehicle',
    technologies: ['Python', 'CasADi', 'ACADOS', 'Quanser QCar', 'QLabs Simulation', 'ROS'],
    features: [
      'Real-time trajectory tracking',
      'Traffic light detection',
      'Obstacle detection',
      'Path planning with dynamic replanning',
      'Multi-threaded perception and control pipeline',
    ],
    results: [
      'Stable trajectory tracking across complex road networks',
      'Real-time control loop execution',
      'Integration of perception and control pipelines',
    ],
    links: ['GitHub (placeholder)', 'Technical report', 'Simulation demo video'],
  },
  {
    id: 'deepc-v2v',
    title: 'V2V Communication for Autonomous Vehicles Using DeePC',
    overview:
      'Ongoing work on vehicle-to-vehicle communication and data-enabled predictive control for autonomous vehicle coordination.',
    platform: 'Current ongoing work',
    problem:
      'Connected autonomous vehicles must exchange information reliably and use it in closed-loop control to improve coordination and decision-making.',
    approach:
      'Exploring DeePC-based formulations for autonomous vehicle coordination under V2V communication constraints, with emphasis on closed-loop behavior and robustness.',
    architecture: 'Communication -> Shared data -> DeePC optimization -> Control action -> Vehicle response',
    technologies: ['Python', 'DeePC', 'Optimization', 'Autonomous vehicles', 'V2V communication'],
    features: [
      'Data-enabled predictive control workflow',
      'Connected-vehicle coordination',
      'Closed-loop decision integration',
      'Robust autonomous behavior focus',
    ],
    results: [
      'Current ongoing work in autonomous vehicle coordination and control.',
      'Expands the portfolio from standalone navigation to connected autonomy.',
    ],
    links: ['Research notes placeholder', 'Simulation placeholder', 'Technical write-up placeholder'],
  },
  {
    id: 'sim',
    title: 'Robotics Simulation and Control Framework',
    overview:
      'Development of a simulation framework for testing robotics control algorithms before hardware deployment.',
    problem:
      'Robotic systems require extensive testing in simulation to ensure safe real-world deployment.',
    approach:
      'Built simulation environments using ROS and Gazebo to test robot motion planning, control algorithms, and navigation strategies.',
    technologies: ['ROS', 'Gazebo', 'MoveIt', 'Docker', 'Python'],
    features: [
      'Robot motion planning',
      'Sensor simulation',
      'Path planning experiments',
      'Control algorithm validation',
    ],
    results: ['Enabled rapid testing of robotic behaviors and system-level autonomy pipelines.'],
    links: ['GitHub (placeholder)', 'Simulation diagram', 'Demo video placeholder'],
  },
  {
    id: 'multi-agent',
    title: 'Multi-Agent Robotics and Distributed Control',
    overview: 'Research into coordination strategies for multi-agent robotic systems.',
    problem:
      'Multiple robots must coordinate actions efficiently in shared environments.',
    approach:
      'Studied graph-based coordination and distributed optimization strategies for multi-agent systems.',
    technologies: ['Graph theory', 'Distributed optimization', 'Formation control', 'Consensus algorithms'],
    features: ['Distributed coordination', 'Formation logic', 'Shared-environment planning'],
    results: ['Applications include drone swarms, robot fleets, and cooperative autonomous vehicles.'],
    links: ['GitHub (placeholder)', 'Coordination diagram', 'Research note placeholder'],
  },
  {
    id: 'composite',
    title: 'Composite Material Review Study',
    overview:
      'Undergraduate project work involving a review paper on composite materials.',
    platform: 'Undergraduate project work',
    problem:
      'Engineering material selection requires understanding the tradeoffs and performance characteristics of composite material systems.',
    approach:
      'Conducted a structured review of composite-material behavior, performance, and engineering relevance as part of undergraduate work.',
    technologies: ['Mechanical engineering fundamentals', 'Technical review', 'Material analysis'],
    features: ['Literature review', 'Engineering evaluation', 'Technical synthesis'],
    results: [
      'Built a stronger analytical foundation for later systems and controls work.',
      'Added formal technical writing and review experience to the portfolio.',
    ],
    links: ['Review paper placeholder', 'Summary diagram placeholder'],
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
    role: 'Professional Experience',
    org: 'Silicon Soft Company',
    period: 'Earlier experience',
    overview:
      'Technical and engineering work prior to graduate study. The exact title and dates were not recoverable from the locally extracted resume text.',
    bullets: [
      'Included applied technical problem-solving in a professional company environment.',
      'Positioned here as prior engineering experience referenced in the resume.',
      'Can be tightened further once the exact role title and dates are confirmed.',
    ],
  },
  {
    role: 'Maintenance Engineer (Trainee)',
    org: 'Gorkha Brewery Pvt. Ltd. (Carlsberg Group)',
    period: 'Jul 2021 - Dec 2021',
    overview:
      'Worked on industrial production systems focusing on efficiency improvements and reliability engineering.',
    bullets: [
      'Conducted root-cause analysis on production issues.',
      'Developed Kaizen-based process improvement strategies.',
      'Implemented design modification that increased annual output by approximately 0.12 million bottles.',
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

          <ProjectObservatory />
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
