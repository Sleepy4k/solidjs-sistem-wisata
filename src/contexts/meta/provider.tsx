import { APP_NAME } from '@consts';
import MetaContext from './context';
import { createSignal } from 'solid-js';

interface IProviderProp {
  children: any;
}

const MetaProvider = (props: IProviderProp) => {
  const [title, setTitle] = createSignal<string>(APP_NAME);
  const [sidebarRefresh, setSidebarRefresh] = createSignal<boolean>(false);

  const changeTitle = (title?: string) => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    setTitle(title || APP_NAME);
  };

  const changeSidebarRefresh = (refresh?: boolean) => {
    setSidebarRefresh(refresh || false);
  };

  return (
    <MetaContext.Provider value={{ title, changeTitle, sidebarRefresh, changeSidebarRefresh }}>
      {props.children}
    </MetaContext.Provider>
  );
};

export default MetaProvider;