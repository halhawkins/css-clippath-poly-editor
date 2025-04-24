import { FC, useEffect, useRef, useState } from "react";
import "./InfoPanel.css"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { addPath, createNewPath, decrementPath,deletePath, editPath, incrementPath, reorderPaths, setColor, setCurrentPathName, setEditing, setPathOpacity/*, setZIndex */} from "../Slice/ClipPathSlice";
import { setOpacity } from "../Slice/BackdropSlice";

interface PathListEntryProps {
    pathName: string;
    color: string | undefined;
    index: number;
    setCurrentPathName: (name: string) => void;
}
const PathListEntry: FC<PathListEntryProps> = ({ pathName, color, index, setCurrentPathName }) => {
    const dispatch = useDispatch();
    const currentPathName = useSelector((state: RootState) => state.clippathSlice.currentPathName)
    const editing = useSelector((state: RootState) => state.clippathSlice.editing)
    const paths = useSelector((state: RootState) => state.clippathSlice.paths)
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPos, setMenuPos] = useState<{x:number, y:number} | null>(null);
    const [pathNameState, setPathNameState] = useState(pathName);
    const [showContextMenu, setShowContextMenu] = useState(false);
    // const [editingIndex, setEditingIndex] = useState<number | null>(null);
    // const zIndex = useSelector((state: RootState) => state.clippathSlice.paths && state.clippathSlice.paths[index].zIndex)
    const hideMenu = () => {setMenuPos(null)};

    useEffect(() => {
        if (!menuPos) return;
    
        const handleClickOutside = (e: MouseEvent) => {
            // if click/tap is outside our menu element, hide
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                hideMenu();
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuPos]);    

    useEffect(() => {
        console.log("props", pathName, color, index);
    },[])
    const handleClick = () => {
        console.log("Path clicked:", editing);
        dispatch(setEditing(index));
        dispatch(createNewPath(true))
        setCurrentPathName(pathName);
        dispatch(setColor(color !== undefined ? color : "#000000" ))
        console.log("Current path name:", currentPathName);
        if (paths !== null && editing && paths[index] !== undefined && paths[index].fill!== undefined) {
            console.log("Fill color:", paths[index].fill);
            dispatch(setColor(paths[index].fill))
        }
        // setEditingIndex(index);
    }

    useEffect(() => {
        console.log("Path name state:", pathNameState,currentPathName);
        if (currentPathName === pathName) {
            setPathNameState(pathName);
        } else {
            setPathNameState(currentPathName);
        }
    }, [currentPathName])

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        // const handler = () => {
        //     window.removeEventListener("mousedown", handler);
        //     hideMenu();
        // };
        // window.addEventListener("mousedown", handler);
        // e.preventDefault();
        // setMenuPos({ x: e.clientX, y: e.clientY });
    }

    const handleZIndexInc = (e: React.MouseEvent<HTMLDivElement>) => {
        // console.log("🥹zIndex updated:", zIndex);
        e.preventDefault();
        // dispatch(setZIndex({index, zIndex: zIndex!==null?zIndex+1:1}))
        hideMenu();
    }

    const handleZIndexDec = (e: React.MouseEvent<HTMLDivElement>) => {
        // console.log("🥹zIndex updated:", zIndex);
        e.preventDefault();
        // dispatch(setZIndex({index, zIndex: zIndex!==null?zIndex-1:1}))
        hideMenu();
    }

    const handleDelete = () => {
        dispatch(setEditing(null))
        dispatch(createNewPath(false))
        dispatch(deletePath(index))
    }

    return (
        <>
            <div onContextMenu={handleContextMenu} className={editing === index ? "path-list-entry editing" : "path-list-entry"}>
                <div className="path-name" onClick={handleClick}>{index === editing ? pathName : pathName}</div>
                <div className="path-delete-btn" onClick={handleDelete}>⊗</div>
                {menuPos && 
                <div className="context-menu">
                    <div className="context-menu-item" onClick={handleZIndexInc}>zIndex +</div>
                    <div className="context-menu-item" onClick={handleZIndexDec}>zIndex -</div>
                </div>
                }
            </div>
        </>
    )
}

const InfoPanel:FC = () => {
    const dispatch = useDispatch();
    // const [x, setX] = useState(0);
    // const [y, setY] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [pathNameState, setPathNameState] = useState("");
    const [opacityState, setOpacityState] = useState(1.0);
    const colorSwatchRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const mouseCoords = useSelector((state: RootState) => state.clippathSlice.mouseLocation)
    const currentColor = useSelector((state: RootState) => state.clippathSlice.color)
    const paths = useSelector((state: RootState) => state.clippathSlice.paths)
    // const opacity = useSelector((state: RootState) => state.backdropSlice.opacity)
    const editBackdrop = useSelector((state: RootState) => state.backdropSlice.setting)
    // const editPoly = useSelector((state: RootState) => state.clippathSlice.addNewPath)
    const currentPath = useSelector((state: RootState) => state.clippathSlice.editing)
    const editPolys = useSelector((state: RootState) => state.clippathSlice.addNewPath)
    const opacityInputRef = useRef<HTMLInputElement>(null);
    const [draggedElement, setDraggedElement] = useState<HTMLDivElement | null>(null);
    const dragStartHandlerRef = useRef(null);
    const dragEndHandlerRef = useRef(null);
    const [draggedOverElement, setDraggedOverElement] = useState<number | null>(null);
    const [dropAbove, setDropAbove] = useState(false);


    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newOpacity = parseFloat(e.target.value);
        setOpacityState(newOpacity);
        dispatch(setPathOpacity(newOpacity));
        dispatch(setOpacity(newOpacity));
    }

    useEffect(() => {
        dispatch(setOpacity(opacityState));
    }, [opacityState])

    useEffect(() => {
        console.log("paths", paths, currentPath);
    } , [paths, currentPath])

    const handleColorSelect = () => {
        if (colorInputRef.current) {
            colorInputRef.current.click();
        }
        if (paths !== null && currentPath !== null) {
            const currentPathFill = paths[currentPath].fill;
        }
        // setColor(e.target.value);
    }

    const handleSavePoly = () => {
        const newPath = {
            name: pathNameState,
            fill: currentColor,
            opacity: opacityState,
            points: paths !== null && currentPath !== null ? paths[currentPath].points : [], // Add your points here
        };
        dispatch(editPath({index: currentPath !== null ? currentPath : 0, path: newPath}))
        dispatch(createNewPath(false));
        dispatch(setEditing(null));
        // setCurrentPathName(pathNameState);
        setPathNameState("");
        dispatch(setCurrentPathName(""));
    }
    const handlePathNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setPathNameState(newName);
        dispatch(setCurrentPathName(newName));
        setCurrentPathName(newName);
    };

    const pathnameCallback = (name: string) => {
        console.log("Setting current path name:", name);
        dispatch(setCurrentPathName(name));
        setCurrentPathName(name);
        setPathNameState(name);
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setDraggedElement(target); // Store the dragged element
        console.log("Dragging started",e);
        target.style.opacity = "0.5"; // Set opacity to 0.5 when dragging
        target.style.zIndex = "1000"; // Bring the dragged item to the front
        e.dataTransfer.effectAllowed = "move"; // Set the drag effect to move
    }

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
      
        if (draggedElement !== null) {
            dispatch(reorderPaths({source: parseInt(draggedElement.dataset.index!, 10), target: draggedOverElement!, position: dropAbove ? 'before' : 'after'}))
        }
        setDraggedElement(null);
        setDraggedOverElement(null);  
        setDropAbove(false); 
      
        target.style.opacity = "1";
        target.style.zIndex = "0";
      };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const entry = (e.target as HTMLElement)
                        .closest('.path-list-entry-div') as HTMLDivElement | null;
        if (!entry || entry === draggedElement) return;
      
        const { top, height } = entry.getBoundingClientRect();
        const halfway = top + height / 2;
        const isAbove = e.clientY < halfway;
      
        setDropAbove(isAbove);                                    // <- fixed
        setDraggedOverElement(parseInt(entry.dataset.index!, 10));
      };
      
    useEffect(() => {
        console.log("Dragged over element:", draggedOverElement);
    }, [draggedOverElement])

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const closestPathListEntry = target.closest(".path-list-entry-div") as HTMLDivElement;
        if (!closestPathListEntry) return; // Ignore if the target is not a path list entry
        setDropAbove(false); // Reset drop position
        setDraggedOverElement(null); // Clear the dragged over element
    }


    return (
        <div className="info-panel">
            <div className="horizontal">
                <div className="info-label-1">X:</div>
                <div className="info-data">{mouseCoords.x.toFixed(2)}</div>
                <div className="info-label-2">Width:</div>
                <div className="info-data">{width.toFixed(2)}</div>
            </div>
            <div className="vertical">
                <div className="info-label-1">Y:</div>
                <div className="info-data">{mouseCoords.y.toFixed(2)}</div>
                <div className="info-label-2">Height:</div>
                <div className="info-data">{height.toFixed(2)}</div>
            </div>
            <div style={{width:"100%", height:"40px"}}>
                <div className="seciont-label">Opacity</div>
                <input ref={opacityInputRef} type="range" min={0} max={1} step={0.01} onChange={handleOpacityChange} className="slider" />
            </div>
            <div style={{width: "100%"}}>
                {editPolys && 
                <>
                    <div className="seciont-label">Polygon</div>
                    <input onChange={handlePathNameChange} type="text" className="polygon-name" value={pathNameState} placeholder="Polygon Name" />
                    <button onClick={handleSavePoly}>Save Polygon</button>
                </>}
            </div>
            <div className="seciont-label">Color</div>
            <input ref={colorInputRef} type="color" value={currentColor} onChange={(e) => dispatch(setColor(e.target.value))} hidden style={{zIndex:"200"}}/>
            <div ref={colorSwatchRef} className="color-swatch" style={{backgroundColor: currentColor}} onClick={handleColorSelect}></div>
            {}
            <div className="clippath-list"
            >
                {paths !== null ? paths.map((path, index) => (
                    <div 
                        className={
                            draggedOverElement === index
                              ? `path-list-entry-div ${dropAbove ? 'drop-top' : 'drop-bottom'}`
                              : 'path-list-entry-div'
                          }
                        key={index} 
                        data-index={index} 
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd} 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        draggable={true}>
                        <PathListEntry
                            pathName={path.name}
                            color={path.fill}
                            index={index}
                            setCurrentPathName={()=>{pathnameCallback(path.name)}}
                            />
                    </div>
                )) : null}
            </div>
        </div>
    )
}

export default InfoPanel;
