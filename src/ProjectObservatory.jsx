import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

const responseBand = Array.from({ length: 25 }, (_, step) => {
  const time = step * 0.5;
  const reference = Math.sin(time / 2.6) * 0.55;
  const actual = reference * 0.92 + Math.cos(time * 1.4) * 0.08;
  const predicted = reference * 0.98 + Math.sin(time * 0.9) * 0.04;

  return {
    time,
    lower: reference - 0.18,
    upper: reference + 0.18,
    reference,
    actual,
    predicted,
  };
});

const responseSeries = responseBand.flatMap((point) => [
  { time: point.time, value: point.reference, series: 'Reference path' },
  { time: point.time, value: point.predicted, series: 'Predicted response' },
  { time: point.time, value: point.actual, series: 'Measured response' },
]);

const autonomyMap = [
  { stage: 'Perception', lane: 'Traffic lights', intensity: 0.84, status: 'active' },
  { stage: 'Perception', lane: 'Obstacle field', intensity: 0.92, status: 'active' },
  { stage: 'Localization', lane: 'State estimate', intensity: 0.78, status: 'active' },
  { stage: 'Localization', lane: 'Lane frame', intensity: 0.73, status: 'active' },
  { stage: 'Planning', lane: 'Waypoint graph', intensity: 0.81, status: 'active' },
  { stage: 'Planning', lane: 'Dynamic replanning', intensity: 0.88, status: 'active' },
  { stage: 'Control', lane: 'Frenet MPC', intensity: 0.98, status: 'focus' },
  { stage: 'Control', lane: 'Actuation loop', intensity: 0.91, status: 'focus' },
  { stage: 'Coordination', lane: 'V2V DeePC', intensity: 0.86, status: 'emerging' },
  { stage: 'Validation', lane: 'QCar + QLabs', intensity: 0.9, status: 'active' },
];

const missionTrace = [
  { stage: 'Perception', lane: 'Obstacle field' },
  { stage: 'Localization', lane: 'State estimate' },
  { stage: 'Planning', lane: 'Dynamic replanning' },
  { stage: 'Control', lane: 'Frenet MPC' },
  { stage: 'Coordination', lane: 'V2V DeePC' },
  { stage: 'Validation', lane: 'QCar + QLabs' },
];

function mountPlot(container, plot) {
  container.innerHTML = '';
  container.append(plot);
}

function ProjectObservatory() {
  const responseRef = useRef(null);
  const systemsRef = useRef(null);

  useEffect(() => {
    if (!responseRef.current || !systemsRef.current) {
      return undefined;
    }

    const render = () => {
      const responseWidth = Math.max(responseRef.current.clientWidth, 280);
      const systemsWidth = Math.max(systemsRef.current.clientWidth, 280);

      const responsePlot = Plot.plot({
        width: responseWidth,
        height: 340,
        marginTop: 22,
        marginRight: 28,
        marginBottom: 48,
        marginLeft: 54,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: {
          label: 'Time horizon (s)',
          tickSize: 0,
        },
        y: {
          label: 'Lateral deviation',
          grid: true,
        },
        color: {
          domain: ['Reference path', 'Predicted response', 'Measured response'],
          range: ['#ffd166', '#64d7c4', '#ff7a90'],
          legend: false,
        },
        marks: [
          Plot.areaY(responseBand, {
            x: 'time',
            y1: 'lower',
            y2: 'upper',
            fill: 'rgba(100, 215, 196, 0.13)',
            curve: 'catmull-rom',
          }),
          Plot.ruleY([0], { stroke: 'rgba(255,255,255,0.18)' }),
          Plot.line(responseSeries, {
            x: 'time',
            y: 'value',
            stroke: 'series',
            strokeWidth: 2.7,
            curve: 'catmull-rom',
          }),
          Plot.dot(
            responseSeries.filter((d) => d.series === 'Measured response' && d.time % 1 === 0),
            {
              x: 'time',
              y: 'value',
              r: 4,
              fill: '#ff7a90',
              stroke: '#07111f',
              strokeWidth: 1.5,
            }
          ),
        ],
      });

      const systemsPlot = Plot.plot({
        width: systemsWidth,
        height: 340,
        marginTop: 22,
        marginRight: 16,
        marginBottom: 48,
        marginLeft: 116,
        style: {
          background: 'transparent',
          color: '#eff5ff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
        },
        x: {
          label: null,
          tickSize: 0,
          domain: ['Perception', 'Localization', 'Planning', 'Control', 'Coordination', 'Validation'],
        },
        y: {
          label: null,
          tickSize: 0,
        },
        color: {
          domain: ['active', 'focus', 'emerging'],
          range: ['#64d7c4', '#ffd166', '#ff7a90'],
          legend: false,
        },
        marks: [
          Plot.line(missionTrace, {
            x: 'stage',
            y: 'lane',
            curve: 'catmull-rom',
            stroke: 'rgba(255, 255, 255, 0.35)',
            strokeWidth: 2,
          }),
          Plot.dot(autonomyMap, {
            x: 'stage',
            y: 'lane',
            r: (d) => 10 + d.intensity * 18,
            fill: 'status',
            fillOpacity: 0.88,
            stroke: '#07111f',
            strokeWidth: 2,
          }),
          Plot.dot(missionTrace, {
            x: 'stage',
            y: 'lane',
            r: 4,
            fill: '#eff5ff',
            stroke: '#07111f',
            strokeWidth: 1,
          }),
        ],
      });

      mountPlot(responseRef.current, responsePlot);
      mountPlot(systemsRef.current, systemsPlot);
    };

    render();

    const resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(responseRef.current);
    resizeObserver.observe(systemsRef.current);

    return () => {
      resizeObserver.disconnect();
      if (responseRef.current) responseRef.current.innerHTML = '';
      if (systemsRef.current) systemsRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="observatory-inline">
      <div className="observatory-heading">
        <p className="section-kicker">Systems Visuals</p>
        <h3>More engineering, less infographic.</h3>
        <p className="observatory-copy">
          These visuals are now framed around closed-loop control behavior and the actual autonomy stack, so the
          section reads like robotics engineering work instead of a generic portfolio chart.
        </p>
      </div>

      <div className="observatory-grid">
        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Control behavior</span>
            <h3>Closed-loop response envelope</h3>
            <p>
              A controller-centric view of reference tracking, predicted behavior, and measured response across a
              horizon.
            </p>
          </div>
          <div className="plot-shell" ref={responseRef} />
        </article>

        <article className="observatory-card">
          <div className="observatory-card-copy">
            <span>Autonomy stack</span>
            <h3>Mission pipeline map</h3>
            <p>
              A traced path through perception, localization, planning, control, coordination, and validation layers.
            </p>
          </div>
          <div className="plot-shell" ref={systemsRef} />
        </article>
      </div>
    </div>
  );
}

export default ProjectObservatory;
