import { FC, useEffect, useRef, useState } from "react";
import { IPath } from "../Slice/ClipPathSlice";
import { Line } from "react-konva";
import { useSelector } from "react-redux";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

interface IPolygonShapeProps {
    points: IPath;
    index: number;
    fill?: string;
    stroke?: string;
    opacity?: number;
}

const PolygonShape: FC<IPolygonShapeProps> = ({ points, fill = "black", stroke = "black", index}) => {
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
        target.zIndex(index + 1); // Bring the clicked shape to the front
        console.log("Polygon clicked", index);
    };

    useEffect(() => {
        setShapeOpacity(opacity);  // Update the shape opacity when the opacity state changes
    }, [opacity])

    return (
        <Line
            onClick={handleClick}
            points={translateArray(points)}
            fill={fill}
            ref={polyRef}
            closed={true}
            opacity={shapeOpacity}
        />
    );
};

export default PolygonShape;
