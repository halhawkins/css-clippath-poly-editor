import { FC, useEffect, useRef, useState } from "react";
import addBackdrop from "../assets/image-icon.svg"
import deleteBackdrop from "../assets/removeImage.svg"
import addClipPath from "../assets/addclippath.svg"
import zoomIn from "../assets/zoom-in.svg"
import zoomOut from "../assets/zoom-out.svg"
import saveBackdrop from "../assets/saveImage.svg"
import convert from "../assets/convert.svg"
import stageIcon from "../assets/stage.svg"
import "./Toolbar.css"
import { settingBackdrop, setBackdropImg, formattingBackdrop } from "../Slice/BackdropSlice";
import { useDispatch, useSelector } from "react-redux";
import { createNewPath, setEditingFrameColor } from "../Slice/ClipPathSlice";
import { RootState } from "../../store";
import { setShowConversion, setShowStageOptions, setZoom } from "../Slice/appSlice";

const EditintgFrame: FC = () => {
    const dispatch = useDispatch();

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        console.log("Editing frame color changed to:", color);
        dispatch(setEditingFrameColor(color));
    }

    return (
        <>
            <input type="color" className="tool-button" style={{width: "64px", height: "38px"}} title="Color of polygon editing frame." onChange={handleColorChange}/>
        </>
    )
}

const Toolbar: FC = () => {
    const [addBackdropState, setAddBackdropState] = useState(true);
    const [deleteBackdropState, setDeleteBackdropState] = useState(false);
    const [saveBackdropState, setSaveBackdropState] = useState(false);
    const [addClipPathState, setAddClipPathState] = useState(true);
    const [saveClipPathState, setSaveClipPathState] = useState(false);
    const [deleteClipPathState, setDeleteClipPathState] = useState(false);
    const addPathMode = useSelector((state: RootState) => state.clippathSlice.addNewPath)
    const zoomState = useSelector((state: RootState) => state.appSlice.zoom)
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddBackdropClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        setAddBackdropState(false);
        setSaveBackdropState(true);
        // dispatch(createNewPath(false))
        dispatch(settingBackdrop(true));
        dispatch(formattingBackdrop(true))
        // dispatch(settingBackdrop(true))
    }
    const handleDeleteBackdropClick = () => {
        setAddBackdropState(true);
        setDeleteBackdropState(false);
    }
    const handleSaveBackdropClick = () => {
        console.log("🥹Save backdrop clicked🥹");
        setAddBackdropState(true);
        setSaveBackdropState(false);
        dispatch(settingBackdrop(false));
        dispatch(formattingBackdrop(false))
        // dispatch(settingBackdrop(false));
        // dispatch(setIsSet(true))
    }
    const handleAddClipPathClick = () => {
        setAddClipPathState(false);
        setSaveClipPathState(true);
        setDeleteClipPathState(true);
        dispatch(settingBackdrop(false));
        dispatch(createNewPath(true))
    }
    // const handleSaveClipPathClick = () => {
    //     setAddClipPathState(true);
    //     setSaveClipPathState(false);
    //     setDeleteClipPathState(false);
    //     dispatch(createNewPath(false))
    // }
    // const handleDeleteClipPathClick = () => {
    //     setAddClipPathState(true);
    //     setSaveClipPathState(false);
    //     setDeleteClipPathState(false); 
    // }

    const handleZoomInClick = () => {
        dispatch(setZoom(zoomState + 0.1));
    }

    const handleZoomOutClick = () => {
        dispatch(setZoom(zoomState - 0.1));
    }

    const handleConvertClick = () => {
        dispatch(setShowConversion(true));
    }

    const handleSetStageClick = () => {
        dispatch(setShowStageOptions(true))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                // setImgSrc(event.target.result);
                const img = new Image();
                img.src = event.target.result;
                dispatch(setBackdropImg(event.target.result));
                // dispatch(addImage(img));
            };
            reader.readAsDataURL(file);
        }
    }

    useEffect(() => {
        setAddClipPathState(!addPathMode)
    }, [addPathMode])
    // Add other toolbar buttons here...
    return (
        <div className="toolbar">
            <input ref={fileInputRef} onChange={handleFileSelect} type="file" accept="image/*" id="file-input" style={{ display: "none" }} />
            {addBackdropState && 
                <button onClick={handleAddBackdropClick} className="text-button" title="Add tracing backdrop"><img src={addBackdrop} className="tool-img"/><div>Load Ref Image</div></button>}
            {deleteBackdropState &&
                <button onClick={handleDeleteBackdropClick} className="text-button" title="Delete tracing backdrop"><img src={deleteBackdrop} className="tool-img"/><div>Delete Ref Image</div></button>}
            {saveBackdropState &&
                <button onClick={handleSaveBackdropClick} className="text-button" title="Save tracing backdrop"><img src={saveBackdrop} className="tool-img"/><div>Save Ref Image</div></button>  }
            {addClipPathState &&
                <button onClick={handleAddClipPathClick} className="text-button" title="Add new clippath"><img src={addClipPath} className="tool-img"/><div>Add new polygon</div></button>}
            {!addClipPathState &&
                <button disabled onClick={handleAddClipPathClick} className="text-button disabled" title="Add new clippath"><img src={addClipPath} className="tool-img"/></button>}
            <button title="Zoom In" className="text-button" onClick={handleZoomInClick}><img src={zoomIn} className="tool-img" /><div>Zoom in</div></button>
            <button title="Zoom Out" className="text-button" onClick={handleZoomOutClick} ><img src={zoomOut} className="tool-img" /><div>Zoom out</div></button>
            <button onClick={handleConvertClick} className="text-button"><img src={convert} className="tool-img" alt="convert format" />Export Polygons{/**/}</button>
            <button className="text-button" title="Stage" onClick={handleSetStageClick}><img src={stageIcon} className="tool-img" /><div>Stage settings</div></button>
            {/* {saveClipPathState &&
                <button onClick={handleSaveClipPathClick} className="tool-button" title="Save current clippath"><img src={saveClipPath} className="tool-img"/></button> }
            {deleteClipPathState &&
                <button onClick={handleDeleteClipPathClick} className="tool-button" title="Delete selected clippath"><img src={deleteClipPath} className="tool-img"/></button>} */}
            {/* <EditintgFrame /> */}
            {
                /**
                 * Lets create a new slice for handling konvajs canvas and its state.
                 */
            }
            {/* <input type="range" min={0} max={359} step={1} className="slider" /> */}
        </div>
    );
}

export default Toolbar;