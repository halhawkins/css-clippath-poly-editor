import { configureStore } from "@reduxjs/toolkit";
import { clippathSlice } from "./src/Slice/ClipPathSlice";
import { backdropSlice } from "./src/Slice/BackdropSlice";
import { appSlice } from "./src/Slice/appSlice";
// import { backdropSlice } from "./src/Backdrop/BackdropSlice";
// import { clippathSlice } from "./src/ClipPath/ClipPathSlice";

export const store = configureStore({
    reducer: {
        // backdropSlice : backdropSlice.reducer,
        clippathSlice : clippathSlice.reducer,
        backdropSlice : backdropSlice.reducer,
        appSlice: appSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
