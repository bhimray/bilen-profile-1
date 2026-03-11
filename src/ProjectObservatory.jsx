import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

const systemsMatrix = [
  { stage: 'Modeling', lens: 'Controls', score: 92 },
  { stage: 'Modeling', lens: 'Simulation', score: 96 },
  { stage: 'Modeling', lens: 'Learning', score: 68 },
  { stage: 'Navigation', lens: 'Controls', score: 86 },
  { stage: 'Navigation', lens: 'Simulation', score: 81 },
  { stage: 'Navigation', lens: 'Learning', score: 63 },
  { stage: 'Vehicle Dynamics', lens: 'Controls', score: 94 },
  { stage: 'Vehicle Dynamics', lens: 'Simulation', score: 88 },
  { stage: 'Vehicle Dynamics', lens: 'Learning', score: 58 },
  { stage: 'Robot Control', lens: 'Controls', score: 97 },
  { stage: 'Robot Control', lens: 'Simulation', score: 84 },
  { stage: 'Robot Control', lens: 'Learning', score: 61 },
  { stage: 'Validation', lens: 'Controls', score: 75 },
  { stage: 'Validation', lens: 'Simulation', score: 93 },
  { stage: 'Validation', lens: 'Learning', score: 66 },
];

const projectArc = [
  { phase: 'System model', readiness: 28, emphasis: 'Dynamics first' },
  { phase: 'Controller tuning', readiness: 46, emphasis: 'Robust control' },
  { phase: 'Navigation loop', readiness: 62, emphasis: 'Robot control' },
  { phase: 'Simulation stack', readiness: 79, emphasis: 'ROS + Gazebo' },
  { phase: 'AV research', readiness: 91, emphasis: 'QCar trajectory' },
];

function mountPlot(container, plot) {
  container.innerHTML = '';
  container.append(plot);
}

function ProjectObservatory() {
  const matrixRef = useRef(null);
  const arcRef = useRef(null);

  useEffect(() => {
    if (!matrixRef.current || !arcRef.current) {
      return undefined;
    }

    const render = () => {
      const matrixWidth = Math.max(matrixRef.current.clientWidth, 280);
      const arcWidth = Math.max(arcRef.current.clientWidth, 280);

      const matrixPlot = Plot.plot({
        width: matrixWidth,
        height: 340,
        marginTop: 30,
        marginRight: 20,
        marginBottom: 40,
        marginLeft: 110,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: {
          label: null,
          tickSize: 0,
          domain: ['Controls', 'Simulation', 'Learning'],
        },
        y: {
          label: null,
          tickSize: 0,
        },
        color: {
          scheme: 'BuGn',
          domain: [50, 100],
          legend: false,
        },
        marks: [
          Plot.cell(systemsMatrix, {
            x: 'lens',
            y: 'stage',
            fill: 'score',
            inset: 6,
            rx: 18,
          }),
          Plot.text(systemsMatrix, {
            x: 'lens',
            y: 'stage',
            text: (d) => `${d.score}`,
            fill: '#031216',
            fontWeight: 700,
          }),
        ],
      });

      const arcPlot = Plot.plot({
        width: arcWidth,
        height: 340,
        marginTop: 30,
        marginRight: 30,
        marginBottom: 55,
        marginLeft: 44,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: {
          label: null,
          tickRotate: -18,
        },
        y: {
          label: 'Research maturity',
          grid: true,
          domain: [0, 100],
        },
        marks: [
          Plot.areaY(projectArc, {
            x: 'phase',
            y: 'readiness',
            curve: 'catmull-rom',
            fill: 'rgba(100, 215, 196, 0.18)',
          }),
          Plot.line(projectArc, {
            x: 'phase',
            y: 'readiness',
            curve: 'catmull-rom',
            stroke: '#64d7c4',
            strokeWidth: 3,
          }),
          Plot.dot(projectArc, {
            x: 'phase',
            y: 'readiness',
            r: 7,
            fill: '#ffd166',
            stroke: '#07111f',
            strokeWidth: 2,
          }),
          Plot.text(projectArc, {
            x: 'phase',
            y: 'readiness',
            dy: -14,
            text: 'emphasis',
            fontSize: 11,
            fill: '#dce7f4',
          }),
        ],
      });

      mountPlot(matrixRef.current, matrixPlot);
      mountPlot(arcRef.current, arcPlot);
    };

    render();

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(matrixRef.current);
    resizeObserver.observe(arcRef.current);

    return () => {
      resizeObserver.disconnect();
      if (matrixRef.current) matrixRef.current.innerHTML = '';
      if (arcRef.current) arcRef.current.innerHTML = '';
    };
  }, []);

  return (
    <section className="section observatory-section" id="observatory">
      <div className="section-heading observatory-heading">
        <p className="section-kicker">Project Observatory</p>
        <h2>Observable graphics for the autonomous-vehicles story.</h2>
        <p className="observatory-copy">
          This section turns the project into a system map: where the work is
          concentrated, how the stack is balanced, and how the research arc is
          moving from theory into testable engineering.
        </p>
      </div>

      <div className="observatory-grid">
        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Autonomy stack</span>
            <h3>Capability heatmap</h3>
            <p>
              A matrix view of where the project is strongest today across
              controls, simulation, and learning-led work.
            </p>
          </div>
          <div className="plot-shell" ref={matrixRef} />
        </article>

        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Research motion</span>
            <h3>Project progression arc</h3>
            <p>
              A visual narrative from system modeling through controller tuning
              and simulation into the current autonomous-vehicle research stage.
            </p>
          </div>
          <div className="plot-shell" ref={arcRef} />
        </article>
      </div>
    </section>
  );
}

export default ProjectObservatory;
