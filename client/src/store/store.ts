import {
  configureStore,
  combineReducers,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import { api } from "./api"; // Assuming api contains your RTK Query setup
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

export interface UserRoles {
  userRoles: string;
}

const initialState: UserRoles = {
  userRoles: "",
};

export const userRolesSlice = createSlice({
  name: "userRoles",
  initialState,
  reducers: {
    setUserRoles: (state, action: PayloadAction<string>) => {
      state.userRoles = action.payload;
    },
  },
});
export const { setUserRoles } = userRolesSlice.actions;

// Combine reducers including RTK Query and auth slice
const rootReducer = combineReducers({
  auth: authSlice,
  userRoles: userRolesSlice.reducer,
  [api.reducerPath]: api.reducer, // API reducer from RTK Query
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with middleware for RTK Query and redux-persist
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware), // Add the api middleware from RTK Query
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
