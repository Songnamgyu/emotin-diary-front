// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { forceLogout, setTokens } from "./slice/authSlice";
import { registerAuthHandlers } from "../service/client";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

// 콜백 주입
registerAuthHandlers({
    forceLogout: () => store.dispatch(forceLogout()),
    tokenRefresh: (tokenSet) => store.dispatch(setTokens(tokenSet)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
