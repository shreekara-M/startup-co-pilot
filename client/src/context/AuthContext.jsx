import { createContext, useReducer, useEffect } from "react";
import { getMeApi } from "../api/auth.api";

// ─── Auth Context ───────────────────────────────────────
//
// Global auth state using Context + useReducer.
//
// State shape:
//   { user, token, loading }
//
// On app mount:
//   1. Read token from localStorage
//   2. If token exists → call GET /auth/me to validate
//   3. Valid → set user + token
//   4. Invalid → clear stale token

const AuthContext = createContext(null);

// ─── Reducer ────────────────────────────────────────────

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// ─── Provider ───────────────────────────────────────────

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: validate existing token
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const user = await getMeApi();
        dispatch({
          type: "LOGIN",
          payload: { user, token },
        });
      } catch {
        // Token is invalid or expired — clean up
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    };

    validateToken();
  }, []);

  // ─── Actions ────────────────────────────────────────

  const login = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "LOGIN", payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: !!state.token && !!state.user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
