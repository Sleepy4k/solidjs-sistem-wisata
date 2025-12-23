import { createContext } from "solid-js";
import { IAuthContext } from "./interface";

const AuthContext = createContext<IAuthContext>();

export default AuthContext;
