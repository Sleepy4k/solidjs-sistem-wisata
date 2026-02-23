import { For, onCleanup, onMount, Show, createSignal } from "solid-js";
import { getToasts, removeToast, IToast, pauseToast, resumeToast } from "../utils/toast";
import Fa from "solid-fa";
import {
  faCheckCircle,
  faTimes,
  faInfoCircle,
  faBug,
} from "@fortawesome/free-solid-svg-icons";

const variantColor = (type: IToast["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    case "info":
      return "bg-blue-50 border-blue-200 text-blue-800";
    case "debug":
      return "bg-gray-50 border-gray-200 text-gray-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
};

function IconFor(type: IToast["type"]) {
  switch (type) {
    case "success":
      return faCheckCircle;
    case "error":
      return faTimes;
    case "info":
      return faInfoCircle;
    case "debug":
      return faBug;
    default:
      return faInfoCircle;
  }
}

function ToastItem(props: { toast: IToast }) {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => {
    requestAnimationFrame(() => setMounted(true));
  });

  return (
    <div
      class={
        "border shadow-sm rounded-lg p-3 flex items-start gap-3 transform transition-all duration-300 " +
        variantColor(props.toast.type)
      }
      classList={{
        "opacity-0 -translate-y-2 scale-95": !!props.toast.closing || !mounted(),
        "opacity-100 translate-y-0 scale-100": mounted() && !props.toast.closing,
      }}
      onMouseEnter={() => pauseToast(props.toast.id)}
      onMouseLeave={() => resumeToast(props.toast.id)}
    >
      <div class="pt-0.5 w-6 text-center">
        <Fa icon={IconFor(props.toast.type)} />
      </div>
      <div class="flex-1">
        <Show when={props.toast.title}>
          <div class="font-semibold mb-1">{props.toast.title}</div>
        </Show>
        <div class="text-sm">{props.toast.message}</div>
      </div>
      <div class="flex items-start">
        <button
          class="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => removeToast(props.toast.id)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function Toast() {
  let interval: number | undefined;

  onMount(() => {
    // placeholder
  });

  onCleanup(() => {
    if (interval) clearInterval(interval);
  });

  return (
    <div class="fixed right-4 top-4 z-50 flex flex-col gap-3 w-96">
      <For each={getToasts()}>
        {(toast: IToast) => <ToastItem toast={toast} />}
      </For>
    </div>
  );
}
