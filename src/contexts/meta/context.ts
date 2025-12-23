import { createContext } from 'solid-js';

interface IMetaContext {
  changeTitle: (title?: string) => void;
}

const MetaContext = createContext<IMetaContext>({
  changeTitle: () => {},
});

export default MetaContext;