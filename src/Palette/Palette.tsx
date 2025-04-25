import { FC, useState } from "react";
import "./Palette.css";
import { useDispatch } from "react-redux";
import { setColor } from "../Slice/ClipPathSlice";

const Palette: FC = () => {
    const dispatch = useDispatch();

    const [paletteColors, setPaletteColors] = useState<string[]>([
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A8",
        "#33FFF5",
        "#F5FF33",
        "#FFA733",
        "#8D33FF",
        "#33FF8D",
        "#FF3333",
        "#33A8FF",
        "#A8FF33",
        "#FF5733",
        "#F533FF",
        "#33FF33",
        "#5733FF",
        "#FFC433",
        "#33FFF0",
        "#F033FF",
        "#57FF33",
        "#FF5733",
        "#33FF90",
        "#FFC433",
        "#FF33F5",
    ]);


    return (
        <div className="palette-container">
            {paletteColors.map((color, index) => (
                <div
                    className="palette-color"
                    key={index}
                    style={{ backgroundColor: color }}
                    onClick={() => dispatch(setColor(color))}
                ></div>
            ))}
        </div>

    )
}

export default Palette;