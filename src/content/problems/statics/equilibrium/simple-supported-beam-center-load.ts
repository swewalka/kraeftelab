import { vector } from "../../../../mechanics/core/vector";
import type { ProblemDefinition } from "../../../../mechanics/model/problemDefinition";

const beamLength = 6;
const loadMagnitude = 12_000;
const loadPosition = beamLength / 2;

export const simpleSupportedBeamCenterLoad: ProblemDefinition = {
  id: "simple-supported-beam-center-load",
  title: "Simply Supported Beam with Center Load",
  topic: "statics.equilibrium",
  statement:
    "A horizontal rigid beam is supported by a pin at A and a roller at B. A single vertical downward force acts at midspan. Calculate the support reactions.",
  parameters: [
    { id: "beamLength", label: "L", value: beamLength, unit: "m", displayValue: "6 m" },
    { id: "loadMagnitude", label: "F", value: loadMagnitude, unit: "N", displayValue: "12 kN" },
    { id: "loadPosition", label: "x_F", value: loadPosition, unit: "m", displayValue: "3 m" },
  ],
  points: [
    { id: "pointA", label: "A", x: 0, y: 0 },
    { id: "pointB", label: "B", x: beamLength, y: 0 },
    { id: "pointLoad", label: "F", x: loadPosition, y: 0 },
  ],
  bodies: [
    {
      id: "beam",
      label: "Rigid beam",
      kind: "rigidBeam",
      startPointId: "pointA",
      endPointId: "pointB",
    },
  ],
  supports: [
    { id: "supportA", label: "A", kind: "pin", pointId: "pointA", bodyId: "beam" },
    { id: "supportB", label: "B", kind: "roller", pointId: "pointB", bodyId: "beam" },
  ],
  loads: [
    {
      id: "centerLoad",
      label: "F",
      kind: "pointForce",
      bodyId: "beam",
      position: { id: "loadPosition", label: "F", x: loadPosition, y: 0 },
      vector: vector(0, -loadMagnitude),
      displayMagnitude: "12 kN",
    },
  ],
  unknownReactions: [
    { id: "reactionAx", label: "A_x", supportId: "supportA", component: "x", direction: vector(1, 0) },
    { id: "reactionAy", label: "A_y", supportId: "supportA", component: "y", direction: vector(0, 1) },
    { id: "reactionBy", label: "B_y", supportId: "supportB", component: "y", direction: vector(0, 1) },
  ],
};
