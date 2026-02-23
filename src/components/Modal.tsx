import { Component, Show } from "solid-js";

interface ModalProps {
  show: boolean;
  title?: string;
  onClose?: () => void;
  children?: any;
}

const Modal: Component<ModalProps> = (props) => {
  return (
    <Show when={props.show}>
      <div class="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4 sm:py-8 overflow-auto">
        <div class="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg md:text-xl font-bold text-gray-800">{props.title}</h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              onClick={() => props.onClose && props.onClose()}
            >
              ×
            </button>
          </div>

          <div>{props.children}</div>
        </div>
      </div>
    </Show>
  );
};

export default Modal;
