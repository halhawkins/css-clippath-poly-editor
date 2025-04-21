import { FC, useState } from "react";
import { IPath, IPathInfo } from "../Slice/ClipPathSlice";
import { Line } from "react-konva";
/**
 * 
 * IPathInfo represents the shape's information, including name, stroke, fill, and points.
 */
interface PolyLineShapeProps {
    line: IPathInfo | undefined; // Points for the shape.
}
const PolyLineShape: FC<PolyLineShapeProps> = (props: PolyLineShapeProps) => {
    const [pointsState, setPointsState] = useState<Array<number>>([]);
    const [fill, setFill] = useState<string | undefined>(props.line?.fill !== undefined? props.line.fill : "black");
    const [stroke, setStroke] = useState<string | undefined>(props.line?.stroke !== undefined? props.line.stroke : "black");

    const translateArray = (pnts: { x: number; y: number; }[]): number[] => {
        return pnts.flatMap(point => [point.x, point.y]);
    };

    if (props.line?.points) {
        setPointsState(translateArray(props.line.points));
    }

    return (
        <>
            <Line points={pointsState} stroke={stroke} fill={fill} />
        </>
    );
};

  
export default PolyLineShape;