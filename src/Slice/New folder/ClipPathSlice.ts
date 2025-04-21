import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IPath {
    points: Array<{x:number, y:number}>,
}
export interface IPathInfo {
        name: string,
        stroke?: string,
        fill?: string,
        points?: Array<{x:number, y:number}>
    }
export interface IClipPathState {
    mouseLocation: { x: number, y: number },
    paths: Array<IPathInfo>,
    editing: number | null;
    pathNames: Array<string>, // Names for each path, for editing and display purposes.
    pathStrokes: Array<string>, // Strokes for each path, for editing purposes.
    fills: Array<string>, // Fills for each path, for editing purposes.
    addNewPath: boolean,
    currentPath: IPathInfo, 
    savePath: boolean,
}

const initialState: IClipPathState = {
    mouseLocation: { x: 0, y: 0 },
    paths: [],
    editing: null,
    pathNames: [], // Names for each path, for editing and display purposes.
    pathStrokes: [], // Strokes for each path, for editing purposes.
    fills: [], // Fills for each path, for editing purposes.
    addNewPath: false,
    currentPath: {
        name: 'New Path',
        stroke: '#00000000',
        fill: '#000000ff',
        points: [],
    },
    savePath: false,
};

export const clippathSlice = createSlice({
    name: 'clippath',
    initialState,
    reducers: {
        createNewPath: (state, action:PayloadAction<boolean>) => {
            state.addNewPath = action.payload;
        },
        addPath: (state, action: PayloadAction<IPathInfo>) => {
            state.paths = [...state.paths, action.payload];
        },
        deletePath: (state, action: PayloadAction<number>) => {
            state.paths = state.paths.filter((_, index) => index!== action.payload);
        },
        editPath: (state, action: PayloadAction<{index: number, path: IPathInfo}>) => {
            state.paths[action.payload.index] = action.payload.path;
        },
        setEditing: (state, action: PayloadAction<number | null>) => {
            state.editing = action.payload;
        },
        setName: (state, action: PayloadAction<{index: number, name: string}>) => {
            state.pathNames[action.payload.index] = action.payload.name;
        },
        setStroke: (state, action: PayloadAction<{index: number, stroke: string}>) => {
            state.pathStrokes[action.payload.index] = action.payload.stroke;
        },
        setFill: (state, action: PayloadAction<{index: number, fill: string}>) => {
            state.fills[action.payload.index] = action.payload.fill;
        },
        setCurrentPath: (state, action: PayloadAction<IPathInfo>) => {
            state.currentPath = action.payload;
        },
        savePathState: (state, action: PayloadAction<boolean>) => {
            state.savePath = action.payload;
        },
        setMouseLocation: (state, action: PayloadAction<{x: number, y: number}>) => {
            state.mouseLocation = action.payload;
        },
    }
})

export const { createNewPath, addPath, deletePath, editPath, setEditing, setName, setStroke, setFill, setCurrentPath, savePathState} = clippathSlice.actions;

export default clippathSlice.reducer;