import { createSignal, For, onMount, Show } from "solid-js";
import {
  getToasts,
  removeToast,
  IToast,
  pauseToast,
  resumeToast,
} from "../utils/toast";
import Fa from "solid-fa";
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faBug,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const variantTokens = (type: IToast["type"]) => {
  switch (type) {
    case "success":
      return {
        bar: "bg-emerald-500",
        icon: "text-emerald-500",
        bg: "bg-white",
        border: "border-emerald-200",
        accent: "border-l-emerald-500",
        title: "text-gray-900",
        msg: "text-gray-600",
        close: "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
        fa: faCheckCircle,
      };
    case "error":
      return {
        bar: "bg-red-500",
        icon: "text-red-500",
        bg: "bg-white",
        border: "border-red-200",
        accent: "border-l-red-500",
        title: "text-gray-900",
        msg: "text-gray-600",
        close: "text-gray-400 hover:text-red-600 hover:bg-red-50",
        fa: faExclamationCircle,
      };
    case "info":
      return {
        bar: "bg-blue-500",
        icon: "text-blue-500",
        bg: "bg-white",
        border: "border-blue-200",
        accent: "border-l-blue-500",
        title: "text-gray-900",
        msg: "text-gray-600",
        close: "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
        fa: faInfoCircle,
      };
    case "debug":
    default:
      return {
        bar: "bg-gray-400",
        icon: "text-gray-500",
        bg: "bg-white",
        border: "border-gray-200",
        accent: "border-l-gray-400",
        title: "text-gray-900",
        msg: "text-gray-600",
        close: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
        fa: faBug,
      };
  }
};

function ToastItem(props: { toast: IToast }) {
  const [mounted, setMounted] = createSignal(false);
  const tk = variantTokens(props.toast.type);

  onMount(() => {
    requestAnimationFrame(() => setMounted(true));
  });

  return (
    <div
      class={[
        "relative flex items-start gap-3 rounded-xl shadow-lg border border-l-4 px-4 py-3.5",
        "w-full max-w-sm transition-all duration-300 ease-out select-none",
        tk.bg,
        tk.border,
        tk.accent,
      ].join(" ")}
      classList={{
        "opacity-0 translate-x-6 scale-95 pointer-events-none":
          !!props.toast.closing || !mounted(),
        "opacity-100 translate-x-0 scale-100":
          mounted() && !props.toast.closing,
      }}
      onMouseEnter={() => pauseToast(props.toast.id)}
      onMouseLeave={() => resumeToast(props.toast.id)}
      role="alert"
      aria-live="assertive"
    >
      <span
        class={["mt-0.5 flex-shrink-0 text-xl leading-none", tk.icon].join(" ")}
      >
        <Fa icon={tk.fa} />
      </span>

      <div class="flex-1 min-w-0 pr-1">
        <Show when={props.toast.title}>
          <p class={["text-sm font-semibold leading-snug", tk.title].join(" ")}>
            {props.toast.title}
          </p>
        </Show>
        <p class={["text-sm leading-relaxed mt-0.5", tk.msg].join(" ")}>
          {props.toast.message}
        </p>
      </div>

      <button
        type="button"
        class={[
          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
          "text-sm transition-colors duration-150 cursor-pointer -mt-0.5 -mr-0.5",
          tk.close,
        ].join(" ")}
        onClick={() => removeToast(props.toast.id)}
        aria-label="Tutup notifikasi"
      >
        <Fa icon={faTimes} />
      </button>

      <Show when={props.toast.timeout && props.toast.timeout > 0}>
        <div
          class={["absolute bottom-0 left-0 h-[3px] rounded-b-xl", tk.bar].join(
            " ",
          )}
          style={{
            width: "100%",
            animation: `shrink ${props.toast.timeout}ms linear forwards`,
          }}
        />
      </Show>
    </div>
  );
}

export default function Toast() {
  return (
    <>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div
        class={[
          "fixed z-[9999] flex flex-col-reverse gap-2.5 pointer-events-none",
          "bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)]",
          "sm:left-auto sm:right-5 sm:translate-x-0 sm:w-96",
        ].join(" ")}
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notifikasi"
      >
        <For each={getToasts()}>
          {(toast: IToast) => (
            <div class="pointer-events-auto w-full">
              <ToastItem toast={toast} />
            </div>
          )}
        </For>
      </div>
    </>
  );
}
