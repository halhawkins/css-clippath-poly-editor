import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface IBackdropState {
    imgSrc: string|null;
    isVisible: boolean;
    opacity: number;
    scale: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    setting: boolean;
    formatting: boolean;
    isSet: boolean;
}

const initialState: IBackdropState = {
    imgSrc: null,
    isVisible: false,
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    setting: false,
    formatting: false,
    isSet: false,
};

export const backdropSlice = createSlice({
    name: 'backdrop',
    initialState,
    reducers: {
        setBackdropImg: (state, action: PayloadAction<string|null>) => {
            state.imgSrc = action.payload;
            state.isVisible = true;
            state.opacity = 0.5;
            state.scale = 0.8;
            state.x = 0;
            state.y = 0;
            state.rotation = 0;
            // state.setting = false;
            // state.formatting = false;
        },
        hideBackdrop: (state) => {
            state.isVisible = false;
        },
        setWidth: (state, action: PayloadAction<number>) => {
            state.width = action.payload;
        },
        setHeight: (state, action: PayloadAction<number>) => {
            state.height = action.payload;
        },
        moveBackdrop: (state, action: PayloadAction<{ x: number, y: number }>) => {
            state.x = action.payload.x;
            state.y = action.payload.y;
        },
        rotateBackdrop: (state, action: PayloadAction<number>) => {
            state.rotation = action.payload;
        },
        settingBackdrop: (state, action: PayloadAction<boolean>) => {
            state.setting = action.payload;
        },
        formattingBackdrop: (state, action: PayloadAction<boolean>) => {
            state.formatting = action.payload;
        },
        setOpacity: (state, action: PayloadAction<number>) => {
            state.opacity = action.payload;
        },
        setRotation: (state, action: PayloadAction<number>) => {
            state.rotation = action.payload;
        },
        setIsSet: (state, action: PayloadAction<boolean>) => {
            state.isSet = action.payload;
        }
    }
})

export const { setBackdropImg, hideBackdrop, setHeight, setWidth, moveBackdrop, rotateBackdrop, settingBackdrop, formattingBackdrop, setRotation, setOpacity, setIsSet } = backdropSlice.actions;

export default backdropSlice.reducer;