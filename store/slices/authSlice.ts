import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  isLoggedIn: boolean;
  userName: string | null;
  token: string | null;
}

const initialState: AuthState = {
  isLoggedIn: !!Cookies.get("travel_token"),
  userName: null,
  token: Cookies.get("travel_token") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginState: (state, action: PayloadAction<{ userName: string; token: string }>) => {
      state.isLoggedIn = true;
      state.userName = action.payload.userName;
      state.token = action.payload.token;
    },
    setLogoutState: (state) => {
      state.isLoggedIn = false;
      state.userName = null;
      state.token = null;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    }
  }
});

export const { setLoginState, setLogoutState, setUserName } = authSlice.actions;
export default authSlice.reducer;
