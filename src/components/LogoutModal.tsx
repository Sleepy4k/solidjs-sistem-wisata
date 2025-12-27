import { onCleanup, onMount } from "solid-js";

interface ILogoutModalProp {
  logoutHandler?: () => void;
}

export default function LogoutModal(props: ILogoutModalProp) {
  let modal: HTMLDivElement,
    cancelButton: HTMLButtonElement,
    confirmButton: HTMLButtonElement,
    buttonText: HTMLSpanElement;

  const handleCancelClick = () => {
    modal.classList.add("hidden");
  };

  const handleConfirmClick = () => {
    buttonText.textContent = "Logging out...";
    confirmButton.setAttribute("disabled", "true");
    if (props.logoutHandler) props.logoutHandler();
  };

  onMount(() => {
    cancelButton.addEventListener("click", handleCancelClick);
    confirmButton.addEventListener("click", handleConfirmClick);

    onCleanup(() => {
      cancelButton.removeEventListener("click", handleCancelClick);
      confirmButton.removeEventListener("click", handleConfirmClick);
    });
  });

  return (
    <div
      id="logout-modal"
      ref={(el) => (modal = el)}
      class="fixed inset-0 flex items-center justify-center hidden z-50 backdrop-blur-sm bg-black/20"
    >
      <div class="bg-white rounded-xl p-6 w-80 lg:w-120 shadow-xl border border-gray-200">
        <h2 class="text-lg font-semibold mb-2 text-gray-900">
          Konfirmasi Logout
        </h2>
        <p class="mb-6 text-gray-600">
          Apakah kamu yakin ingin logout? kamu akan diarahkan ke halaman login
          dan harus melakukan login kembali untuk mengakses dashboard.
        </p>
        <hr class="mb-4 border-gray-300" />
        <div class="flex justify-end gap-3">
          <button
            ref={(el) => (cancelButton = el)}
            class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            id="logoutConfirmBtn"
            class="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            ref={(el) => (confirmButton = el)}
          >
            <span ref={(el) => (buttonText = el)} class="logout-text">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
