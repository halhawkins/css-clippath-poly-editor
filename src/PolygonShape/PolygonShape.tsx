import { FC, useEffect, useRef, useState } from "react";
import { IPath, setZIndex } from "../Slice/ClipPathSlice";
import { Line } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

interface IPolygonShapeProps {
    points: IPath;
    index: number;
    fill?: string;
    stroke?: string;
    opacity?: number;
    zIndex?: number; // Added for sorting shapes based on zIndex in the canvas
}

const PolygonShape: FC<IPolygonShapeProps> = ({ points, fill = "black", stroke = "black", index, zIndex = 0}) => {
    const dispatch = useDispatch()
    const polyRef = useRef<Konva.Line>(null);
    const opacity = useSelector((state: any) => state.backdropSlice.opacity);
    const [shapeOpacity, setShapeOpacity] = useState(opacity)

    // Function to convert the points from an array of objects to a flat array
    const translateArray = (pnts: IPath): number[] => {
        return pnts.points.flatMap(point => [point.x, point.y]);
    };

    if (points.points.length < 3) {
        console.error("PolygonShape needs at least 3 points.");
        return null;
    }

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        const target = e.target;
        const index = target.zIndex();   
        target.zIndex(index + 1); // Bring the clicked shape to the front
        console.log("Polygon clicked", index);
        dispatch(setZIndex({index:index, zIndex:target.zIndex() + 1})); // Update the zIndex of the clicked shape))
    };

    useEffect(() => {
        setShapeOpacity(opacity);  // Update the shape opacity when the opacity state changes
        polyRef.current?.zIndex(zIndex+1); // Update the zIndex of the polygon shape in the canvas
    }, [opacity, zIndex])

    return (
        <Line
            onClick={handleClick}
            points={translateArray(points)}
            fill={fill}
            ref={polyRef}
            // stroke={stroke}
            zIndex={zIndex}
            closed={true}
            opacity={shapeOpacity}
            // opacity={opacity}  // Uncomment if opacity is needed
        />
    );
};

export default PolygonShape;
