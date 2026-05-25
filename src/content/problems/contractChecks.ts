import { parseLoadedProblemContent } from "./parsing";
import { validateLocalizedProblemPair } from "./localeValidation";
import { solveProblem } from "../../mechanics/solvers/solverRegistry";

type MutableRecord = Record<string, unknown>;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const expectThrows = (label: string, action: () => void) => {
  try {
    action();
  } catch {
    return;
  }
  throw new Error(`Mechanics contract check did not fail: ${label}.`);
};

const expectNear = (actual: number, expected: number, label: string, tolerance = 1e-6) => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Mechanics contract check ${label} expected ${expected}, received ${actual}.`);
  }
};

const baseProblem = {
  id: "phase-2-contract-check",
  title: "Phase 2 Contract Check",
  topic: "statics.equilibrium",
  problemType: "contract-check",
  solverKey: "simply-supported-beam-reactions",
  diagramKey: "beam-diagram",
  statement: "Internal contract check for planar mechanics schema.",
  coordinateSystem: {
    positiveX: "right",
    positiveY: "up",
    positiveMoment: "counterclockwise",
    angleUnit: "deg",
  },
  parameters: [
    { id: "beamLength", label: "L", value: 4, unit: "m", displayValue: "4 m" },
    { id: "loadMagnitude", label: "F", value: 1000, unit: "N", displayValue: "1 kN" },
    { id: "loadPosition", label: "a", value: 2, unit: "m", displayValue: "2 m" },
    { id: "lambda", label: "\\lambda", value: 0.4, unit: "dimensionless", displayValue: "0.4" },
    { id: "radius", label: "r", value: 0.5, unit: "m", displayValue: "0.5 m" },
  ],
  points: [
    { id: "pointA", label: "A", x: 0, y: 0 },
    { id: "pointB", label: "B", x: 4, y: 0 },
    { id: "pointLoad", label: "F", x: 2, y: 0 },
    { id: "pointPulley", label: "M", x: 2, y: 1 },
    { id: "pointRope", label: "D", x: 1, y: 1 },
  ],
  bodies: [
    {
      id: "beam",
      label: "Beam",
      kind: "rigidBeam",
      startPointId: "pointA",
      endPointId: "pointB",
    },
    {
      id: "pulley",
      label: "Pulley",
      kind: "rigidBody",
      geometry: { kind: "disc", centerPointId: "pointPulley", radiusParameterId: "radius" },
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
      positionPointId: "pointLoad",
      vector: { x: 0, y: -1000 },
      displayMagnitude: "1 kN",
    },
  ],
  quantities: [
    { id: "ropeTension", label: "F_S", unit: "N", role: "unknown" },
  ],
  freeBodyScopes: [
    { id: "wholeSystemScope", label: "Whole system", kind: "wholeSystem" },
    { id: "pulleyScope", label: "Pulley", kind: "body", bodyId: "pulley" },
    { id: "groupScope", label: "Beam and pulley", kind: "bodyGroup", bodyIds: ["beam", "pulley"] },
  ],
  joints: [
    {
      id: "hingeC",
      label: "C",
      kind: "hinge",
      pointId: "pointPulley",
      bodyIds: ["beam", "pulley"],
      quantityIds: ["ropeTension"],
    },
  ],
  ropes: [
    {
      id: "ropeDR",
      label: "Rope",
      kind: "rope",
      pointIds: ["pointRope", "pointPulley"],
      bodyIds: ["beam", "pulley"],
      quantityId: "ropeTension",
    },
  ],
  forceActions: [
    {
      id: "ropeActionLeft",
      label: "F_S",
      kind: "ropeTension",
      ownership: "internal",
      bodyId: "beam",
      pointId: "pointRope",
      quantityId: "ropeTension",
      ropeId: "ropeDR",
      lineOfAction: { kind: "betweenPoints", startPointId: "pointRope", endPointId: "pointPulley" },
      oppositeActionId: "ropeActionRight",
    },
    {
      id: "ropeActionRight",
      label: "F_S",
      kind: "ropeTension",
      ownership: "internal",
      bodyId: "pulley",
      pointId: "pointPulley",
      quantityId: "ropeTension",
      ropeId: "ropeDR",
      lineOfAction: { kind: "betweenPoints", startPointId: "pointPulley", endPointId: "pointRope" },
      oppositeActionId: "ropeActionLeft",
    },
  ],
  unknownReactions: [
    { id: "reactionAx", label: "A_x", supportId: "supportA", component: "x", direction: { x: 1, y: 0 } },
    { id: "reactionAy", label: "A_y", supportId: "supportA", component: "y", direction: { x: 0, y: 1 } },
    { id: "reactionBy", label: "B_y", supportId: "supportB", component: "y", direction: { x: 0, y: 1 } },
  ],
  semanticEquations: [
    {
      id: "sum-force-x",
      purpose: "sumForceX",
      scope: { kind: "body", bodyId: "beam" },
      unit: "N",
      lhs: { terms: [{ id: "force-x-reaction-ax", sign: "+", unit: "N", quantityId: "reactionAx", mechanicsObjectIds: ["reactionAx"] }] },
      rhs: "0",
    },
    {
      id: "sum-moment-a",
      purpose: "sumMoment",
      scope: { kind: "body", bodyId: "beam" },
      momentPointId: "pointA",
      unit: "N*m",
      lhs: {
        terms: [
          {
            id: "moment-a-reaction-by",
            sign: "+",
            unit: "N*m",
            quantityId: "reactionBy",
            factor: "beamLength",
            mechanicsObjectIds: ["reactionBy", "pointB"],
          },
          {
            id: "moment-a-load",
            sign: "-",
            unit: "N*m",
            parameterId: "loadMagnitude",
            factor: "loadPosition",
            mechanicsObjectIds: ["centerLoad", "pointLoad"],
          },
        ],
      },
      rhs: "0",
    },
    {
      id: "sum-force-y",
      purpose: "sumForceY",
      scope: { kind: "body", bodyId: "beam" },
      unit: "N",
      lhs: {
        terms: [
          { id: "force-y-reaction-ay", sign: "+", unit: "N", quantityId: "reactionAy", mechanicsObjectIds: ["reactionAy"] },
          { id: "force-y-reaction-by", sign: "+", unit: "N", quantityId: "reactionBy", mechanicsObjectIds: ["reactionBy"] },
          { id: "force-y-load", sign: "-", unit: "N", parameterId: "loadMagnitude", mechanicsObjectIds: ["centerLoad"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "generic-rope-equilibrium",
      purpose: "sumForceX",
      scope: { kind: "bodyGroup", scopeId: "groupScope", bodyIds: ["beam", "pulley"] },
      unit: "N",
      lhs: {
        terms: [
          {
            id: "force-x-rope",
            sign: "+",
            unit: "N",
            quantityId: "ropeTension",
            mechanicsObjectIds: ["ropeActionLeft"],
          },
        ],
      },
      rhs: "0",
    },
  ],
  solverConfig: {
    beamLengthParameterId: "beamLength",
    loadId: "centerLoad",
    loadMagnitudeParameterId: "loadMagnitude",
    loadPositionParameterId: "loadPosition",
    horizontalReactionId: "reactionAx",
    leftVerticalReactionId: "reactionAy",
    rightVerticalReactionId: "reactionBy",
    equationIds: {
      sumForceX: "sum-force-x",
      sumMomentAboutLeftSupport: "sum-moment-a",
      sumForceY: "sum-force-y",
    },
  },
  explore: {
    observedQuantityIds: ["reactionAy", "ropeTension"],
    notices: [],
  },
};

const baseSolution = {
  eyebrow: "Check",
  title: "Contract check",
  assumptions: [],
  equations: [{ id: "generic-rope-equilibrium", title: "Rope equation", explanation: [] }],
  steps: [
    {
      id: "show-planar-object",
      title: "Show planar object",
      body: [],
      equationIds: ["generic-rope-equilibrium"],
      canvasState: { visibleObjects: ["ropeActionLeft"] },
    },
  ],
};

const baseDiagram = {
  diagramKey: "beam-diagram",
  stageLabels: {
    default: "Mechanics canvas",
    solution: "Explanation canvas",
  },
  config: {
    beam: { bodyId: "beam", startPointId: "pointA", endPointId: "pointB" },
    supports: [
      { supportId: "supportA", pointId: "pointA" },
      { supportId: "supportB", pointId: "pointB" },
    ],
    loadArrows: [],
    freeBodyReactions: [],
    overlayArrows: [],
    polylineMarkers: [],
    angleMarkers: [],
    pointLabels: [],
    dimensions: [],
    bounds: { startPointId: "pointA", endPointId: "pointB" },
  },
};

const basePractice = {
  title: "Practice",
  body: "Contract check",
  steps: [],
};

const parseCheck = (problem: unknown) =>
  parseLoadedProblemContent(problem, baseSolution, baseDiagram, basePractice);

export const runPhase2MechanicsContractChecks = () => {
  const parsed = parseCheck(baseProblem);

  const missingBody = clone(baseProblem);
  (missingBody.forceActions as MutableRecord[])[0]!.bodyId = "missingBody";
  expectThrows("missing force action body id", () => parseCheck(missingBody));

  const missingScopeBody = clone(baseProblem);
  (missingScopeBody.freeBodyScopes as MutableRecord[])[2]!.bodyIds = ["beam", "missingBody"];
  expectThrows("missing free-body scope body id", () => parseCheck(missingScopeBody));

  const missingQuantity = clone(baseProblem);
  (missingQuantity.semanticEquations as MutableRecord[])[3]!.lhs = {
    terms: [
      {
        id: "missing-quantity-term",
        sign: "+",
        unit: "N",
        quantityId: "missingQuantity",
        mechanicsObjectIds: ["ropeActionLeft"],
      },
    ],
  };
  expectThrows("missing semantic quantity id", () => parseCheck(missingQuantity));

  const invalidOppositeAction = clone(baseProblem);
  (invalidOppositeAction.forceActions as MutableRecord[])[0]!.oppositeActionId = "missingAction";
  expectThrows("missing opposite force action id", () => parseCheck(invalidOppositeAction));

  const missingCanvasObject = clone(baseSolution);
  (missingCanvasObject.steps as MutableRecord[])[0]!.canvasState = { visibleObjects: ["missingPlanarObject"] };
  expectThrows("missing planar canvas object id", () =>
    parseLoadedProblemContent(baseProblem, missingCanvasObject, baseDiagram, basePractice),
  );

  const mismatchedLocale = clone(baseProblem);
  (mismatchedLocale.quantities as MutableRecord[])[0]!.unit = "N*m";
  expectThrows("localized planar mechanics mismatch", () =>
    validateLocalizedProblemPair(parsed, parseCheck(mismatchedLocale)),
  );
};

const planarFixtureDiagram = {
  diagramKey: "beam-diagram",
  stageLabels: {
    default: "Mechanics canvas",
    solution: "Explanation canvas",
  },
  config: {
    beam: { bodyId: "fixtureBeam", startPointId: "fixtureBeamStart", endPointId: "fixtureBeamEnd" },
    supports: [],
    loadArrows: [],
    freeBodyReactions: [],
    overlayArrows: [],
    polylineMarkers: [],
    angleMarkers: [],
    pointLabels: [],
    dimensions: [],
    bounds: { startPointId: "fixtureBeamStart", endPointId: "fixtureBeamEnd" },
  },
};

const planarFixturePractice = {
  title: "Practice",
  body: "Contract check",
  steps: [],
};

const parsePlanarFixture = (problem: unknown, equationId: string) =>
  parseLoadedProblemContent(
    problem,
    {
      eyebrow: "Check",
      title: "Planar solver check",
      assumptions: [],
      equations: [{ id: equationId, title: "Equation", explanation: [] }],
      steps: [{ id: "show-equation", title: "Show equation", body: [], equationIds: [equationId] }],
    },
    planarFixtureDiagram,
    planarFixturePractice,
  );

const ladderProblem = {
  id: "phase-3-ladder-solver-check",
  title: "Phase 3 Ladder Solver Check",
  topic: "statics.equilibrium",
  problemType: "contract-check",
  solverKey: "planar-equilibrium",
  diagramKey: "beam-diagram",
  statement: "Internal contract check for the articulated ladder planar equilibrium system.",
  parameters: [
    { id: "a", label: "a", value: 1.5, unit: "m", displayValue: "1.5 m" },
    { id: "h", label: "h", value: 3, unit: "m", displayValue: "3 m" },
    { id: "lambda", label: "\\lambda", value: 0.4, unit: "dimensionless", displayValue: "0.4" },
    { id: "loadMagnitude", label: "F_L", value: 1000, unit: "N", displayValue: "1000 N" },
  ],
  points: [
    { id: "fixtureBeamStart", label: "S", x: 0, y: -1 },
    { id: "fixtureBeamEnd", label: "T", x: 1, y: -1 },
    { id: "pointA", label: "A", x: -1.5, y: 0 },
    { id: "pointB", label: "B", x: 1.5, y: 0 },
    { id: "pointC", label: "C", x: 0, y: 3 },
    { id: "pointD", label: "D", x: -1, y: 1 },
    { id: "pointE", label: "E", x: 1, y: 1 },
    { id: "loadPoint", label: "F_L", x: 0.6, y: 1.5 },
  ],
  bodies: [
    { id: "fixtureBeam", label: "Fixture beam", kind: "rigidBeam", startPointId: "fixtureBeamStart", endPointId: "fixtureBeamEnd" },
    { id: "leftLadderHalf", label: "Left ladder half", kind: "rigidBody", geometry: { kind: "lineSegment", startPointId: "pointA", endPointId: "pointC" } },
    { id: "rightLadderHalf", label: "Right ladder half", kind: "rigidBody", geometry: { kind: "lineSegment", startPointId: "pointC", endPointId: "pointB" } },
  ],
  supports: [
    { id: "supportA", label: "A", kind: "pin", pointId: "pointA", bodyId: "leftLadderHalf" },
    { id: "supportB", label: "B", kind: "roller", pointId: "pointB", bodyId: "rightLadderHalf" },
  ],
  loads: [
    {
      id: "ladderLoad",
      label: "F_L",
      kind: "pointForce",
      bodyId: "rightLadderHalf",
      positionPointId: "loadPoint",
      vector: { x: 0, y: -1000 },
      displayMagnitude: "1000 N",
    },
  ],
  quantities: [
    { id: "hingeCx", label: "F_Cx", unit: "N", role: "unknown" },
    { id: "hingeCy", label: "F_Cy", unit: "N", role: "unknown" },
    { id: "ropeTension", label: "F_S", unit: "N", role: "unknown" },
  ],
  freeBodyScopes: [
    { id: "wholeLadderScope", label: "Whole ladder", kind: "bodyGroup", bodyIds: ["leftLadderHalf", "rightLadderHalf"] },
    { id: "leftHalfScope", label: "Left half", kind: "body", bodyId: "leftLadderHalf" },
    { id: "rightHalfScope", label: "Right half", kind: "body", bodyId: "rightLadderHalf" },
  ],
  joints: [
    { id: "hingeC", label: "C", kind: "hinge", pointId: "pointC", bodyIds: ["leftLadderHalf", "rightLadderHalf"], quantityIds: ["hingeCx", "hingeCy"] },
  ],
  ropes: [
    { id: "ropeDE", label: "DE", kind: "rope", pointIds: ["pointD", "pointE"], bodyIds: ["leftLadderHalf", "rightLadderHalf"], quantityId: "ropeTension" },
  ],
  forceActions: [],
  unknownReactions: [
    { id: "reactionAx", label: "F_Ax", supportId: "supportA", component: "x", direction: { x: 1, y: 0 } },
    { id: "reactionAy", label: "F_Ay", supportId: "supportA", component: "y", direction: { x: 0, y: 1 } },
    { id: "reactionB", label: "F_B", supportId: "supportB", component: "y", direction: { x: 0, y: 1 } },
  ],
  semanticEquations: [
    {
      id: "ladder-left-sum-fx",
      purpose: "sumForceX",
      scope: { kind: "body", bodyId: "leftLadderHalf", scopeId: "leftHalfScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "left-fx-ax", sign: "+", unit: "N", quantityId: "reactionAx", mechanicsObjectIds: ["reactionAx"] },
          { id: "left-fx-rope", sign: "+", unit: "N", quantityId: "ropeTension", mechanicsObjectIds: ["ropeTension"] },
          { id: "left-fx-hinge", sign: "-", unit: "N", quantityId: "hingeCx", mechanicsObjectIds: ["hingeCx"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "ladder-left-sum-fy",
      purpose: "sumForceY",
      scope: { kind: "body", bodyId: "leftLadderHalf", scopeId: "leftHalfScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "left-fy-ay", sign: "+", unit: "N", quantityId: "reactionAy", mechanicsObjectIds: ["reactionAy"] },
          { id: "left-fy-hinge", sign: "-", unit: "N", quantityId: "hingeCy", mechanicsObjectIds: ["hingeCy"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "ladder-left-moment-c",
      purpose: "sumMoment",
      scope: { kind: "body", bodyId: "leftLadderHalf", scopeId: "leftHalfScope" },
      momentPointId: "pointC",
      unit: "N*m",
      lhs: {
        terms: [
          { id: "left-moment-ax", sign: "+", unit: "N*m", quantityId: "reactionAx", factor: "h", mechanicsObjectIds: ["reactionAx", "pointA"] },
          { id: "left-moment-ay", sign: "-", unit: "N*m", quantityId: "reactionAy", factor: "a", mechanicsObjectIds: ["reactionAy", "pointA"] },
          { id: "left-moment-rope", sign: "+", unit: "N*m", quantityId: "ropeTension", factor: "2*h/3", mechanicsObjectIds: ["ropeTension", "pointD"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "ladder-right-sum-fx",
      purpose: "sumForceX",
      scope: { kind: "body", bodyId: "rightLadderHalf", scopeId: "rightHalfScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "right-fx-hinge", sign: "+", unit: "N", quantityId: "hingeCx", mechanicsObjectIds: ["hingeCx"] },
          { id: "right-fx-rope", sign: "-", unit: "N", quantityId: "ropeTension", mechanicsObjectIds: ["ropeTension"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "ladder-right-sum-fy",
      purpose: "sumForceY",
      scope: { kind: "body", bodyId: "rightLadderHalf", scopeId: "rightHalfScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "right-fy-b", sign: "+", unit: "N", quantityId: "reactionB", mechanicsObjectIds: ["reactionB"] },
          { id: "right-fy-hinge", sign: "+", unit: "N", quantityId: "hingeCy", mechanicsObjectIds: ["hingeCy"] },
          { id: "right-fy-load", sign: "-", unit: "N", parameterId: "loadMagnitude", mechanicsObjectIds: ["ladderLoad"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "ladder-right-moment-c",
      purpose: "sumMoment",
      scope: { kind: "body", bodyId: "rightLadderHalf", scopeId: "rightHalfScope" },
      momentPointId: "pointC",
      unit: "N*m",
      lhs: {
        terms: [
          { id: "right-moment-b", sign: "+", unit: "N*m", quantityId: "reactionB", factor: "a", mechanicsObjectIds: ["reactionB", "pointB"] },
          { id: "right-moment-load", sign: "-", unit: "N*m", parameterId: "loadMagnitude", factor: "lambda*a", mechanicsObjectIds: ["ladderLoad", "loadPoint"] },
          { id: "right-moment-rope", sign: "-", unit: "N*m", quantityId: "ropeTension", factor: "2*h/3", mechanicsObjectIds: ["ropeTension", "pointE"] },
        ],
      },
      rhs: "0",
    },
  ],
  solverConfig: {
    equationIds: [
      "ladder-left-sum-fx",
      "ladder-left-sum-fy",
      "ladder-left-moment-c",
      "ladder-right-sum-fx",
      "ladder-right-sum-fy",
      "ladder-right-moment-c",
    ],
    unknownQuantityIds: ["reactionAx", "reactionAy", "reactionB", "hingeCx", "hingeCy", "ropeTension"],
    scopeIds: ["leftHalfScope", "rightHalfScope"],
    checkEquationIds: [],
    resultQuantityIds: ["reactionAx", "reactionAy", "reactionB", "ropeTension"],
  },
  explore: { notices: [], observedQuantityIds: ["reactionAy", "reactionB", "ropeTension"] },
};

const beltProblem = {
  id: "phase-3-belt-solver-check",
  title: "Phase 3 Belt Solver Check",
  topic: "statics.equilibrium",
  problemType: "contract-check",
  solverKey: "planar-equilibrium",
  diagramKey: "beam-diagram",
  statement: "Internal contract check for the belt tensioner planar equilibrium system.",
  parameters: [
    { id: "beltForceA", label: "F_A", value: 500, unit: "N", displayValue: "500 N" },
    { id: "alpha", label: "\\alpha", value: 45, unit: "deg", displayValue: "45 deg" },
    { id: "beta", label: "\\beta", value: 60, unit: "deg", displayValue: "60 deg" },
    { id: "radius", label: "r", value: 0.4, unit: "m", displayValue: "0.4 m" },
  ],
  points: [
    { id: "fixtureBeamStart", label: "S", x: 0, y: -1 },
    { id: "fixtureBeamEnd", label: "T", x: 1, y: -1 },
    { id: "pointM", label: "M", x: 0, y: 0 },
    { id: "contactA", label: "A", x: -0.2, y: 0.3 },
    { id: "contactB", label: "B", x: 0.4, y: 0 },
  ],
  bodies: [
    { id: "fixtureBeam", label: "Fixture beam", kind: "rigidBeam", startPointId: "fixtureBeamStart", endPointId: "fixtureBeamEnd" },
    { id: "idlerPulley", label: "Idler pulley", kind: "rigidBody", geometry: { kind: "disc", centerPointId: "pointM", radiusParameterId: "radius" } },
  ],
  supports: [],
  loads: [],
  quantities: [
    { id: "beltForceB", label: "F_B", unit: "N", role: "unknown" },
    { id: "rodForce", label: "F_S", unit: "N", role: "unknown" },
    { id: "weightForce", label: "F_G", unit: "N", role: "unknown" },
  ],
  freeBodyScopes: [
    { id: "pulleyScope", label: "Pulley", kind: "body", bodyId: "idlerPulley" },
  ],
  joints: [],
  ropes: [],
  forceActions: [],
  unknownReactions: [],
  semanticEquations: [
    {
      id: "belt-sum-fx",
      purpose: "sumForceX",
      scope: { kind: "body", bodyId: "idlerPulley", scopeId: "pulleyScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "fx-b", sign: "+", unit: "N", quantityId: "beltForceB", mechanicsObjectIds: ["beltForceB"] },
          { id: "fx-a", sign: "-", unit: "N", parameterId: "beltForceA", factor: "cos(alpha)", mechanicsObjectIds: ["contactA"] },
          { id: "fx-s", sign: "-", unit: "N", quantityId: "rodForce", factor: "sin(beta)", mechanicsObjectIds: ["rodForce"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "belt-sum-fy",
      purpose: "sumForceY",
      scope: { kind: "body", bodyId: "idlerPulley", scopeId: "pulleyScope" },
      unit: "N",
      lhs: {
        terms: [
          { id: "fy-a", sign: "+", unit: "N", parameterId: "beltForceA", factor: "sin(alpha)", mechanicsObjectIds: ["contactA"] },
          { id: "fy-g", sign: "-", unit: "N", quantityId: "weightForce", mechanicsObjectIds: ["weightForce"] },
          { id: "fy-s", sign: "+", unit: "N", quantityId: "rodForce", factor: "cos(beta)", mechanicsObjectIds: ["rodForce"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "belt-moment-m",
      purpose: "sumMoment",
      scope: { kind: "body", bodyId: "idlerPulley", scopeId: "pulleyScope" },
      momentPointId: "pointM",
      unit: "N*m",
      lhs: {
        terms: [
          { id: "moment-a", sign: "-", unit: "N*m", parameterId: "beltForceA", factor: "radius", mechanicsObjectIds: ["contactA"] },
          { id: "moment-b", sign: "+", unit: "N*m", quantityId: "beltForceB", factor: "radius", mechanicsObjectIds: ["beltForceB", "contactB"] },
        ],
      },
      rhs: "0",
    },
    {
      id: "belt-derived-weight",
      purpose: "derivedResult",
      scope: { kind: "body", bodyId: "idlerPulley", scopeId: "pulleyScope" },
      unit: "N",
      lhs: "weightForce",
      rhs: "beltForceA*((1-cos(alpha))*cos(beta)/sin(beta)+sin(alpha))",
    },
  ],
  solverConfig: {
    equationIds: ["belt-sum-fx", "belt-sum-fy", "belt-moment-m"],
    unknownQuantityIds: ["beltForceB", "rodForce", "weightForce"],
    scopeIds: ["pulleyScope"],
    checkEquationIds: ["belt-derived-weight"],
    resultQuantityIds: ["beltForceB", "rodForce", "weightForce"],
  },
  explore: { notices: [], observedQuantityIds: ["beltForceB", "rodForce", "weightForce"] },
};

const getQuantityValue = (problem: ReturnType<typeof parsePlanarFixture>, quantityId: string): number => {
  const value = solveProblem(problem.problem).quantities.find((quantity) => quantity.id === quantityId)?.value;
  if (value === undefined) {
    throw new Error(`Mechanics contract check missing solved quantity "${quantityId}".`);
  }
  return value;
};

export const runPhase3SolverContractChecks = () => {
  const ladder = parsePlanarFixture(ladderProblem, "ladder-left-sum-fx");
  expectNear(getQuantityValue(ladder, "reactionAx"), 0, "ladder F_Ax");
  expectNear(getQuantityValue(ladder, "reactionAy"), 300, "ladder F_Ay");
  expectNear(getQuantityValue(ladder, "reactionB"), 700, "ladder F_B");
  expectNear(getQuantityValue(ladder, "ropeTension"), 225, "ladder F_S");

  const belt = parsePlanarFixture(beltProblem, "belt-sum-fx");
  expectNear(getQuantityValue(belt, "beltForceB"), 500, "belt F_B");
  expectNear(getQuantityValue(belt, "rodForce"), 169.101978725762, "belt F_S");
  expectNear(getQuantityValue(belt, "weightForce"), 438.104379956155, "belt F_G");

  const missingEquation = clone(beltProblem);
  (missingEquation.solverConfig as MutableRecord).equationIds = ["missing-equation", "belt-sum-fy", "belt-moment-m"];
  expectThrows("missing planar solver equation id", () => parsePlanarFixture(missingEquation, "belt-sum-fx"));

  const duplicateUnknown = clone(beltProblem);
  (duplicateUnknown.solverConfig as MutableRecord).unknownQuantityIds = ["beltForceB", "beltForceB", "weightForce"];
  expectThrows("duplicate planar unknown id", () => parsePlanarFixture(duplicateUnknown, "belt-sum-fx"));

  const knownAsUnknown = clone(beltProblem);
  (knownAsUnknown.quantities as MutableRecord[])[0]!.role = "known";
  (knownAsUnknown.quantities as MutableRecord[])[0]!.value = 500;
  expectThrows("known planar quantity used as unknown", () => parsePlanarFixture(knownAsUnknown, "belt-sum-fx"));

  const countMismatch = clone(beltProblem);
  (countMismatch.solverConfig as MutableRecord).unknownQuantityIds = ["beltForceB", "rodForce"];
  expectThrows("planar equation and unknown count mismatch", () => parsePlanarFixture(countMismatch, "belt-sum-fx"));

  const missingScopeId = clone(beltProblem);
  ((missingScopeId.semanticEquations as MutableRecord[])[0]!.scope as MutableRecord).scopeId = undefined;
  expectThrows("planar solve equation missing scope id", () => parsePlanarFixture(missingScopeId, "belt-sum-fx"));

  const forceEquationWrongUnit = clone(beltProblem);
  (forceEquationWrongUnit.semanticEquations as MutableRecord[])[0]!.unit = "N*m";
  (((forceEquationWrongUnit.semanticEquations as MutableRecord[])[0]!.lhs as MutableRecord).terms as MutableRecord[])
    .forEach((term) => {
      term.unit = "N*m";
    });
  expectThrows("planar force equation unit mismatch", () => parsePlanarFixture(forceEquationWrongUnit, "belt-sum-fx"));

  const momentEquationWrongUnit = clone(beltProblem);
  (momentEquationWrongUnit.semanticEquations as MutableRecord[])[2]!.unit = "N";
  (((momentEquationWrongUnit.semanticEquations as MutableRecord[])[2]!.lhs as MutableRecord).terms as MutableRecord[])
    .forEach((term) => {
      term.unit = "N";
    });
  expectThrows("planar moment equation unit mismatch", () => parsePlanarFixture(momentEquationWrongUnit, "belt-sum-fx"));

  const nonlinear = clone(beltProblem);
  (nonlinear.semanticEquations as MutableRecord[])[0]!.lhs = { expression: "beltForceB*rodForce" };
  expectThrows("nonlinear planar solve equation", () => parsePlanarFixture(nonlinear, "belt-sum-fx"));

  const singular = clone(beltProblem);
  (singular.semanticEquations as MutableRecord[])[1]!.lhs = { terms: [] };
  expectThrows("singular planar solver system", () => parsePlanarFixture(singular, "belt-sum-fx"));

  const derivedAsSolve = clone(beltProblem);
  (derivedAsSolve.solverConfig as MutableRecord).equationIds = ["belt-derived-weight", "belt-sum-fy", "belt-moment-m"];
  expectThrows("derived result used as planar solve equation", () => parsePlanarFixture(derivedAsSolve, "belt-sum-fx"));

  const wrongDerivedCheck = clone(beltProblem);
  (wrongDerivedCheck.semanticEquations as MutableRecord[])[3]!.rhs = "0";
  const parsedWrongDerived = parsePlanarFixture(wrongDerivedCheck, "belt-sum-fx");
  expectThrows("planar solver residual check mismatch", () => solveProblem(parsedWrongDerived.problem));
};

export const runMechanicsContractChecks = () => {
  runPhase2MechanicsContractChecks();
  runPhase3SolverContractChecks();
};
