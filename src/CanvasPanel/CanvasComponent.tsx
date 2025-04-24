import { FC, useEffect, useRef, useState } from "react";
import "./CanvasPanel.css";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import PolygonShape from "../PolygonShape/PolygonShape";
import { addPath, editPath, IPath, IPathInfo } from "../Slice/ClipPathSlice";
import { KonvaEventObject } from "konva/lib/Node";
import { insertPointInPolygon } from "../helpers";
import Konva from "konva";
import { setStoreCanvasHeight, setStoreCanvasWidth } from "../Slice/appSlice";

const CanvasComponent: FC = () => {
    const [canvasWidth, setCanvasWidth] = useState<number>(800);
    const [canvasHeight, setCanvasHeight] = useState<number>(600);
    const [layerOpacity, setLayerOpacity] = useState<number>(1);
    const canvasPanelRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const bgLayerRef = useRef<Konva.Layer>(null);
    const dispatch = useDispatch();
    const currentPathName = useSelector((state: RootState) => state.clippathSlice.currentPathName)
    const newImage = useRef<Konva.Image>(null);
    const layerRef = useRef<Konva.Layer>(null);


    const stageWidth = useSelector((state: RootState) => state.appSlice.stageWidth)
    const stageHeight = useSelector((state: RootState) => state.appSlice.stageHeight)
    const stageVisible = useSelector((state: RootState) => state.appSlice.showStage)
    // when creating a new polygon, creatingPolygon will be true
    const creatingPolygon = useSelector((state: RootState) => state.clippathSlice.addNewPath);

    // when editing a polygon, currentPolyIndex will be the index of the polygon
    const currentPolyIndex = useSelector((state: RootState) => state.clippathSlice.editing);

    const polygons = useSelector((state: RootState) => state.clippathSlice.paths)

    const edittingColor = useSelector((state: RootState) => state.clippathSlice.color)

    const pathOpacity = useSelector((state: RootState) => state.backdropSlice.opacity)

    const zoom = useSelector((state: RootState) => state.appSlice.zoom)

    const backdropImage = useSelector((state: RootState) => state.backdropSlice.imgSrc)

    const settingBackdropState = useSelector((state: RootState) => state.backdropSlice.setting)

    const formattingBackdropState = useSelector((state: RootState) => state.backdropSlice.formatting)

    const translateArray = (pnts: IPath): number[] => {
        return pnts.points.flatMap(point => [point.x, point.y]);
    };

    const polygonsJSON = polygons !== null ? JSON.stringify(polygons) : null;

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
    
        // Get the current pointer position in DOM (or scaled) coordinates.
        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition) return;
    
        // Get the complete stage transform (this includes scaling and translation)
        const transform = stage.getAbsoluteTransform().copy();
        // Invert it to get the transformation from DOM coordinates back into stage coordinates.
        transform.invert();
        console.log( "transformed:", transform);
    
        // Apply the inverted transform to the pointer position.
        const pos = transform.point(pointerPosition);
        const x = pos.x;
        const y = pos.y;
    
        // Use these untransformed coordinates for your polygon
        if (polygons !== null && currentPolyIndex !== null) {
            if (creatingPolygon && polygons[currentPolyIndex]) {
                const editedPolygon = [...polygons[currentPolyIndex].points || []];
                editedPolygon.push({ x, y });
                dispatch(editPath({
                    index: currentPolyIndex,
                    path: {
                        stroke: "black",
                        fill: "green",
                        name: currentPathName,
                        opacity: pathOpacity,
                        points: editedPolygon
                    }
                }));
            }
        } else if (creatingPolygon && currentPolyIndex === null) {
            dispatch(addPath({
                name: currentPathName,
                stroke: "black",
                opacity: pathOpacity,
                fill: "green",
                points: [{ x, y }]
            }));
        }
    };

    useEffect(() => {
        setLayerOpacity(pathOpacity);
    }, [pathOpacity])

    useEffect(() => {
        const target = canvasPanelRef.current;
        if (!target) return;
        const width = target.clientWidth;
        const height = target.clientHeight;
        setCanvasWidth(width);
        setCanvasHeight(height);
        dispatch(setStoreCanvasWidth(width));
        dispatch(setStoreCanvasHeight(height));
        console.log("Canvas initialized", width, height);

        const handleResize = () => {
            if (target) {
                const width = target.clientWidth;
                const height = target.clientHeight;
                setCanvasWidth(width);
                setCanvasHeight(height);
                dispatch(setStoreCanvasWidth(width));
            }
        };
        window.addEventListener("resize", handleResize);
        
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [])

    useEffect(() => {
        const stage = stageRef.current;
        if (stage) {
            stage.scale({ x: zoom, y: zoom });
        }
    }, [zoom])

    useEffect(() => {
        if (backdropImage !== null) {
            console.log("CanvasComponent formattingBackdropState:", formattingBackdropState, settingBackdropState);
            Konva.Image.fromURL(backdropImage, (image) => {
                image.draggable(formattingBackdropState ? true : false);
                newImage.current = image;
                if (bgLayerRef.current) {
                    bgLayerRef.current.add(newImage.current);
                }
            })
        }
    }, [backdropImage,formattingBackdropState])

    useEffect(() => {
        if (settingBackdropState && newImage.current) {
            newImage.current.draggable(false)
            // layerRef.current?.draw();
        }
    }, [settingBackdropState])
      
    const handleClickForInsertion = (e: KonvaEventObject<MouseEvent>) => {
        // Skip if right-clicked
        if (e.evt.button === 2) { 
            return; 
        }
        
        const stage = e.target.getStage();
        if (!stage) return;
    
        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition) return;
        
        // Invert the stage's absolute transform to convert pointer position to untransformed (base) coordinates.
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = transform.point(pointerPosition);
        
        // Use the transformed position as the new point.
        const newPoint = { x: pos.x, y: pos.y };
    
        // Assume currentPoly is the current polygon you are editing.
        let currentPoly: IPathInfo = {
            name: 'path', 
            fill: 'green', 
            stroke: 'black', 
            opacity: pathOpacity,
            points: []
        };
    
        // If there is no pointer position, abort.
        if (!newPoint) return;
      
        // Retrieve points from an existing polygon if applicable:
        if (polygons !== null && currentPolyIndex !== null) {
            currentPoly.points = polygons[currentPolyIndex].points;
            currentPoly.name = currentPathName;
            currentPoly.stroke = "black";
            currentPoly.fill = "green";
        }
      
        // If enough points exist, insert the new point into the polygon.
        if (currentPoly && currentPoly.points && currentPoly.points.length >= 2) {
            // Insert the new point into the existing points.
            const updatedPoly = insertPointInPolygon({ points: currentPoly.points }, newPoint, /*closed=*/true);
            
            // Dispatch the update so that your state refreshes.
            if (currentPolyIndex !== null) {
                dispatch(editPath({
                    index: currentPolyIndex,
                    path: { ...updatedPoly, opacity: pathOpacity, stroke: "black", fill: "green", name: currentPathName/*, zIndex: currentPolyIndex*/ }
                }));
            }
        } else {
            console.log("Not enough points in the polygon to insert in between.");
            // If there are not enough points yet, fall back to simply adding the point.
            handleClick(e); 
        }
    };
    
    const handleHandleRightClick = (e: KonvaEventObject<MouseEvent>, index: number) => {
            if (e.evt.button === 2) {
                // Right-click to remove the point
                if (polygons !== null && currentPolyIndex !== null) {
                    const editedPolygon = [...polygons[currentPolyIndex].points || []];
                    editedPolygon.splice(index, 1); // Remove the point at the index
                    dispatch(editPath({index: currentPolyIndex, path: {stroke: "black", opacity: pathOpacity, fill: "green", name: currentPathName/*, zIndex: currentPolyIndex*/, points:editedPolygon}}))
                }
            }
      }

      useEffect(() => {
        const container = stageRef.current?.container();
        if (container) {
          // Disable the default context menu on right-click
          container.addEventListener("contextmenu", (e) => e.preventDefault());
        }
        return () => {
          if (container) {
            container.removeEventListener("contextmenu", (e) => e.preventDefault());
          }
        }
      }, []);
      const stage = stageRef.current;
      const actualZoom = stage ? stage.scaleX() : 1;
      

    return (
        <div ref={canvasPanelRef} className="canvas-panel">
            <Stage
                ref={stageRef}
                width={canvasWidth}
                height={canvasHeight}
                draggable={true}
                onClick={handleClickForInsertion}
                onWheel={(e) => {
                    e.evt.preventDefault(); // Prevent the default zoom behavior
                    const scaleBy = .95;
                    const stage = stageRef.current;
                    if (!stage) return;
                    const oldScale = stage.scaleX();
                    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
                    stage.scale({ x: newScale, y: newScale });
                }}
                >
                    <Layer onClick={(e) => {e.evt.preventDefault()}} ref={bgLayerRef} key="background">
                    </Layer>
                    <Layer ref={layerRef}>
                    {stageVisible &&
                            <Rect
                                width={stageWidth}
                                height={stageHeight}
                                fill={"white"}   
                                draggable={false}
                                opacity={1}
                                strokeWidth={1/actualZoom}
                                stroke={"black"}
                                />
                        }
                        {(polygons !== null) && (polygons.length > 0) && polygons.map((polygon, index) => {
                            if (polygon.points && polygon.points.length > 2) {
                                return(
                                <PolygonShape
                                    key={index}
                                    index={index}
                                    points={{ points: polygon.points || [] }}
                                    fill={polygon.fill}
                                    opacity={layerOpacity}
                                />)
                            } else {
                                return null;
                            }
                        })}
                         {creatingPolygon && (polygons !== null) && currentPolyIndex !== null && 
                         <>
                            <Line 
                                strokeWidth={1/actualZoom} 
                                fill={edittingColor}
                                opacity={layerOpacity}
                                 points={polygons[currentPolyIndex]?.points ? translateArray({ points: polygons[currentPolyIndex].points }) : []}
                                closed={(polygons[currentPolyIndex]?.points?.length ?? 0) > 2}
                                />
                           {polygons[currentPolyIndex]?.points?.map((point, index) => {
                                return (
                                    <Circle     
                                        strokeWidth={1/actualZoom}
                                        key={index} 
                                        x={point.x} 
                                        y={point.y} 
                                        radius={5/actualZoom}  
                                        fill={'transparent'}
                                        stroke={"black"}
                                        draggable={true}
                                        onDragMove={(e) => {
                                            const editedPolygon = [...polygons[currentPolyIndex].points || []];
                                            editedPolygon[index] = { x: e.target.x(), y: e.target.y() };
                                            dispatch(editPath({
                                                index: currentPolyIndex, 
                                                path: {
                                                    stroke: "black", 
                                                    fill: "green", 
                                                    name: currentPathName, 
                                                    points:editedPolygon, 
                                                    opacity: pathOpacity
                                                }
                                            }))
                                        }}
                                        // }} 
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
                                        onMouseDown={(e) => handleHandleRightClick(e, index) }
                                        />
                                )
                            })}
                        </>
                        }
                    </Layer>
                </Stage>
        </div>
    )

}
export default CanvasComponent;