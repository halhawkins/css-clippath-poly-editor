import { FC, useEffect, useRef, useState } from "react";
import "./CanvasPanel.css";
import { Image, Layer, Line, Rect, Stage } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useDispatch, useSelector } from "react-redux";
import { addPath, IPath, setMouseLocation, editPath, setEditing } from "../Slice/ClipPathSlice";
import Backdrop from "../Backdrop/Backdrop";
import { RootState } from "../../store";
import PolygonShape from "../PolygonShape/PolygonShape";

const URLImage: FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}> = ({ src, x, y, width, height, rotation, opacity }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const handleLoad = () => {
    setImage(imageRef.current);
  };

  const loadImage = () => {
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    imageRef.current = img;
    img.addEventListener("load", handleLoad);
  };

  useEffect(() => {
    loadImage();
  }, [src]);

  return (
    <Image
      image={image || undefined}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
    />
  );
};

const PentagonShape: IPath = {
  points: [
    { x: 10, y: 10},
    { x: 10, y: 210},
    { x: 210, y: 210},
    { x: 210, y: 10},
  ]
  }

const CanvasPanel: FC = () => {
  const canvasPanelRef = useRef<HTMLDivElement>(null);
  const [draggingPoint, setDraggingPoint] = useState(false);
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);
  const backdropSrc = useSelector((state: RootState) => state.backdropSlice.imgSrc);
  const editing = useSelector((state: RootState) => state.clippathSlice.editing);
  const backdropTop = useSelector((state: RootState) => state.backdropSlice.y);
  const backdropLeft = useSelector((state: RootState) => state.backdropSlice.x);
  const backdropWidth = useSelector((state: RootState) => state.backdropSlice.width);
  const backdropHeight = useSelector((state: RootState) => state.backdropSlice.height);
  const backdropRotation = useSelector((state: RootState) => state.backdropSlice.rotation);
  const backdropOpacity = useSelector((state: RootState) => state.backdropSlice.opacity);
  const [polyPoints, setPolyPoints] = useState<IPath>({ points: [] });
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const dispatch = useDispatch();
  const clippath = useSelector((state: RootState) => state.clippathSlice);
  const creatingPath = useSelector((state: RootState) => state.clippathSlice.addNewPath);
  const [trackMouse, setTrackMouse] = useState(false);
  const mouseCoords = useSelector((state: RootState) => state.clippathSlice.mouseLocation);
  const fillColor = useSelector((state: RootState) => state.clippathSlice.color);
  const isBackdropSet = useSelector((state: RootState) => state.backdropSlice.isSet);
  const editingFrame = useSelector((state: RootState) => state.clippathSlice.editingFrameColor)
  const opacity = useSelector((state: RootState) => state.backdropSlice.opacity)
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (canvasPanelRef.current) {
      const { clientWidth, clientHeight } = canvasPanelRef.current;
      setCanvasWidth(clientWidth);
      setCanvasHeight(clientHeight);
    }
  }, [canvasPanelRef]);

  useEffect(() => {
    if (editing !== null && clippath.paths && clippath.paths[editing]) {
      // Load the selected polygon into polyPoints state for editing
      setPolyPoints({ points: clippath.paths[editing].points || [] });
    } else {
      // Optionally, clear polyPoints if no polygon is selected
      setPolyPoints({ points: [] });
    }
  }, [editing, clippath.paths]);

  

  const handleMouseMove = (e: any) => {
    if (!trackMouse) return;
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
        dispatch(setMouseLocation({ x: pointerPosition.x, y: pointerPosition.y }));
    }
  };

  const translateArray = (pnts: IPath): number[] => {
    return pnts.points.flatMap(point => [point.x, point.y]);
  };

  useEffect(() => {
    setTrackMouse(true);
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };

  }, []);

  const updateSize = () => {
    // console.log("Updating canvas size")
    if (!canvasPanelRef.current) return;
    
    // Get container width
    const containerWidth = canvasPanelRef.current.offsetWidth;
    const containerHeight = canvasPanelRef.current.offsetHeight;
    console.log("Container width:", containerWidth)
    
    // Calculate scale
    const scale = containerWidth / canvasWidth;
    
    // Update state with new dimensions
    setCanvasWidth(containerWidth);
    setCanvasHeight(containerHeight);
    // setStageSize({
    //   width: sceneWidth * scale,
    //   height: sceneHeight * scale,
    //   scale: scale
    // });
  };

  useEffect(() => {
    // When finalizing, ensure there are enough points
    if (!creatingPath && polyPoints.points.length > 2) {
      if (editing !== null) {
        // Dispatch an update for the existing polygon at index `editing`
        if (clippath.paths && clippath.paths[editing] !== undefined) {
          dispatch(editPath({
            index: editing,
            path: {
              ...clippath.paths[editing],
              points: polyPoints.points,
            }
          }));
        }
        // Optionally, clear editing state after updating
        dispatch(setEditing(null));
      } else {
        // Otherwise, add a new path as before
        const numberOfPaths = clippath.paths ? clippath.paths.length : 0;
        dispatch(
          addPath({
            name: `Path ${numberOfPaths === 0 ? 1 : numberOfPaths + 1}`,
            stroke: "black",
            points: polyPoints.points,
            fill: fillColor,
          })
        );
      }
      // Clear local state after finalizing the polygon
      setPolyPoints({ points: [] });
    }
  }, [creatingPath]);

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!creatingPath) return;
    if (ignoreNextClick) {
      setIgnoreNextClick(false);
      return;
    }
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      // Create a new array with the new point appended
      setPolyPoints(prev => ({
        points: [...prev.points, { x: pointerPosition.x, y: pointerPosition.y }],
      }));
      const numberOfPaths = clippath.paths ? clippath.paths.length : 0;
      if (editing !== null) {
        dispatch(
          editPath({index: editing,path:{
            name: `Path ${numberOfPaths === 0 ? 1 : numberOfPaths + 1}`,
            stroke: "black",
            points: polyPoints.points,
            fill: fillColor,
          }})
        );
      }
    }
  };
  
  return (
    <div ref={canvasPanelRef} className="canvas-panel">

      <Backdrop />
      <Stage ref={stageRef} width={canvasWidth} height={canvasHeight} onMouseMove={handleMouseMove} onClick={handleClick}>
        <Layer>
          {isBackdropSet && backdropSrc && (
            <URLImage
              key="backdrop"
              src={backdropSrc}
              x={backdropLeft}
              y={backdropTop}
              width={backdropWidth}
              height={backdropHeight}
              rotation={backdropRotation}
              opacity={backdropOpacity}
            />
          )}
          {clippath.paths &&

            clippath.paths.map((path, index) => {
              console.log(`Rendering path ${path?.name}`, path.points)
              if (clippath.paths !== null) {
                return (
                  <PolygonShape
                    key={index}
                    points={{ points: clippath.paths[index].points || [] }}
                    fill={clippath.paths[index].fill}
                  />
                )
              }
            })
          }

          {creatingPath && polyPoints.points.length > 2 && (
            <>
              <Line strokeWidth={1} stroke={editingFrame} fill={fillColor} points={translateArray(polyPoints)} closed={true} />
               {polyPoints.points.map((point, index) => (
                <Rect
                  key={index}
                  x={point.x - 2}
                  y={point.y - 2}
                  width={5}
                  height={5}
                  stroke={editingFrame}
                  fill={"transparent"}
                  draggable={true}
                  onDragMove={(e) => {
                    setPolyPoints(prev => ({
                      points: prev.points.map((p, idx) => 
                        idx === index ? { x: e.target.x(), y: e.target.y() } : p
                      ),
                    }));
                  }}                  
                  onDragStart={() => setDraggingPoint(true)}
                  onDragEnd={(e) => {
                    setDraggingPoint(false);
                    // Set the flag to ignore the next click
                    setIgnoreNextClick(true);
                    if (clippath.paths && editing !== null) {
                      dispatch(editPath({
                        index: editing,
                        path: {
                          ...clippath.paths[editing],
                          points: polyPoints.points, // updated points from state
                        }
                      }));
                    }
                  }}
                  onClick={(e) => {
                    // Prevent the click from bubbling up to the container
                    e.cancelBubble = true;
                    e.evt.stopPropagation();
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "crosshair";
                    }
                  }}
                    onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) {
                        container.style.cursor = "default";
                        }
                    }}
                />
              ))}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasPanel;
