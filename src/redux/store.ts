import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
});

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
