---
title: "Computation-Aware Vehicle-Control Simulation Testbed"
summary: "Built a Simulink testbed and developed online sampling-rate adaptation that reduced mean simulated processor utilization by 31.9–43.4% across six driving conditions."
platform: "UT Dallas research"
order: 1
tags: ["MATLAB","Simulink","SoC Blockset","acados","NMPC","Fixed-priority scheduling","Execution-time profiling"]
kind: "research"
---

## Simulation testbed

I built a MATLAB/Simulink testbed from scratch using SoC Blockset, a vehicle-dynamics model, acados nonlinear MPC, and fixed-priority scheduling. The testbed evaluates how control sampling affects trajectory tracking and computational demand.

## Evaluation

I compared 10, 20, and 50 ms control sampling periods across urban, highway, and aggressive trajectories under two friction conditions. I measured tracking error, response time, deadline misses, dropped releases, and solver failures.

## Simulation result

Online sampling-rate adaptation reduced mean simulated processor utilization by **31.9–43.4%** against the fixed **10 ms** baseline across six driving conditions. I quantified the associated tracking-performance trade-offs.

[Related manuscript](/work/#manuscript)
