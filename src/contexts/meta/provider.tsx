import { APP_NAME } from '@consts';
import MetaContext from './context';
import { createSignal, JSXElement } from 'solid-js';

interface IProviderProp {
  children: any;
}

const MetaProvider = (props: IProviderProp) => {
  const [title, setTitle] = createSignal(APP_NAME);

  const changeTitle = (title?: string) => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    setTitle(title || APP_NAME);
  };

  return (
    <MetaContext.Provider value={{ changeTitle }}>
      {props.children}
    </MetaContext.Provider>
  );
};

export default MetaProvider;