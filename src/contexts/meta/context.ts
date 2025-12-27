import { createContext } from 'solid-js';

interface IMetaContext {
  title: () => string;
  changeTitle: (title?: string) => void;
}

const MetaContext = createContext<IMetaContext>({
  title: () => '',
  changeTitle: () => {},
});

export default MetaContext;