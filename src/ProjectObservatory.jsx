import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

const systemsMatrix = [
  { stage: 'Perception', lens: 'Robustness', score: 74 },
  { stage: 'Perception', lens: 'Real-Time', score: 79 },
  { stage: 'Perception', lens: 'Integration', score: 82 },
  { stage: 'Localization', lens: 'Robustness', score: 77 },
  { stage: 'Localization', lens: 'Real-Time', score: 84 },
  { stage: 'Localization', lens: 'Integration', score: 86 },
  { stage: 'Planning', lens: 'Robustness', score: 83 },
  { stage: 'Planning', lens: 'Real-Time', score: 80 },
  { stage: 'Planning', lens: 'Integration', score: 88 },
  { stage: 'Control', lens: 'Robustness', score: 96 },
  { stage: 'Control', lens: 'Real-Time', score: 92 },
  { stage: 'Control', lens: 'Integration', score: 90 },
  { stage: 'Validation', lens: 'Robustness', score: 87 },
  { stage: 'Validation', lens: 'Real-Time', score: 78 },
  { stage: 'Validation', lens: 'Integration', score: 91 },
];

const projectArc = [
  { phase: 'Modeling', readiness: 24, emphasis: 'Vehicle model' },
  { phase: 'MPC design', readiness: 48, emphasis: 'Frenet MPC' },
  { phase: 'Perception', readiness: 63, emphasis: 'Obstacle + signals' },
  { phase: 'Pipeline', readiness: 78, emphasis: 'Threaded autonomy stack' },
  { phase: 'Deployment', readiness: 91, emphasis: 'QCar closed loop' },
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
        height: 320,
        marginTop: 24,
        marginRight: 18,
        marginBottom: 38,
        marginLeft: 102,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: { label: null, tickSize: 0, domain: ['Robustness', 'Real-Time', 'Integration'] },
        y: { label: null, tickSize: 0 },
        color: { scheme: 'BuGn', domain: [65, 100], legend: false },
        marks: [
          Plot.cell(systemsMatrix, {
            x: 'lens',
            y: 'stage',
            fill: 'score',
            inset: 6,
            rx: 16,
          }),
          Plot.text(systemsMatrix, {
            x: 'lens',
            y: 'stage',
            text: (d) => `${d.score}`,
            fill: '#041217',
            fontWeight: 700,
          }),
        ],
      });

      const arcPlot = Plot.plot({
        width: arcWidth,
        height: 320,
        marginTop: 24,
        marginRight: 24,
        marginBottom: 52,
        marginLeft: 42,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: { label: null, tickRotate: -18 },
        y: { label: 'Project maturity', grid: true, domain: [0, 100] },
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

    const resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(matrixRef.current);
    resizeObserver.observe(arcRef.current);

    return () => {
      resizeObserver.disconnect();
      if (matrixRef.current) matrixRef.current.innerHTML = '';
      if (arcRef.current) arcRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="observatory-inline">
      <div className="observatory-heading">
        <p className="section-kicker">Systems Visuals</p>
        <h3>Observable engineering graphics for the flagship autonomy project.</h3>
        <p className="observatory-copy">
          These graphics summarize how the autonomous vehicle system is balanced across the stack and how the project
          progresses from modeling into closed-loop deployment.
        </p>
      </div>

      <div className="observatory-grid">
        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Stack balance</span>
            <h3>Autonomy systems heatmap</h3>
            <p>Perception, localization, planning, control, and validation shown through a control-engineering lens.</p>
          </div>
          <div className="plot-shell" ref={matrixRef} />
        </article>

        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Development path</span>
            <h3>Closed-loop project arc</h3>
            <p>Modeling, MPC design, perception integration, pipeline engineering, and QCar deployment.</p>
          </div>
          <div className="plot-shell" ref={arcRef} />
        </article>
      </div>
    </div>
  );
}

export default ProjectObservatory;
