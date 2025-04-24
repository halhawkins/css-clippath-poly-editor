import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IPath {
    points: Array<{x:number, y:number}>,
}
export interface IPathInfo {
        name: string,
        stroke?: string,
        fill?: string,
        opacity: number,
        // zIndex: number,
        
        points?: Array<{x:number, y:number}>
    }
export interface IClipPathState {
    mouseLocation: { x: number, y: number },
    color: string,
    opacity: number,
    top: number,
    left: number,
    width: number,
    height: number,
    editingFrameColor: string,
    paths: Array<IPathInfo>|null;
    editing: number | null;
    pathNames: Array<string>, // Names for each path, for editing and display purposes.
    pathStrokes: Array<string>, // Strokes for each path, for editing purposes.
    fills: Array<string>, // Fills for each path, for editing purposes.
    addNewPath: boolean,
    currentPathName: string,  // Name for the current path being edited.
    savePath: boolean,
    needsUpdate: boolean,
}

export type ReorderPayload = {
    source: number;
    target: number;
    position: 'before' | 'after';   // you could call this insertBefore: boolean if you prefer
  };
  
const initialState: IClipPathState = {
    mouseLocation: { x: 0, y: 0 },
    color: '#00007e',
    editingFrameColor: '#000000',
    opacity: 1.0,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    paths: null,
    editing: null,
    pathNames: [], // Names for each path, for editing and display purposes.
    pathStrokes: [], // Strokes for each path, for editing purposes.
    fills: [], // Fills for each path, for editing purposes.
    addNewPath: false,
    currentPathName: '',
    savePath: false,
    needsUpdate: false,
};

const getRectangle = (points: Array<{x:number, y:number}>) => {
    const maxX = points.reduce((max, point) => Math.max(max, point.x), 0);
    const maxY = points.reduce((max, point) => Math.max(max, point.y), 0);
    const minX = points.reduce((min, point) => Math.min(min, point.x), Infinity);
    const minY = points.reduce((min, point) => Math.min(min, point.y), Infinity);
    return { width: maxX - minX, height: maxY - minY, top: minY, left: minX };
}

export const clippathSlice = createSlice({
    name: 'clippath',
    initialState,
    reducers: {
        reorderPaths: (state, {payload} : PayloadAction<ReorderPayload>) => {
            if (!state.paths) return;

            const { source, target, position } = payload;

            if (source === target) return;
            if (
                source < 0 || source >= state.paths.length ||
                target < 0 || target >= state.paths.length
            ) {
                return;
            }
            
            const [moved] = state.paths.splice(source, 1); // Remove the moved path from its original position

            let dest = position === 'before' ? target : target + 1; // Determine the destination index based on the position
            if (source < dest) dest -= 1;
            if (dest > state.paths.length) dest = state.paths.length;

            state.paths.splice(dest, 0, moved); 

            const syncArray = <T>(arr: T[]) => {
                const [v] = arr.splice(source, 1); // Remove the moved path from its original position
                arr.splice(dest, 0, v); // Insert it at the new position
            };
            syncArray(state.pathNames);
            syncArray(state.pathStrokes);
            syncArray(state.fills);
            state.needsUpdate = true;
        },
        createNewPath: (state, action:PayloadAction<boolean>) => {
            state.addNewPath = action.payload;
            if (!action.payload) {
                state.editing = null;
            }
        },
        addPath: (state, action: PayloadAction<IPathInfo>) => {
            console.log("addPath", action.payload)
            const paths = state.paths ? state.paths.map((path) => ({ ...path })) : [];
            paths.push(action.payload);
            state.editing = paths.length - 1; // Set the last path as the current editing path
            state.color = action.payload.fill || state.color;
            state.paths = paths;
            state.paths.forEach((path) => {
                if (path.points) {
                    const {top, left, width, height} = getRectangle(path.points);
                    state.top = top;
                    state.left = left;
                    state.width = width;
                    state.height = height;
                }
            })
        },
        incrementPath: (state, action: PayloadAction<number>) => {
            console.log("incrementPath", action.payload)
            const i = action.payload;
            const paths = state.paths;
            if (!paths) return;
      
            // only advance if i is in bounds and not already at the end
            if (i >= 0 && i < paths.length - 1) {
              // Immer lets us swap in place:
              [paths[i], paths[i + 1]] = [paths[i + 1], paths[i]];
      
              // (optional) if you were tracking `editing`, update it too:
              if (state.editing === i) {
                state.editing = i + 1;
              } else if (state.editing === i + 1) {
                state.editing = i;
              }
            }
          },
        decrementPath: (state, action: PayloadAction<number>) => {
            const i = action.payload;
            const paths = state.paths;
            if (!paths) return;
            // only advance if i is in bounds and not already at the beginning
            if (i > 0 && i < paths.length) {
              // Immer lets us swap in place:
              [paths[i], paths[i - 1]] = [paths[i - 1], paths[i]];

              // (optional) if you were tracking `editing`, update it too:
              if (state.editing === i) {
                state.editing = i - 1;
              } else if (state.editing === i - 1) {
                state.editing = i;
              }
            }
        },
        // setZIndex: (state, action: PayloadAction<{index: number, zIndex: number}>) => {
        //     state.paths?.forEach((path, index) => {
        //         if (index === action.payload.index) {
        //             path.zIndex = action.payload.zIndex;
        //         }
        //     });
        //     state.paths = state.paths ? [...state.paths] : null; // Trigger re-render with new paths array
        // },
      

        deletePath: (state, action: PayloadAction<number>) => {
            if (state.paths) {
                const paths = state.paths;
                paths.splice(action.payload, 1); // Remove the path at the specified index
                state.paths = paths
                // state.paths = paths;
                if (state.paths !== null) {
                state.paths.forEach((path) => {
                    if (path.points) {
                        const {top, left, width, height} = getRectangle(path.points);
                        state.top = top;
                        state.left = left;
                        state.width = width;
                        state.height = height;
                    }
                })}
                }
            state.editing = null; // Reset editing when a path is deleted
        },

        editPath: (state, action: PayloadAction<{index: number, path: IPathInfo}>) => {
            console.log("editPath", action.payload)
            if (state.paths) {
                state.paths[action.payload.index] = action.payload.path;
                state.editing = action.payload.index; // Set the edited path as the current editing path
                if (state.paths !== null) {
                    state.paths.forEach((path) => {
                        if (path.points) {
                            const {top, left, width, height} = getRectangle(path.points);
                            state.top = top;
                            state.left = left;
                            state.width = width;
                            state.height = height;
                        }
                    })}
                }
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
        savePathState: (state, action: PayloadAction<boolean>) => {
            state.savePath = action.payload;
        },
        setCurrentPathName: (state, action: PayloadAction<string>) => {
            state.currentPathName = action.payload;
        },
        setMouseLocation: (state, action: PayloadAction<{x: number, y: number}>) => {
            state.mouseLocation = action.payload;
        },
        setColor: (state, action: PayloadAction<string>) => {
            state.color = action.payload;
        },
        setPathOpacity: (state, action: PayloadAction<number>) => {
            state.opacity = action.payload;
        },
        setEditingFrameColor: (state, action: PayloadAction<string>) => {
            state.editingFrameColor = action.payload;
        },
        needsUpdate: (state, action: PayloadAction<boolean>) => {
            state.needsUpdate = action.payload;
        },
    }
})

export const { 
    reorderPaths,
    createNewPath, 
    addPath, 
    incrementPath,
    decrementPath,
    deletePath, 
    editPath, 
    setEditing, 
    setName, 
    setStroke, 
    setFill, 
    setCurrentPathName, 
    savePathState, 
    setMouseLocation, 
    setColor, 
    setPathOpacity,
    needsUpdate,
    // setZIndex,
    // reorderPaths,
    setEditingFrameColor} = clippathSlice.actions;

export default clippathSlice.reducer;