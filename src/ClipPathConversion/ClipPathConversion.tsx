import { FC, useEffect, useState, useRef } from "react";
import "./ClipPathConversion.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setShowConversion } from "../Slice/appSlice";
import { addPath, deletePath, IPathInfo } from "../Slice/ClipPathSlice";


const DownloadPolygons: FC = () => {
    const polygons = useSelector((state: RootState) => state.clippathSlice.paths);
    const handleDownload = () => {
        if (!polygons) return;                       // Nothing to save
    
        // 1) Serialize with pretty‑printing (optional)
        const json = JSON.stringify(polygons, null, 2);
    
        // 2) Wrap it in a Blob so the browser treats it as a file
        const blob = new Blob([json], {
          type: "application/json;charset=utf‑8",
        });
    
        // 3) Create an object‑URL for that Blob
        const url = URL.createObjectURL(blob);
    
        // 4) Fire off a synthetic click on a temporary <a download>
        const a = document.createElement("a");
        a.href = url;
        a.download = "polygons.json";
        document.body.appendChild(a); // Firefox needs the element in the DOM
        a.click();
    
        // 5) House‑keeping
        a.remove();
        URL.revokeObjectURL(url);      // Free up the memory
      };
    
      return (
        <button onClick={handleDownload} disabled={!polygons} style={{padding:"1px 2px"}}>
          Download polygons.json
        </button>
      );    
}

const UploadPolygons: FC<{onLoad:(polygons: IPathInfo[] | null) => void}> = ({onLoad}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Opens the hidden <input type="file"> */
  const openFilePicker = () => fileInputRef.current?.click();

  /** Reads the chosen file, parses it, and hands it back via onLoad */
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;      // user cancelled

    try {
      if (file.type && file.type !== "application/json") {
        throw new Error("Not a JSON file");
      }

      // Modern: use Blob.text(); File inherits from Blob
      const text = await file.text();
      const raw = JSON.parse(text);

      // rudimentary validation – replace / expand as needed
      if (!Array.isArray(raw)) throw new Error("File root is not an array");

      const polygons: IPathInfo[] = raw.map((p, i) => {
        // console.log("🐰🐰🐰Polygon:", p);
        if (
          typeof p.name !== "string" ||
          // typeof p.fill !== "string" ||
          // typeof p.opacity !== "number" ||
          typeof p.points !== "object" ||
          typeof p.zIndex !== "number"
        ) {
          throw new Error(`Object at index ${i} is missing required fields`);
        }
        return p as IPathInfo;
      });

      onLoad(polygons);   // success
    } catch (err) {
      console.error(err);
      alert(
        `Failed to load file: ${
          err instanceof Error ? err.message : "unknown error"
        }`,
      );
      onLoad(null);       // signal failure
    } finally {
      // clear the input so selecting the same file again fires change
      e.target.value = "";
    }
  };

  return (
    <>
      <button onClick={openFilePicker}>Load polygons.json</button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  )
}

const ClipPathConversion: FC = () => {
  const [loadedPolygons, setLoadedPolygons] = useState<IPathInfo[] | null>(null);
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
              output += `.${path.name} {\n\tbackground-color: ${path.fill};\n\tclip-path: `;
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

    useEffect(() => {
      console.log("Loaded polygons:", loadedPolygons);
      if (loadedPolygons) {
        if (paths) {
          paths.forEach((path, index) => {
            dispatch(deletePath(index))
          })
        }
        loadedPolygons.forEach((path) => {
          dispatch(addPath(path))
        })
      }

    }, [loadedPolygons]);

    return (
        <div className="clip-path-conversion">
          <div className="conversion-header">Clip Path Conversion <DownloadPolygons /><UploadPolygons onLoad={setLoadedPolygons}/> <div onClick={handleClose} style={{alignSelf:"flex-end"}}>x</div></div>
          <pre>{conversionOutput}</pre>
          {/* {conversionOutput.slice(0, -2) || "No paths to convert" } */}
        </div>
    )
}
export { UploadPolygons, DownloadPolygons };
export default ClipPathConversion;
