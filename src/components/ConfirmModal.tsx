import { Component } from "solid-js";
import Modal from "./Modal";

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
}

const ConfirmModal: Component<ConfirmModalProps> = (props) => {
  return (
    <Modal show={props.show} title={props.title} onClose={props.onCancel}>
      <div class="space-y-4">
        <p class="text-sm text-gray-700">{props.message}</p>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            class="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => props.onCancel && props.onCancel()}
            disabled={props.loading}
          >
            Batal
          </button>

          <button
            class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200"
            onClick={() => props.onConfirm && props.onConfirm()}
            disabled={props.loading}
          >
            {props.loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
