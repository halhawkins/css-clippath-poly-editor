import { FC, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setWidth, setHeight, setBackdropImg, settingBackdrop } from "../Slice/BackdropSlice";
import SizingBox from "./SizingBox";
import "./Backdrop.css";
const Backdrop:FC = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const rotation = useSelector((state: RootState) => state.backdropSlice.rotation);
    const backdropSrc = useSelector((state: RootState) => state.backdropSlice.imgSrc);
    const location =  {x:useSelector((state: RootState) => state.backdropSlice.x), y: useSelector((state: RootState) => state.backdropSlice.y)};
    const size = { width: useSelector((state: RootState) => state.backdropSlice.width), height: useSelector((state: RootState) => state.backdropSlice.height)};
    const inputRef = useRef<HTMLInputElement>(null);
    const isFormatting = useSelector((state: RootState) => state.backdropSlice.formatting);
    const isSetting = useSelector((state: RootState) => state.backdropSlice.setting);
    const opacity = useSelector((state: RootState) => state.backdropSlice.opacity);
    const isSet = useSelector((state: RootState) => state.backdropSlice.isSet);
    const dispatch = useDispatch();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {        
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            // setImgSrc(event.target.result);
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => { // Once the image has loaded, set the width and height in Redux, and set the dimensions state
                dispatch(setWidth(img.width))
                dispatch(setHeight(img.height))
                setDimensions({ width: img.width, height: img.height });
                dispatch(setBackdropImg(event.target.result));
                dispatch(settingBackdrop(false));
                dispatch(setWidth(img.width));
                dispatch(setHeight(img.height));
            }
          };
          reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        console.log("Backdrop mounted",inputRef, isSetting);
        if (inputRef.current && isSetting) {
            inputRef?.current.click();
        }
    }, [isSetting])

    return (
        <div className="backdrop">
            <input ref={inputRef} type="file" onChange={handleFileChange} style={{display:"none"}}/>
            {backdropSrc === null ? 
                <></> : 
                <>
                    {!isSet && isFormatting && dimensions && <SizingBox
                        x={location !== null ? location?.x : 0}
                        y={location !== null ? location?.y : 0}
                        width={size?.width}
                        height={size?.height}
                        rotation={0}>
                        <img src={backdropSrc} alt="backdrop"
                            style={{ 
                            position: 'relative',   
                            width: `${size?.width}px`,
                            height: `${size?.height}px`,
                            // top:`${location.y}px`,
                            // left:`${location.x}px`, 
                            // width: `${size?.width}px`, 
                            // height: `${size?.height}px`,
                            // transform: `rotate(${rotation}deg)`,
                            opacity: `${opacity}` 
                        }} 
                            />
                        </SizingBox>}
                </>
            }
        </div>
    );
}

export default Backdrop;
