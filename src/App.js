import { useEffect, useState } from 'react';
import './App.css';
import profileImage from './images/profile_2.jpg';
import utdMonogramLogo from './images/utd_monogram_logo.jpg';
import qcarPickupDropoff from './Proj-qcar/pickup_dropoff.png';
import qcarReport from './Proj-qcar/Report_QCar.pdf';
import agriSortReport from './Proj-agri-sort/Robotics_Project.pdf';
import agriSortBlueCube from './Proj-agri-sort/blue_cube_on_table.png';
import agriSortOrientingCube from './Proj-agri-sort/orienting_the_cube.png';
import alIlqrReport from './Proj-al-ilqr/Optimization_final_report.pdf';
import alIlqrTrajectoryReport from './Proj-al-ilqr/Trajectory_following_using_AL_iLQR_method_and_obstacle_avoidance_using_constraint (1).pdf';
import lapTimeAcceleration from './Proj-lap-time-mpc/acceleration.jpg';
import lapTimeAcceleration20 from './Proj-lap-time-mpc/acc_a20.jpg';
import lapTimeInputs from './Proj-lap-time-mpc/inputs.jpg';
import lapTimeTrack from './Proj-lap-time-mpc/tracks_20.jpg';
import lapTimeVelocity from './Proj-lap-time-mpc/velocity_profile.jpg';
import lapTimeReport from './Proj-lap-time-mpc/Racing_Vehicle_Lap_time_optimization.pdf';
import turtlebotAngularVelocity from './Proj-turtlebot3-ros/angular_velocity.png';
import turtlebotHeadingError from './Proj-turtlebot3-ros/heading_error.png';
import turtlebotLinearVelocity from './Proj-turtlebot3-ros/linear_velocity.png';
import turtlebotPathError from './Proj-turtlebot3-ros/path_error.png';
import turtlebotReport from './Proj-turtlebot3-ros/Trajectory_tracking_turtlebot3.pdf';
import turtlebotTrajectory from './Proj-turtlebot3-ros/trajectory_xy.png';
import turtlebotDemoVideo from './Proj-turtlebot3-ros/Simulation_demo.mp4';
import twoWheeledReport from './Proj-two-wheeled-mobile-robots/Robust_Stability_Analysis_of_a_Two_Wheeled_Self_Balancing_Robot_with_Parametric_Uncertainty (1).pdf';
import twoWheeledWeightedChannels from './Proj-two-wheeled-mobile-robots/02_weighted_channels.png';
import twoWheeledStabilityMargins from './Proj-two-wheeled-mobile-robots/03_robust_stability_margin_comparison.png';
import twoWheeledPitchResponse from './Proj-two-wheeled-mobile-robots/03_experiment_3_pitch_angle_under_parameter_changes.png';
import twoWheeledMotorVoltage from './Proj-two-wheeled-mobile-robots/02_experiment_3_motor_voltage_under_parameter_changes.png';
import twoWheeledWorstCase from './Proj-two-wheeled-mobile-robots/09_robstab_worst_case_simulation.png';
import twoWheeledMonteCarlo from './Proj-two-wheeled-mobile-robots/monte-carlo.png';

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
    id: 'two-wheeled-robust-control',
    title: 'Robust Stability and Performance Analysis of a Two-Wheeled Self-Balancing Robot',
    overview:
      'Compared LQR and mixed-sensitivity H-infinity control for an open-loop unstable self-balancing robot under disturbances, actuator limits, and structured physical uncertainty.',
    platform: 'Robust Control Study | May 2026',
    problem:
      'A two-wheeled self-balancing robot must regulate an unstable upright equilibrium while payload mass, center-of-mass height, external disturbances, and practical motor-voltage limits change the closed-loop dynamics.',
    approach:
      'Derived a common-mode state-space balancing model, designed an LQR baseline and a mixed-sensitivity H-infinity controller, and evaluated both using nominal response, sinusoidal disturbance rejection, uncertain mass and height sweeps, worst-case gain analysis, robust stability margins, and Monte Carlo simulation.',
    architecture: 'Uncertain robot model -> LQR and H-infinity synthesis -> Disturbance and parameter sweeps -> Robust stability analysis -> Monte Carlo validation',
    technologies: ['MATLAB', 'Simulink', 'Robust Control', 'LQR', 'H-infinity Control', 'Monte Carlo Analysis'],
    features: [
      'Modeled payload mass from 0.20 to 0.30 kg and robot height from 0.14 to 0.20 m as structured uncertainty',
      'Designed a full-state LQR controller for nominal stabilization and disturbance rejection',
      'Synthesized a mixed-sensitivity H-infinity controller using sensitivity, control-effort, and complementary-sensitivity weights',
      'Applied robust stability and worst-case gain analysis to identify destabilizing parameter substitutions',
      'Compared pitch regulation, wheel motion, and motor-voltage demand against a 24 V actuator constraint',
      'Validated uncertain closed-loop behavior with 10,000 Monte Carlo samples',
    ],
    results: [
      'Both controllers remained robustly stable across the full modeled mass and height uncertainty set.',
      'LQR achieved a robust stability lower bound of approximately 4.11, compared with 1.66 for the H-infinity controller.',
      'LQR limited maximum pitch deviation to approximately 0.1005 rad, while H-infinity reached approximately 0.1789 rad under the evaluated uncertainty cases.',
      'H-infinity reduced peak per-wheel motor voltage to approximately 2.64 V, compared with approximately 14.07 V for LQR.',
      'Worst-case destabilizing substitutions occurred outside the modeled operating range, confirming stability within the specified uncertainty set.',
      'The study quantified the tradeoff between tighter state regulation and actuator-efficient robust behavior.',
    ],
    assets: {
      reports: [{ label: 'Robust Stability Analysis Report', href: twoWheeledReport }],
      images: [
        {
          src: twoWheeledWeightedChannels,
          alt: 'Frequency responses of weighted sensitivity, control effort, and complementary sensitivity channels',
          caption: 'Mixed-sensitivity H-infinity weighted channels',
        },
        {
          src: twoWheeledStabilityMargins,
          alt: 'Bar chart comparing LQR and H-infinity robust stability margins',
          caption: 'Robust stability margin comparison',
        },
        {
          src: twoWheeledPitchResponse,
          alt: 'Pitch-angle responses for nominal, mass, height, and combined parameter changes',
          caption: 'Pitch regulation under structured parameter uncertainty',
        },
        {
          src: twoWheeledMotorVoltage,
          alt: 'LQR and H-infinity motor-voltage responses under parameter changes and 24 volt limits',
          caption: 'Actuator demand under uncertain operating conditions',
        },
        {
          src: twoWheeledWorstCase,
          alt: 'Pitch and motor-voltage responses at robust-stability worst-case substitutions',
          caption: 'Near-instability worst-case closed-loop behavior',
        },
        {
          src: twoWheeledMonteCarlo,
          alt: 'LQR and H-infinity pitch-angle envelopes from 10000 Monte Carlo uncertainty samples',
          caption: '10,000-sample Monte Carlo robustness validation',
        },
      ],
    },
    links: [],
  },
  {
    id: 'mujoco-legged-robot',
    title: 'Hybrid Control of a Legged Robot in MuJoCo',
    overview:
      'Built a MuJoCo-based legged robot simulation with contact dynamics, actuator constraints, and phase-based hybrid control.',
    platform: 'Independent Project | Dec 2025 - Feb 2026',
    problem:
      'Legged locomotion requires continuous feedback control to work together with discrete gait transitions while remaining stable through contact changes, actuator limits, and environmental disturbances.',
    approach:
      'Modeled the robot and its contact dynamics in MuJoCo, implemented a finite-state machine for gait phases, and designed feedback controllers for body regulation and locomotion tracking. The controller was then evaluated under changes in disturbances, mass, and ground friction.',
    architecture: 'MuJoCo robot model -> Contact dynamics -> Gait state machine -> Feedback control -> Robustness evaluation',
    technologies: ['C++', 'MuJoCo', 'Hybrid Systems', 'Feedback Control', 'Robotics Simulation'],
    features: [
      'MuJoCo simulation with contact dynamics and actuator constraints',
      'Finite-state machine for stance, flight, touchdown, and liftoff transitions',
      'Height regulation and torso stabilization controllers',
      'Forward velocity tracking controller',
      'External disturbance and parameter-variation testing',
    ],
    results: [
      'Evaluated controller robustness under external push disturbances.',
      'Tested locomotion behavior under robot mass variation and changes in ground friction.',
      'Generated plots for center-of-mass height, velocity tracking, joint motion, torque usage, and gait stability.',
    ],
    assets: {
      reports: [],
      images: [],
    },
    links: [],
  },
  {
    id: 'qcar',
    title: 'End-to-End Autonomous Vehicle Control & Planning System (QUANSER QCAR)',
    overview:
      'Head of the QCAR Autonomous Racing Team, designing and deploying a real-time model-based control and planning stack on physical autonomous vehicle hardware.',
    platform: 'UT Dallas | Dec 2025 - Feb 2026',
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
    assets: {
      reports: [{ label: 'QCar Technical Report', href: qcarReport }],
      images: [{ src: qcarPickupDropoff, alt: 'QCar pickup and dropoff system view', caption: 'Pickup and dropoff task snapshot' }],
    },
    links: [
      { label: 'GitHub Repository', href: 'https://github.com/bhimray/Quanser_1st_stage_submission.git' },
      { label: 'System Demo Video', href: '#contact' },
    ],
  },
  {
    id: 'imitation-mpc',
    title: 'Real-Time Neural Approximation of Constrained MPC via Imitation Learning',
    overview:
      'Designed a constrained MPC for an unstable dynamic system and trained a neural network policy to approximate the feedback law.',
    platform: 'UT Dallas | Feb 2026 - Current',
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
    assets: {
      reports: [],
      images: [],
    },
    links: [
      { label: 'GitHub Repository', href: '#contact' },
      { label: 'Technical Note', href: '#contact' },
      { label: 'Simulation Video', href: '#contact' },
    ],
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
    assets: {
      reports: [{ label: 'Lap Time Optimization Report', href: lapTimeReport }],
      images: [
        { src: lapTimeTrack, alt: 'Autonomous racing track plot', caption: 'Track geometry and racing line' },
        { src: lapTimeVelocity, alt: 'Velocity profile plot', caption: 'Velocity profile' },
        { src: lapTimeAcceleration, alt: 'Acceleration profile plot', caption: 'Acceleration response' },
        { src: lapTimeAcceleration20, alt: 'Acceleration response under disturbance', caption: 'Disturbance-aware acceleration response' },
        { src: lapTimeInputs, alt: 'Control input plot', caption: 'Control input profile' },
      ],
    },
    links: [
      { label: 'GitHub Repository', href: 'https://github.com/bhimray/racing_car.git' },
      { label: 'Simulation Results', href: '#contact' },
    ],
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
    assets: {
      reports: [
        { label: 'Optimization Final Report', href: alIlqrReport },
        { label: 'Trajectory Tracking Report', href: alIlqrTrajectoryReport },
      ],
      images: [],
    },
    links: [
      { label: 'GitHub Repository', href: 'https://github.com/bhimray/Optimal_control_Project.git' },
      { label: 'Simulation Demo', href: '#contact' },
    ],
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
    assets: {
      reports: [],
      images: [],
    },
    links: [
      { label: 'GitHub Repository', href: '#contact' },
      { label: 'PLC Ladder Diagram', href: '#contact' },
      { label: 'Hardware Demo', href: '#contact' },
    ],
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
    assets: {
      reports: [{ label: 'Agri Sort Project Report', href: agriSortReport }],
      images: [
        { src: agriSortBlueCube, alt: 'Blue cube detected on the Agri Sort work surface', caption: 'Object detection on sorting surface' },
        { src: agriSortOrientingCube, alt: 'Robotic manipulator orienting a cube for sorting', caption: 'Manipulator orienting object for sorting' },
      ],
    },
    links: [
      { label: 'GitHub Repository', href: '#contact' },
      { label: 'Simulation Demo', href: '#contact' },
    ],
  },
  {
    id: 'turtlebot3-ros',
    title: 'Trajectory Tracking Control for TurtleBot3 Using ROS',
    overview:
      'Developed and evaluated a ROS-based trajectory-tracking workflow for TurtleBot3, analyzing tracking error and control signals across a simulated path-following task.',
    platform: 'UT Dallas | 2025',
    problem:
      'Mobile robots need stable trajectory-tracking performance with bounded path and heading error while maintaining smooth linear and angular velocity commands.',
    approach:
      'Built a ROS-based trajectory-tracking simulation for TurtleBot3, generated reference motion, evaluated closed-loop tracking behavior, and analyzed path error, heading error, and control inputs from the simulation results.',
    architecture: 'Reference trajectory -> Tracking controller -> TurtleBot3 dynamics -> Error and control analysis',
    technologies: ['ROS', 'Python', 'TurtleBot3', 'Robot Navigation', 'Control Systems'],
    features: [
      'ROS-based mobile robot simulation workflow',
      'Trajectory tracking for differential-drive robot motion',
      'Heading and path error analysis',
      'Linear and angular velocity response evaluation',
    ],
    results: [
      'Produced end-to-end simulation results for TurtleBot3 trajectory tracking.',
      'Documented tracking performance using trajectory, path-error, heading-error, and control-response plots.',
    ],
    assets: {
      reports: [{ label: 'TurtleBot3 Trajectory Tracking Report', href: turtlebotReport }],
      images: [
        { src: turtlebotTrajectory, alt: 'TurtleBot3 XY trajectory tracking plot', caption: 'XY trajectory tracking performance' },
        { src: turtlebotPathError, alt: 'TurtleBot3 path error plot', caption: 'Path error response' },
        { src: turtlebotHeadingError, alt: 'TurtleBot3 heading error plot', caption: 'Heading error response' },
        { src: turtlebotLinearVelocity, alt: 'TurtleBot3 linear velocity plot', caption: 'Linear velocity response' },
        { src: turtlebotAngularVelocity, alt: 'TurtleBot3 angular velocity plot', caption: 'Angular velocity response' },
      ],
    },
    links: [
      { label: 'Project Report', href: turtlebotReport },
      { label: 'Simulation Demo Video', href: turtlebotDemoVideo },
    ],
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
  { label: 'Programming', items: ['Python', 'MATLAB', 'C++', 'JavaScript', 'SQL', 'PLC'] },
  { label: 'Robotics', items: ['ROS', 'Gazebo', 'MuJoCo', 'MoveIt', 'Quanser QCar'] },
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

const utdConcentration = {
  title: 'Dynamic Systems and Control Concentration',
  institution: 'The University of Texas at Dallas',
  summary:
    'Graduate coursework centered on modeling, optimization, feedback systems, robotics, and vehicle dynamics for autonomous and control-intensive engineering work.',
  clusters: [
    {
      label: 'Modeling and Analysis',
      courses: [
        'Engineering Modeling and Simulation',
        'Linear System',
        'Vehicle Dynamic System and Control',
      ],
    },
    {
      label: 'Optimization and Control',
      courses: [
        'Engineering Optimization',
        'Model Predictive Control',
        'Optimal Control And Dynamic Programming',
        'Robust Control',
      ],
    },
    {
      label: 'Robotics and Intelligent Systems',
      courses: [
        'Multi-agent Robotics System and Control',
        'Robotics Manipulation and Navigation',
        'Soft Robotics',
      ],
    },
  ],
};

const philosophyPoints = [
  'Engineering credibility comes from closed-loop thinking: sensing, estimation, planning, control, and validation must work as one system.',
  'Simulation should reduce deployment risk, not just produce attractive demos.',
  'Robotics software should be built for repeatability, observability, and safe iteration in uncertain environments.',
];

function getProjectIdFromHash() {
  const match = window.location.hash.match(/^#\/projects\/([^/?]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function ProjectDetailPage({ project }) {
  const [activeImage, setActiveImage] = useState(null);
  const architectureSteps = project.architecture
    ? project.architecture.split(' -> ')
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.id]);

  return (
    <div className="app-shell project-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#hero">
          <img className="brand-logo" src={utdMonogramLogo} alt="UT Dallas logo" />
          Bimlendra Ray
        </a>
        <nav className="topnav">
          <a href="#projects">All Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="project-page-hero">
          <a className="project-back-link" href="#projects">
            Back to portfolio
          </a>
          <p className="project-tag">{project.platform}</p>
          <h1>{project.title}</h1>
          <p className="project-page-summary">{project.overview}</p>

          <div className="project-page-actions">
            {project.links.map((link) => (
              <a
                className="button button-secondary"
                href={link.href}
                key={`${project.id}-hero-${link.label}`}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="project-page-section project-overview-grid">
          <article className="project-story-card">
            <span>Engineering Challenge</span>
            <h2>What needed to be solved</h2>
            <p>{project.problem}</p>
          </article>
          <article className="project-story-card">
            <span>Solution Strategy</span>
            <h2>How the system was approached</h2>
            <p>{project.approach}</p>
          </article>
        </section>

        {architectureSteps.length > 0 ? (
          <section className="project-page-section">
            <div className="project-page-heading">
              <p className="section-kicker">System Flow</p>
              <h2>Architecture from input to deployment</h2>
            </div>
            <div className="architecture-flow">
              {architectureSteps.map((step, index) => (
                <div className="architecture-step" key={`${project.id}-${step}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="project-page-section project-delivery-grid">
          <article className="project-list-panel">
            <p className="section-kicker">Engineering Work</p>
            <h2>Key contributions</h2>
            <ul>
              {project.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="project-list-panel project-results-panel">
            <p className="section-kicker">Outcome</p>
            <h2>Results and impact</h2>
            <ul>
              {project.results.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="project-page-section">
          <div className="project-page-heading">
            <p className="section-kicker">Technical Stack</p>
            <h2>Tools and engineering methods</h2>
          </div>
          <div className="chip-row project-technology-row">
            {project.technologies.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>

        {(project.assets.reports.length > 0 || project.assets.images.length > 0) ? (
          <section className="project-page-section">
            <div className="project-page-heading">
              <p className="section-kicker">Project Evidence</p>
              <h2>Reports, results, and demonstrations</h2>
            </div>

            {project.assets.reports.length > 0 ? (
              <div className="project-report-grid">
                {project.assets.reports.map((report) => (
                  <a
                    className="project-report-card"
                    href={report.href}
                    download
                    key={`${project.id}-${report.label}`}
                  >
                    <span>Technical report</span>
                    <strong>{report.label}</strong>
                    <small>Download PDF</small>
                  </a>
                ))}
              </div>
            ) : null}

            {project.assets.images.length > 0 ? (
              <div className="project-page-gallery">
                {project.assets.images.map((image) => (
                  <figure className="project-page-image" key={`${project.id}-${image.caption}`}>
                    <button type="button" onClick={() => setActiveImage(image)}>
                      <img src={image.src} alt={image.alt} />
                    </button>
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="project-page-section project-page-cta" id="contact">
          <p className="section-kicker">Discuss This Work</p>
          <h2>Interested in the engineering behind this project?</h2>
          <p>
            I am available to discuss the design decisions, implementation details,
            validation process, and lessons learned.
          </p>
          <div className="project-page-actions">
            <a className="button button-primary" href="mailto:raybimlendra@gmail.com">
              Contact Me
            </a>
            <a className="button button-secondary" href="#projects">
              View All Projects
            </a>
          </div>
        </section>
      </main>

      {activeImage ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption || activeImage.alt}
          onClick={() => setActiveImage(null)}
        >
          <div className="image-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              className="image-lightbox-close"
              type="button"
              aria-label="Close image preview"
              onClick={() => setActiveImage(null)}
            >
              Close
            </button>
            <img src={activeImage.src} alt={activeImage.alt} />
            {activeImage.caption ? <p>{activeImage.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const [activeImage, setActiveImage] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(getProjectIdFromHash);
  const activeProject = projects.find((project) => project.id === activeProjectId);

  useEffect(() => {
    const handleRouteChange = () => {
      setActiveProjectId(getProjectIdFromHash());
    };

    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  if (activeProject) {
    return <ProjectDetailPage project={activeProject} />;
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#hero">
          <img className="brand-logo" src={utdMonogramLogo} alt="UT Dallas logo" />
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
            <div className="hero-intro-line">
              <p className="kicker">Bimlendra Ray / Controls and Robotics Engineer</p>
              <span className="availability-badge">
                <i />
                Open to opportunities
              </span>
            </div>
            <h1>
              Engineering autonomous systems that are
              <span> stable, intelligent, and deployable.</span>
            </h1>
            <p className="hero-lead">
              I design control and robotics systems that connect mathematical models
              to reliable machine behavior, from predictive vehicle control and robot
              navigation to hybrid legged locomotion.
            </p>

            <div className="hero-expertise" aria-label="Core engineering expertise">
              <span>Model Predictive Control</span>
              <span>Autonomous Navigation</span>
              <span>Robotics Simulation</span>
              <span>Dynamic Systems</span>
            </div>

            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                Explore Engineering Work
              </a>
              <a
                className="button button-download"
                href={`${process.env.PUBLIC_URL}/Bimlendra_Ray_Resume_RAC.pdf`}
                download="Bimlendra_Ray_Resume_RAC.pdf"
              >
                Download Resume
              </a>
            </div>

            <div className="hero-social-links" aria-label="Professional profiles">
              <a
                href="https://www.linkedin.com/in/raybimlendra/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://github.com/bhimray"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="hero-proof">
              <div>
                <strong>9</strong>
                <span>Featured engineering projects</span>
              </div>
              <div>
                <strong>End-to-end</strong>
                <span>Modeling, control, simulation, and validation</span>
              </div>
              <div>
                <strong>Richardson, TX</strong>
                <span>Available for robotics and controls roles</span>
              </div>
            </div>

          </div>

          <div className="hero-visual">
            <div className="portrait-index" aria-hidden="true">
              <span>Portfolio</span>
              <strong>01</strong>
            </div>
            <div className="portrait-frame">
              <img src={profileImage} alt="Bimlendra Ray" />
              <button
                className="image-expand-button portrait-expand-button"
                type="button"
                aria-label="Expand profile photo"
                onClick={() =>
                  setActiveImage({
                    src: profileImage,
                    alt: 'Bimlendra Ray',
                    caption: 'Profile portrait',
                  })
                }
              >
                Expand
              </button>
            </div>
            <div className="hero-card">
              <p>Engineering Profile</p>
              <strong>Controls-first robotics with a systems view.</strong>
              <span>
                Building across dynamics, optimization, simulation, and autonomous deployment.
              </span>
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
            {projects.map((project) => (
              <article className="project-detail-card project-preview-card" key={project.id}>
                <a className="project-preview-link" href={`#/projects/${project.id}`}>
                  <div className="project-preview-copy">
                    <span className="project-tag">{project.platform || project.overview}</span>
                    <h3>{project.title}</h3>
                    <p>{project.overview}</p>
                  </div>
                  <div className="project-preview-footer">
                    <div className="chip-row">
                      {project.technologies.slice(0, 4).map((item) => (
                        <span className="chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <strong>View project</strong>
                  </div>
                </a>
              </article>
            ))}
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
          <div className="concentration-card">
            <div className="concentration-header">
              <div>
                <p className="section-kicker">Graduate Concentration</p>
                <h2>{utdConcentration.title}</h2>
              </div>
              <div className="concentration-badge">
                <span>Program</span>
                <strong>{utdConcentration.institution}</strong>
              </div>
            </div>
            <p className="concentration-summary">{utdConcentration.summary}</p>
            <div className="concentration-grid">
              {utdConcentration.clusters.map((cluster) => (
                <article className="concentration-cluster" key={cluster.label}>
                  <span>{cluster.label}</span>
                  <div className="course-stack">
                    {cluster.courses.map((course) => (
                      <div className="course-tile" key={course}>
                        <strong>{course}</strong>
                        <p>The University of Texas at Dallas</p>
                      </div>
                    ))}
                  </div>
                </article>
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
            <h2>Let&apos;s discuss robotics systems that need rigorous control engineering.</h2>
            <p className="contact-intro">
              I am open to robotics, autonomy, controls, and simulation opportunities.
              For roles, collaborations, or technical conversations, reach me directly.
            </p>

            <div className="contact-actions">
              <a className="button button-primary" href="mailto:raybimlendra@gmail.com">
                Send an Email
              </a>
              <a
                className="button button-secondary"
                href="https://www.linkedin.com/in/raybimlendra/"
                target="_blank"
                rel="noreferrer"
              >
                Connect on LinkedIn
              </a>
            </div>

            <div className="contact-grid">
              <div>
                <span>Email</span>
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
                <span>GitHub</span>
                <a href="https://github.com/bhimray" target="_blank" rel="noreferrer">
                  github.com/bhimray
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

      {activeImage ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption || activeImage.alt}
          onClick={() => setActiveImage(null)}
        >
          <div className="image-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              className="image-lightbox-close"
              type="button"
              aria-label="Close image preview"
              onClick={() => setActiveImage(null)}
            >
              Close
            </button>
            <img src={activeImage.src} alt={activeImage.alt} />
            {activeImage.caption ? <p>{activeImage.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
