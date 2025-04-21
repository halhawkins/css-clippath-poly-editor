// import { FC, useState, useRef, useEffect, MouseEvent, JSX } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { moveBackdrop, setWidth, setHeight, setRotation } from "../Slice/BackdropSlice";
// import "./SizingBox.css";
// import { RootState } from "../../store";

// interface SizingBoxProps {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     rotation: number;
//     children?: JSX.Element[];
// }

// const SizingBox: FC<SizingBoxProps> = ({ x, y, width, height, rotation, children }: SizingBoxProps) => {
//     const [position, setPosition] = useState({ x, y });
//     const [size, setSize] = useState({ width, height });
//     const [rotationAngle, setRotationAngle] = useState(rotation);
//     const sizingFrameRef = useRef<HTMLDivElement>(null);
//     const mousePosition = useSelector((state: RootState) => state.clippathSlice.mouseLocation);
//     const dispatch = useDispatch();

//     // Refs for dragging
//     const draggingRef = useRef(false);
//     const offsetRef = useRef({ x: 0, y: 0 });

//     // Refs for resizing
//     const resizingRef = useRef(false);
//     const resizingStartRef = useRef({
//         startX: 0,
//         startY: 0,
//         initX: 0,
//         initY: 0,
//         initWidth: 0,
//         initHeight: 0,
//     });

    
//     // Refs for rotation
//     const rotatingRef = useRef(false);
//     const rotatingStartRef = useRef({
//         startX: 0,
//         startY: 0,
//         centerX: 0,
//         centerY: 0,
//         initialAngle: 0, // initial angle between center and mouse pointer (in degrees)
//         startRotation: rotation,
//     });

//     const handleMouseDown = (e: MouseEvent) => {
//         const targetClass = (e.target as HTMLElement).classList;
//         if (
//             targetClass.contains("nw-sizing") ||
//             targetClass.contains("ne-sizing") ||
//             targetClass.contains("sw-sizing") ||
//             targetClass.contains("se-sizing") ||
//             targetClass.contains("top-size") ||
//             targetClass.contains("bottom-size") ||
//             targetClass.contains("left-size") ||
//             targetClass.contains("right-size") ||
//             targetClass.contains("nw-rotate") ||
//             targetClass.contains("ne-rotate") ||
//             targetClass.contains("sw-rotate") ||
//             targetClass.contains("se-rotate")
//           )
//             return;
      
//         draggingRef.current = !draggingRef.current;
//         offsetRef.current.x = e.clientX - position.x;
//         offsetRef.current.y = e.clientY - position.y;
//     };
//     const handleRotationMouseDown = (e: MouseEvent) => {};
//     const handleResizeMouseDown = (direction: string) => (e: MouseEvent) => {
//         resizingRef.current = true;
//         resizingStartRef.current.startX = e.clientX;
//         resizingStartRef.current.startY = e.clientY;
//         resizingStartRef.current.initX = position.x;
//         resizingStartRef.current.initY = position.y;
//         resizingStartRef.current.initWidth = size.width;
//         resizingStartRef.current.initHeight = size.height;


//     };
//     const handleMouseMove = (e: MouseEvent) => {
//         if (draggingRef.current) {
//             setPosition({
//                 x: e.clientX - offsetRef.current.x,
//                 y: e.clientY - offsetRef.current.y,
//             });
//         }
//     };

//     const handleMouseDrag = (e: MouseEvent) => {
//         // console.log("Dragging", e);
//         if (draggingRef.current) {  
//             setPosition({
//                 x: mousePosition.x - offsetRef.current.x,
//                 y: mousePosition    .y    - offsetRef.current.y,
//             });
//         }
//     }
//     const handleMouseUp = (e: MouseEvent) => {
//         draggingRef.current = false;
//     }

//     return (
//         <div
//             ref={sizingFrameRef}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             onDrag={handleMouseDrag}
//             style={{
//                 position: "absolute",
//                 top: `${position.y}px`,
//                 left: `${position.x}px`,
//                 width: `${size.width}px`,
//                 height: `${size.height}px`,
//                 transform: `rotate(${rotationAngle}deg)`,
//                 cursor: "move",
//             }}
//             className="sizing-frame"
//         >
//         {/* Rotation handles */}
//         <div className="nw-rotate" onMouseDown={handleRotationMouseDown}></div>
//         <div className="sw-rotate" onMouseDown={handleRotationMouseDown}></div>
//         <div className="ne-rotate" onMouseDown={handleRotationMouseDown}></div>
//         <div className="se-rotate" onMouseDown={handleRotationMouseDown}></div>
//         {/* Sizing handles */}
//         <div className="nw-sizing" onMouseDown={handleResizeMouseDown("nw")}></div>
//         <div className="ne-sizing" onMouseDown={handleResizeMouseDown("ne")}></div>
//         <div className="sw-sizing" onMouseDown={handleResizeMouseDown("sw")}></div>
//         <div className="se-sizing" onMouseDown={handleResizeMouseDown("se")}></div>
//         <div className="top-size" onMouseDown={handleResizeMouseDown("top")}></div>
//         <div className="bottom-size" onMouseDown={handleResizeMouseDown("bottom")}></div>
//         <div className="left-size" onMouseDown={handleResizeMouseDown("left")}></div>
//         <div className="right-size" onMouseDown={handleResizeMouseDown("right")}></div>
//         {children}
//     </div>
//   );

// }

// export default SizingBox;
import { FC, useRef, useEffect, useState } from "react";
import "./SizingBox.css";
import { useDispatch, useSelector } from "react-redux";
import { moveBackdrop, setHeight, setWidth, setRotation } from "../Slice/BackdropSlice";
import { RootState } from "../../store";
import cwRotate from "../assets/cw-rotate.png";

interface SizingBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  children?: React.ReactNode;
}

const SizingBox: FC<SizingBoxProps> = ({ x, y, width, height, rotation, children }) => {
  // Local state for position, size, and rotation
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [rotationAngle, setRotationAngle] = useState(rotation);
  const sizingFrameRef = useRef<HTMLDivElement>(null);
  const formattingNow = useSelector((state: RootState) => state.backdropSlice.formatting);

  // Refs for dragging
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Refs for resizing
  const resizingRef = useRef(false);
  const resizingStartRef = useRef({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    initWidth: 0,
    initHeight: 0,
  });

  // Refs for rotation
  const rotatingRef = useRef(false);
  const rotatingStartRef = useRef({
    startX: 0,
    startY: 0,
    centerX: 0,
    centerY: 0,
    initialAngle: 0, // initial angle between center and mouse pointer (in degrees)
    startRotation: rotation,
  });

  const dispatch = useDispatch();

  // Global dragging event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;
        setPosition({ x: newX, y: newY });
        dispatch(moveBackdrop({ x: newX, y: newY }));
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      rotatingRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dispatch]);

  // Prevent dragging if a sizing or rotation handle is clicked.
  //**********************
  // **************** */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("MouseDown", e);  
    const targetClass = (e.target as HTMLElement).classList;
    if (
      targetClass.contains("nw-sizing") ||
      targetClass.contains("ne-sizing") ||
      targetClass.contains("sw-sizing") ||
      targetClass.contains("se-sizing") ||
      targetClass.contains("top-size") ||
      targetClass.contains("bottom-size") ||
      targetClass.contains("left-size") ||
      targetClass.contains("right-size") ||
      targetClass.contains("nw-rotate") ||
      targetClass.contains("ne-rotate") ||
      targetClass.contains("sw-rotate") ||
      targetClass.contains("se-rotate")
    )
      return;

    draggingRef.current = true;
    const rect = sizingFrameRef.current?.getBoundingClientRect();
    // if (rect) {
    //   offsetRef.current = {
    //     x: e.clientX - rect.left,
    //     y: e.clientY - rect.top,
    //   };
    // }
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
      console.log("MouseMove", e);
        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;
        setPosition({ x: newX, y: newY });
        dispatch(moveBackdrop({ x: newX, y: newY }));
      }
    }
    const handleMouseUp = () => {
      console.log("MouseUp");
      draggingRef.current = false;
      resizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  /******************
   * *********************** */

  // Generalized resize handler for sizing (existing functionality)
  const handleResizeMouseDown = (direction: string) => (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    resizingRef.current = true;
    // Record initial state when resizing starts
    resizingStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
      initWidth: size.width,
      initHeight: size.height,
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaX = e.clientX - resizingStartRef.current.startX;
      const deltaY = e.clientY - resizingStartRef.current.startY;
      let newX = resizingStartRef.current.initX;
      let newY = resizingStartRef.current.initY;
      let newWidth = resizingStartRef.current.initWidth;
      let newHeight = resizingStartRef.current.initHeight;
      const minSize = 20;

      switch (direction) {
        case "nw":
          newX = resizingStartRef.current.initX + deltaX;
          newY = resizingStartRef.current.initY + deltaY;
          newWidth = resizingStartRef.current.initWidth - deltaX;
          newHeight = resizingStartRef.current.initHeight - deltaY;
          if (newWidth < minSize) {
            newWidth = minSize;
            newX =
              resizingStartRef.current.initX +
              (resizingStartRef.current.initWidth - minSize);
          }
          if (newHeight < minSize) {
            newHeight = minSize;
            newY =
              resizingStartRef.current.initY +
              (resizingStartRef.current.initHeight - minSize);
          }
          break;
        case "ne":
          newY = resizingStartRef.current.initY + deltaY;
          newWidth = resizingStartRef.current.initWidth + deltaX;
          newHeight = resizingStartRef.current.initHeight - deltaY;
          if (newWidth < minSize) newWidth = minSize;
          if (newHeight < minSize) {
            newHeight = minSize;
            newY =
              resizingStartRef.current.initY +
              (resizingStartRef.current.initHeight - minSize);
          }
          break;
        case "sw":
          newX = resizingStartRef.current.initX + deltaX;
          newWidth = resizingStartRef.current.initWidth - deltaX;
          newHeight = resizingStartRef.current.initHeight + deltaY;
          if (newWidth < minSize) {
            newWidth = minSize;
            newX =
              resizingStartRef.current.initX +
              (resizingStartRef.current.initWidth - minSize);
          }
          if (newHeight < minSize) newHeight = minSize;
          break;
        case "se":
          newWidth = resizingStartRef.current.initWidth + deltaX;
          newHeight = resizingStartRef.current.initHeight + deltaY;
          if (newWidth < minSize) newWidth = minSize;
          if (newHeight < minSize) newHeight = minSize;
          break;
        case "top":
          newY = resizingStartRef.current.initY + deltaY;
          newHeight = resizingStartRef.current.initHeight - deltaY;
          if (newHeight < minSize) {
            newHeight = minSize;
            newY =
              resizingStartRef.current.initY +
              (resizingStartRef.current.initHeight - minSize);
          }
          break;
        case "bottom":
          newHeight = resizingStartRef.current.initHeight + deltaY;
          if (newHeight < minSize) newHeight = minSize;
          break;
        case "left":
          newX = resizingStartRef.current.initX + deltaX;
          newWidth = resizingStartRef.current.initWidth - deltaX;
          if (newWidth < minSize) {
            newWidth = minSize;
            newX =
              resizingStartRef.current.initX +
              (resizingStartRef.current.initWidth - minSize);
          }
          break;
        case "right":
          newWidth = resizingStartRef.current.initWidth + deltaX;
          if (newWidth < minSize) newWidth = minSize;
          break;
        default:
          break;
      }
      setPosition({ x: newX, y: newY });
      dispatch(moveBackdrop({ x: newX, y: newY }));
      setSize({ width: newWidth, height: newHeight });
      dispatch(setWidth(newWidth));
      dispatch(setHeight(newHeight));
    };

    const handleResizeMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  // Rotation handler for rotation handles
  const handleRotationMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    rotatingRef.current = true;
    // Calculate the center of the box
    const centerX = position.x + size.width / 2;
    const centerY = position.y + size.height / 2;
    rotatingStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      centerX,
      centerY,
      // Calculate the initial angle between the center and the mouse pointer
      initialAngle:
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI),
      startRotation: rotationAngle,
    };

    const handleRotationMouseMove = (e: MouseEvent) => {
      if (!rotatingRef.current) return;
      const { centerX, centerY, initialAngle, startRotation } =
        rotatingStartRef.current;
      const currentAngle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const newRotation = startRotation + (currentAngle - initialAngle);
      setRotationAngle(newRotation);
      dispatch(setRotation(newRotation));
    };

    const handleRotationMouseUp = () => {
      rotatingRef.current = false;
      document.removeEventListener("mousemove", handleRotationMouseMove);
      document.removeEventListener("mouseup", handleRotationMouseUp);
    };

    document.addEventListener("mousemove", handleRotationMouseMove);
    document.addEventListener("mouseup", handleRotationMouseUp);
  };

  return (
    <div
      ref={sizingFrameRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `rotate(${rotationAngle}deg)`,
        cursor: "move",
      }}
      className="sizing-frame"
    >
      {/* Rotation handles */}
      {formattingNow && (<>
      <div className="nw-rotate" onMouseDown={handleRotationMouseDown}></div>
      <div className="sw-rotate" onMouseDown={handleRotationMouseDown}></div>
      <div className="ne-rotate" onMouseDown={handleRotationMouseDown}></div>
      <div className="se-rotate" onMouseDown={handleRotationMouseDown}></div>
      {/* Sizing handles */}
      <div className="nw-sizing" onMouseDown={handleResizeMouseDown("nw")}></div>
      <div className="ne-sizing" onMouseDown={handleResizeMouseDown("ne")}></div>
      <div className="sw-sizing" onMouseDown={handleResizeMouseDown("sw")}></div>
      <div className="se-sizing" onMouseDown={handleResizeMouseDown("se")}></div>
      <div className="top-size" onMouseDown={handleResizeMouseDown("top")}></div>
      <div className="bottom-size" onMouseDown={handleResizeMouseDown("bottom")}></div>
      <div className="left-size" onMouseDown={handleResizeMouseDown("left")}></div>
      <div className="right-size" onMouseDown={handleResizeMouseDown("right")}></div>
      </>
      )}
      {children}
    </div>
  );
};

export default SizingBox;