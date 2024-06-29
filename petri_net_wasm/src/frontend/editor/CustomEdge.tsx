import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  getSmoothStepPath,
  getStraightPath,
  useStoreApi,
} from "reactflow";
import {
  getIntersectionCirc,
  getIntersectionRect,
} from "./helpers/intersection-calculator";
import DeleteButton from "./DeleteButton";

export default function CustomEdge(props: EdgeProps) {
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const targetType: "place" | "transition" = nodeInternals.get(props.target)!
    .type as "place" | "transition";
  const sourceType: "place" | "transition" = nodeInternals.get(props.source)!
    .type as "place" | "transition";
  const source = nodeInternals.get(props.source)!;
  const target = nodeInternals.get(props.target)!;
  const { x: sourceX, y: sourceY } = source.position;
  const { x: targetX, y: targetY } = target.position;

  let edgePath = "";
  let labelX = sourceX;
  let labelY = sourceY;
  const diffX = targetX - sourceX;
  const diffY = targetY - sourceY;
  const edgeType: "straight" | "step" | "smooth-step" = "straight" as
    | "straight"
    | "step"
    | "smooth-step";

  if (edgeType === "straight") {
    const interP =
      targetType === "transition"
        ? getIntersectionRect(sourceX, sourceY, targetX, targetY, 130, 67)
        : getIntersectionCirc(sourceX, sourceY, targetX, targetY, 66);
    const interS =
      sourceType === "transition"
        ? getIntersectionRect(targetX, targetY, sourceX, sourceY, 125, 67)
        : getIntersectionCirc(targetX, targetY, sourceX, sourceY, 66);
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX: (interS ?? source.position).x,
      sourceY: (interS ?? source.position).y,
      targetX: (interP ?? target.position).x,
      targetY: (interP ?? target.position).y,
    });
  } else {
    const xDominates = Math.abs(diffX) > Math.abs(diffY);

    const correctionTargetX = xDominates
      ? targetType === "place"
        ? -33
        : -66
      : 0;
    const correctionTargetY = xDominates
      ? 0
      : targetType === "place"
        ? -33
        : -33;

    const correctionSourceX = xDominates
      ? sourceType === "place"
        ? -32
        : -64
      : 0;
    const correctionSourceY = xDominates
      ? 0
      : sourceType === "place"
        ? -32
        : -32;
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: source.position.x + (diffX > 0 ? -1 : 1) * correctionSourceX,
      sourceY: source.position.y + (diffY > 0 ? -1 : 1) * correctionSourceY,
      targetX: target.position.x + (diffX > 0 ? 1 : -1) * correctionTargetX,
      targetY: target.position.y + (diffY > 0 ? 1 : -1) * correctionTargetY,
      borderRadius: edgeType === "smooth-step" ? undefined : 0,
      sourcePosition: xDominates
        ? diffX < 0
          ? Position.Left
          : Position.Right
        : diffY < 0
          ? Position.Top
          : Position.Bottom,
      targetPosition: xDominates
        ? diffX >= 0
          ? Position.Left
          : Position.Right
        : diffY >= 0
          ? Position.Top
          : Position.Bottom,
    });
  }

  return (
    <>
      <BaseEdge path={edgePath} {...props} style={{ stroke: "black" }} />;
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            width: "0.75rem",
            height: "0.75rem",
          }}
          className="edge"
        >
          <DeleteButton edgeID={props.id} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
