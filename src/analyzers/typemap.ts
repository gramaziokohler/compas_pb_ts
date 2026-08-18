import * as DATASTRUCTURES from "../datastructures";
import * as GEOMETRY from "../geometry";
import * as MESSAGES from "../messages";
import { type Constructor, registerTypes } from "../registry";

export type { Constructor };

/**
 * The COMPAS types compas_pb itself owns. Third-party packages add their own through
 * `registerType`; nothing here is special beyond being registered at import time.
 */
export const BUILTIN_TYPES: Map<string, Constructor> = new Map<
  string,
  Constructor
>([
  ["compas_pb.data.ArcData", GEOMETRY.Arc],
  ["compas_pb.data.BezierData", GEOMETRY.Bezier],
  ["compas_pb.data.BoxData", GEOMETRY.Box],
  ["compas_pb.data.CapsuleData", GEOMETRY.Capsule],
  ["compas_pb.data.CircleData", GEOMETRY.Circle],
  ["compas_pb.data.ConeData", GEOMETRY.Cone],
  ["compas_pb.data.CylinderData", GEOMETRY.Cylinder],
  ["compas_pb.data.EllipseData", GEOMETRY.Ellipse],
  ["compas_pb.data.FrameData", GEOMETRY.Frame],
  ["compas_pb.data.HyperbolaData", GEOMETRY.Hyperbola],
  ["compas_pb.data.LineData", GEOMETRY.Line],
  ["compas_pb.data.ParabolaData", GEOMETRY.Parabola],
  ["compas_pb.data.PlaneData", GEOMETRY.Plane],
  ["compas_pb.data.PointData", GEOMETRY.Point],
  ["compas_pb.data.PointcloudData", GEOMETRY.Pointcloud],
  ["compas_pb.data.PolygonData", GEOMETRY.Polygon],
  ["compas_pb.data.PolylineData", GEOMETRY.Polyline],
  ["compas_pb.data.ProjectionData", GEOMETRY.Projection],
  ["compas_pb.data.QuaternionData", GEOMETRY.Quaternion],
  ["compas_pb.data.ReflectionData", GEOMETRY.Reflection],
  ["compas_pb.data.RotationData", GEOMETRY.Rotation],
  ["compas_pb.data.ScaleData", GEOMETRY.Scale],
  ["compas_pb.data.ShearData", GEOMETRY.Shear],
  ["compas_pb.data.SphereData", GEOMETRY.Sphere],
  ["compas_pb.data.TorusData", GEOMETRY.Torus],
  ["compas_pb.data.TransformationData", GEOMETRY.Transformation],
  ["compas_pb.data.TranslationData", GEOMETRY.Translation],
  ["compas_pb.data.VectorData", GEOMETRY.Vector],
  ["compas_pb.data.MeshData", DATASTRUCTURES.Mesh],
  ["compas_pb.data.PolyhedronData", DATASTRUCTURES.Polyhedron],
  ["compas_pb.data.GraphData", DATASTRUCTURES.Graph],
  ["compas_pb.data.DictData", MESSAGES.Dictionary],
  ["compas_pb.data.ListData", MESSAGES.List],
]);

// Seed the registry at import time; the analyzers import this module for that side effect.
registerTypes(BUILTIN_TYPES);
