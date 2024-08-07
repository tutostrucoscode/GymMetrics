/* eslint-disable @typescript-eslint/no-explicit-any */
import { signOut } from "firebase/auth";
import { auth } from "../../configs/firebase";
import { types } from "../types/types";

// hace la accion de login, almacena la data del usuario
export const login = (
  uid: string,
  name: string | null,
  email: string | null,
  urlimage: string | null
) => ({
  type: types.login,
  payload: {
    uid,
    name,
    email,
    urlimage,
  },
});

// hace la accion de logout, elimina la data del usuario de redux y los del firebase auth
export const startLogout = () => {
  return async (dispatch: any) => {
    await signOut(auth);
    dispatch(logout());
  };
};

// se comunica con el reducer para eliminar la data del usuario
export const logout = () => ({
  type: types.logout,
});
