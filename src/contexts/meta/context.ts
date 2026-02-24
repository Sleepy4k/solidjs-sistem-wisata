import { createContext } from 'solid-js';

interface IMetaContext {
  title: () => string;
  changeTitle: (title?: string) => void;
  sidebarRefresh: () => boolean;
  changeSidebarRefresh: (refresh?: boolean) => void;
}

const MetaContext = createContext<IMetaContext>({
  title: () => '',
  changeTitle: () => {},
  sidebarRefresh: () => false,
  changeSidebarRefresh: () => {},
});

export default MetaContext;