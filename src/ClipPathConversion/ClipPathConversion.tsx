import { FC, useEffect, useState } from "react";
import "./ClipPathConversion.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setShowConversion } from "../Slice/appSlice";
const ClipPathConversion: FC = () => {
  const dispatch = useDispatch();
  const paths = useSelector((state: RootState) => state.clippathSlice.paths);
  const [conversionOutput, setConversionOutput] = useState<string>("");
  // const top = useSelector((state: RootState) => state.clippathSlice.top);
  // const left = useSelector((state: RootState) => state.clippathSlice.left);
  const width = useSelector((state: RootState) => state.appSlice.canvasWidth);
  const height = useSelector((state: RootState) => state.appSlice.canvasHeight);
  // const []
    // Conversion logic goes here
    const pointsToClipPathPercent = (
        points: Array<{ x: number; y: number }>,
        width: number,
        height: number
    ): string => {
        const coords = points
          .map(
            ({ x, y }) =>
              `${(x / width * 100).toFixed(2)}% ${(y / height * 100).toFixed(2)}%`
          )
          .join(", ");
        return `polygon(${coords})`;
      }
    
    useEffect(() => {
        let output = ``;
        if (paths) {
            paths.forEach((path) => {
              output += `.${path.name} {\n\tclip-path: `;
            if (path.points !== undefined) {
              const clipPath = pointsToClipPathPercent(path.points, width, height);
              console.log("Clip Path:", clipPath);
              output += clipPath + ";\n}\n";
            }
          })
          setConversionOutput(output);
        }
    }, [paths]);

    const handleClose = () => {
      dispatch(setShowConversion(false));
    }

    return (
        <div className="clip-path-conversion">
          <div className="conversion-header">Clip Path Conversion <div onClick={handleClose} style={{alignSelf:"flex-end"}}>x</div></div>
          <pre>{conversionOutput}</pre>
          {/* {conversionOutput.slice(0, -2) || "No paths to convert" } */}
        </div>
        )
}

export default ClipPathConversion;
