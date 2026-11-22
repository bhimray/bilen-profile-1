---
title: "Emergency Obstacle-Avoidance Controller Integration"
summary: "Integrated an acados-generated nonlinear MPC controller with a dSPACE ASM vehicle and traffic model in VEOS. SCALEXIO deployment and real-time validation are in progress."
platform: "UT Dallas research · Ongoing"
order: 0
tags: ["dSPACE ASM","VEOS","SCALEXIO","ConfigurationDesk","ControlDesk","acados","CMake","Simulink"]
kind: "research"
---

## Closed-loop integration in VEOS

I integrated an acados-based nonlinear model predictive controller with the dSPACE ASM vehicle and traffic model in VEOS. I recorded closed-loop simulation data to inspect vehicle response and control commands.

## Controller-to-plant interface

I developed interfaces that convert requested vehicle forces and yaw moment into a steering request and individual-wheel drive and brake torque commands. The allocation accounts for tire-friction constraints.

I integrated generated C code into the Simulink workflow, configured CMake builds, and investigated compiler compatibility, dependencies, and model-interface issues.

## SCALEXIO deployment

I am supporting migration to SCALEXIO through ConfigurationDesk build configuration and ControlDesk troubleshooting. Current work includes processing-unit assignment, software-version compatibility, and target and recorder connectivity. Real-time validation is in progress.
