import { useContext } from "react";
import AuthContext from "../context/AuthContext";

// Shortcut hook — avoids importing both useContext and AuthContext everywhere
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
