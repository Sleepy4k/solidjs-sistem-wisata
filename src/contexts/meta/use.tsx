import { useContext } from "solid-js";
import MetaContext from "./context";

const useMeta = () => {
  const context = useContext(MetaContext);
  if (!context) throw new Error("Something went wrong when use meta context");

  return context;
};

export default useMeta;
