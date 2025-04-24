import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IAppState {
    zoom: number;
    panX: number;
    panY: number;
    canvasWidth: number;
    canvasHeight: number;
    stageWidth: number,
    stageHeight: number,
    showConversions: boolean;
    showStageoptions: boolean;  // Add this line to your state
    showStage: boolean;  // Add this line to your state
}

export const initialState: IAppState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    canvasWidth: 500,  // Add this line to your state
    canvasHeight: 500,  // Add this line to your state
    stageWidth: 500,
    stageHeight: 500,
    showConversions: false,  // Add this line to your state
    showStageoptions: false,
    showStage: true,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setZoom: (state, action: PayloadAction<number>) => {
            state.zoom = action.payload;
        },
        setPanX: (state, action: PayloadAction<number>) => {
            state.panX = action.payload;
        },
        setPanY: (state, action: PayloadAction<number>) => {
            state.panY = action.payload;
        },
        setStoreCanvasWidth: (state, action: PayloadAction<number>) => {
            state.canvasWidth = action.payload;
        },
        setStoreCanvasHeight: (state, action: PayloadAction<number>) => {
            state.canvasHeight = action.payload;
        },
        setStageWidth: (state, action: PayloadAction<number>) => {
            state.stageWidth = action.payload;
        },
        setStageHeight: (state, action: PayloadAction<number>) => {
            state.stageHeight = action.payload;
        },
        setShowConversion: (state, action: PayloadAction<boolean>) => {
            state.showConversions = action.payload;
        },  
        setShowStageOptions: (state, action: PayloadAction<boolean>) => {
            state.showStageoptions = action.payload;
        },
        setShowStage: (state, action: PayloadAction<boolean>) => {
            state.showStage = action.payload;
        },
    },
});

export const { 
    setZoom, 
    setPanX, 
    setPanY, 
    setStoreCanvasWidth, 
    setStoreCanvasHeight, 
    setShowConversion, 
    setStageHeight,
    setShowStageOptions,
    setStageWidth,
    setShowStage } = appSlice.actions;