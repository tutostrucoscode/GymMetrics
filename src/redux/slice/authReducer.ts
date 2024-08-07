import { PayloadAction } from "@reduxjs/toolkit";
import { types } from "../types/types";

interface AuthState {
  uid: string;
  firestoreId?: string;
  name: string | null;
  email: string | null;
  urlimage: string | null;
}

interface LoginPayload {
  uid: string;
  name: string;
  email: string;
  urlimage: string;
}

const initialState: AuthState = {
  uid: "",
  firestoreId: "",
  name: null,
  email: null,
  urlimage: null,
};

export const authReducer = (
  state = initialState,
  action: PayloadAction<LoginPayload>
) => {
  switch (action.type) {
    case types.login:
      return {
        ...state,
        uid: action.payload.uid,
        name: action.payload.name,
        email: action.payload.email,
        urlimage: action.payload.urlimage,
      };
    case types.logout:
      return initialState;
    default:
      return state;
  }
};
