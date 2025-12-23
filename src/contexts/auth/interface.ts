import { Accessor, JSXElement } from "solid-js";
import { EAuthUpdateCategory } from "@enums";

interface IProviderProp {
  children: JSXElement;
}

interface IAuthUserData {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  role: string;
  permissions: string[];
}

interface IAuthContext {
  user: Accessor<IAuthUserData|null>;
  isLogged: Accessor<boolean>;
  authToken: Accessor<string>;
  updateData: (category: EAuthUpdateCategory, data: any) => void;
  logoutUser: () => void;
  checked: Accessor<boolean>;
}

export type {
  IProviderProp,
  IAuthUserData,
  IAuthContext,
};
