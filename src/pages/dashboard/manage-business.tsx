import { Meta } from "@contexts";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "@solidjs/router";
import { ucFirst, success, error as toastError } from "@utils";
import { api, saveFormulas, getFormulas, getFieldsData } from "@services";
import Fa from "solid-fa";
import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";

interface FieldOption {
  label: string;
  value: string;
}

interface BusinessField {
  id: string;
  label: string;
  name: string;
  type: string;
  order: number;
  placeholder: string;
  required: boolean;
  filterable: boolean;
  validation: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  options: FieldOption[];
  expanded: boolean;
}

type FormulaOperator = "*" | "+" | "-" | "/";

interface Formula {
  id: string;
  field_a: string;
  operator: FormulaOperator;
  field_b: string;
  result: string;
  result_label: string;
  order: number;
}

const INPUT_TYPES = [
  { value: "text", label: "Teks" },
  { value: "number", label: "Angka" },
  { value: "currency", label: "Mata Uang" },
  { value: "date", label: "Tanggal" },
  { value: "datetime", label: "Tgl & Waktu" },
  { value: "select", label: "Pilihan" },
  { value: "textarea", label: "Teks Panjang" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "boolean", label: "Ya / Tidak" },
];

const TYPE_COLORS: Record<string, string> = {
  text: "bg-slate-100 text-slate-600",
  number: "bg-orange-50 text-orange-600",
  currency: "bg-emerald-50 text-emerald-600",
  date: "bg-blue-50 text-blue-600",
  datetime: "bg-indigo-50 text-indigo-600",
  select: "bg-purple-50 text-purple-600",
  textarea: "bg-slate-100 text-slate-600",
  email: "bg-pink-50 text-pink-600",
  url: "bg-cyan-50 text-cyan-600",
  boolean: "bg-teal-50 text-teal-600",
};

const OPERATOR_LABELS: Record<FormulaOperator, string> = {
  "*": "x  Kali",
  "+": "+  Tambah",
  "-": "-  Kurang",
  "/": "÷  Bagi",
};

const OPERATOR_SYMBOLS: Record<FormulaOperator, string> = {
  "*": "x",
  "+": "+",
  "-": "-",
  "/": "÷",
};

const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const placeholderFor = (lbl: string): string => {
  if (!lbl) return "";
  return `Masukkan ${lbl.charAt(0).toLowerCase()}${lbl.slice(1)}`;
};

const toSlugLocal = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

function buildValidationRules(f: BusinessField): string[] {
  const rules: string[] = [];
  if (f.required) rules.push("required");
  switch (f.type) {
    case "currency":
    case "number":
      rules.push("numeric");
      if (f.validation.min !== undefined && !isNaN(f.validation.min))
        rules.push(`min:${f.validation.min}`);
      if (f.validation.max !== undefined && !isNaN(f.validation.max))
        rules.push(`max:${f.validation.max}`);
      break;
    case "text":
    case "textarea":
      rules.push("string");
      if (f.validation.minLength !== undefined && !isNaN(f.validation.minLength))
        rules.push(`min:${f.validation.minLength}`);
      if (f.validation.maxLength !== undefined && !isNaN(f.validation.maxLength))
        rules.push(`max:${f.validation.maxLength}`);
      break;
    case "email":
      rules.push("email");
      break;
    case "url":
      rules.push("url");
      break;
  }
  if (f.type === "select" && f.options.length) {
    const vals = f.options.map((o) => o.value).filter(Boolean).join(",");
    if (vals) rules.push(`in:${vals}`);
  }
  if (f.validation.pattern) rules.push(`regex:${f.validation.pattern}`);
  return rules;
}

function serializeField(f: BusinessField, index: number) {
  return {
    name: f.name,
    label: f.label,
    type: f.type === "currency" ? "number" : f.type,
    order: index + 1,
    placeholder: f.placeholder,
    validation_rules: buildValidationRules(f),
    options:
      f.type === "select"
        ? f.options.map((o) => ({ value: o.value, label: o.label })).filter((o) => o.value)
        : [],
  };
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "transition-all duration-200 bg-white placeholder-gray-300 text-gray-800";

const labelCls =
  "block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1.5";

const sectionDivider = (title: string) => (
  <div class="flex items-center gap-2 pt-1">
    <span class="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-300">{title}</span>
    <div class="flex-1 h-px bg-gray-100" />
  </div>
);

const formulaSelectCls =
  "w-full px-3 py-2.5 text-sm border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white text-gray-800";

interface FieldItemProps {
  field: BusinessField;
  idx: number;
  resultFieldNames: Set<string>;
  draggingIndex: () => number | null;
  toggleExpand: (id: string) => void;
  removeField: (id: string) => void;
  updateLabel: (id: string, label: string) => void;
  updateField: (id: string, key: keyof BusinessField, value: any) => void;
  updateValidation: (id: string, key: string, value: any) => void;
  addOption: (id: string) => void;
  updateOption: (
    fieldId: string,
    idx: number,
    key: keyof FieldOption,
    val: string
  ) => void;
  removeOption: (fieldId: string, idx: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (targetIndex: number) => void;
  onDragEnd: () => void;
}

const FieldItem: Component<FieldItemProps> = (props) => {
  const { field, idx } = props;
  const dragging = () => props.draggingIndex() === idx;

  return (
    <div
      class="bg-gray-50 rounded-xl border border-gray-200/60 overflow-hidden transition-opacity"
      draggable={true}
      onDragStart={() => props.onDragStart(idx)}
      onDragOver={props.onDragOver}
      onDrop={() => props.onDrop(idx)}
      onDragEnd={props.onDragEnd}
      classList={{ "opacity-40": dragging() }}
    >
      <div class="flex items-center gap-2.5 px-3.5 py-3">
        <Fa
          icon={solidIcons.faGripVertical}
          class="text-gray-300 cursor-grab flex-shrink-0"
        />
        <div class="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span class="text-[9px] font-bold text-gray-500">{idx + 1}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <p class="text-sm font-semibold text-gray-800 truncate leading-tight">
              {field.label}
            </p>
            <Show when={props.resultFieldNames.has(field.name)}>
              <span class="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-600">
                <Fa icon={solidIcons.faCalculator} class="text-[8px]" />
                AUTO
              </span>
            </Show>
          </div>
          <p class="text-[10px] text-gray-400 font-mono truncate">{field.name}</p>
        </div>

        <span
          class={`hidden sm:block text-[10px] font-bold px-2.5 py-1 rounded-lg ${
            TYPE_COLORS[field.type] ?? "bg-gray-100 text-gray-500"
          }`}
        >
          {INPUT_TYPES.find((t) => t.value === field.type)?.label ?? field.type}
        </span>

        <div class="flex items-center gap-0.5">
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
            onClick={() => props.toggleExpand(field.id)}
          >
            <Fa
              icon={
                field.expanded
                  ? solidIcons.faChevronUp
                  : solidIcons.faChevronDown
              }
              class="text-xs"
            />
          </button>
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer"
            onClick={() => props.removeField(field.id)}
          >
            <Fa icon={solidIcons.faTrash} class="text-[10px]" />
          </button>
        </div>
      </div>

      <Show when={field.expanded}>
        <div class="border-t border-gray-200/60 bg-white px-4 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class={labelCls}>Label</label>
              <input
                type="text"
                class={inputCls}
                value={field.label}
                onInput={(e) => props.updateLabel(field.id, e.currentTarget.value)}
              />
            </div>
            <div>
              <label class={labelCls}>
                Nama Field{" "}
                <span class="normal-case font-normal tracking-normal text-gray-300">
                  (snake_case)
                </span>
              </label>
              <input
                type="text"
                class={`${inputCls} font-mono`}
                value={field.name}
                onInput={(e) =>
                  props.updateField(
                    field.id,
                    "name",
                    toSlugLocal(e.currentTarget.value)
                  )
                }
              />
            </div>
          </div>

          <div>
            <label class={labelCls}>Jenis Input</label>
            <div class="flex flex-wrap gap-1.5">
              <For each={INPUT_TYPES}>
                {(t) => (
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
                    classList={{
                      [`${
                        TYPE_COLORS[t.value] ?? "bg-gray-800 text-white"
                      } border-transparent shadow-sm`]: field.type === t.value,
                      "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50":
                        field.type !== t.value,
                    }}
                    onClick={() => props.updateField(field.id, "type", t.value)}
                  >
                    {t.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div>
            <label class={labelCls}>Petunjuk Pengisian</label>
            <input
              type="text"
              class={inputCls}
              placeholder="cth. Masukkan jumlah dalam rupiah..."
              value={field.placeholder}
              onInput={(e) =>
                props.updateField(field.id, "placeholder", e.currentTarget.value)
              }
            />
          </div>

          {/* Toggles */}
          <div class="flex flex-wrap gap-3">
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="w-4 h-4 rounded text-blue-600"
                checked={field.required}
                onChange={(e) =>
                  props.updateField(field.id, "required", e.currentTarget.checked)
                }
              />
              <span class="text-xs font-medium text-gray-600">Wajib diisi</span>
            </label>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="w-4 h-4 rounded text-blue-600"
                checked={field.filterable}
                onChange={(e) =>
                  props.updateField(field.id, "filterable", e.currentTarget.checked)
                }
              />
              <span class="text-xs font-medium text-gray-600">Bisa difilter</span>
            </label>
          </div>

          {sectionDivider("Aturan Validasi")}

          <Show when={field.type === "number" || field.type === "currency"}>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class={labelCls}>Nilai Minimum</label>
                <input
                  type="number"
                  class={inputCls}
                  placeholder="0"
                  value={field.validation.min ?? ""}
                  onInput={(e) =>
                    props.updateValidation(field.id, "min", e.currentTarget.value)
                  }
                />
              </div>
              <div>
                <label class={labelCls}>Nilai Maksimum</label>
                <input
                  type="number"
                  class={inputCls}
                  placeholder="Tidak dibatasi"
                  value={field.validation.max ?? ""}
                  onInput={(e) =>
                    props.updateValidation(field.id, "max", e.currentTarget.value)
                  }
                />
              </div>
            </div>
          </Show>

          <Show
            when={
              field.type === "text" ||
              field.type === "textarea" ||
              field.type === "email" ||
              field.type === "url"
            }
          >
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class={labelCls}>Min Karakter</label>
                <input
                  type="number"
                  class={inputCls}
                  placeholder="0"
                  value={field.validation.minLength ?? ""}
                  onInput={(e) =>
                    props.updateValidation(field.id, "minLength", e.currentTarget.value)
                  }
                />
              </div>
              <div>
                <label class={labelCls}>Maks Karakter</label>
                <input
                  type="number"
                  class={inputCls}
                  placeholder="Tidak dibatasi"
                  value={field.validation.maxLength ?? ""}
                  onInput={(e) =>
                    props.updateValidation(field.id, "maxLength", e.currentTarget.value)
                  }
                />
              </div>
            </div>
          </Show>

          <Show when={field.type === "text"}>
            <div class="space-y-3">
              <div>
                <label class={labelCls}>
                  Pola Regex{" "}
                  <span class="normal-case font-normal tracking-normal text-gray-300">
                    (opsional)
                  </span>
                </label>
                <input
                  type="text"
                  class={`${inputCls} font-mono`}
                  placeholder="cth. ^[A-Z]{3}\d{4}$"
                  value={field.validation.pattern ?? ""}
                  onInput={(e) =>
                    props.updateValidation(field.id, "pattern", e.currentTarget.value)
                  }
                />
              </div>
              <Show when={(field.validation.pattern ?? "").length > 0}>
                <div>
                  <label class={labelCls}>Pesan Error Pola</label>
                  <input
                    type="text"
                    class={inputCls}
                    placeholder="cth. Format tidak sesuai"
                    value={field.validation.patternMessage ?? ""}
                    onInput={(e) =>
                      props.updateValidation(
                        field.id,
                        "patternMessage",
                        e.currentTarget.value
                      )
                    }
                  />
                </div>
              </Show>
            </div>
          </Show>

          <Show when={field.type === "date" || field.type === "datetime"}>
            <p class="text-xs text-gray-300 italic">
              Validasi tanggal ditentukan saat input transaksi.
            </p>
          </Show>

          <Show when={field.type === "boolean" || field.type === "select"}>
            <p class="text-xs text-gray-300 italic">
              Tidak ada aturan validasi untuk tipe ini.
            </p>
          </Show>

          <Show when={field.type === "select"}>
            {sectionDivider("Daftar Pilihan")}
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <p class="text-xs text-gray-400">Tambahkan opsi yang bisa dipilih</p>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                  onClick={() => props.addOption(field.id)}
                >
                  <Fa icon={solidIcons.faPlus} class="text-[9px]" />
                  Tambah pilihan
                </button>
              </div>
              <div class="space-y-2">
                <For each={field.options}>
                  {(opt, idx) => (
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        class={`${inputCls} flex-1`}
                        placeholder="Label tampilan"
                        value={opt.label}
                        onInput={(e) => {
                          props.updateOption(field.id, idx(), "label", e.currentTarget.value);
                          props.updateOption(
                            field.id,
                            idx(),
                            "value",
                            toSlugLocal(e.currentTarget.value)
                          );
                        }}
                      />
                      <input
                        type="text"
                        class={`${inputCls} w-32 font-mono text-xs`}
                        placeholder="value"
                        value={opt.value}
                        onInput={(e) =>
                          props.updateOption(field.id, idx(), "value", e.currentTarget.value)
                        }
                      />
                      <button
                        type="button"
                        class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                        onClick={() => props.removeOption(field.id, idx())}
                      >
                        <Fa icon={solidIcons.faTimes} class="text-xs" />
                      </button>
                    </div>
                  )}
                </For>
                <Show when={field.options.length === 0}>
                  <div class="border-2 border-dashed border-gray-100 rounded-xl py-5 flex items-center justify-center">
                    <p class="text-xs text-gray-300">Belum ada pilihan</p>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

interface FormulaItemProps {
  formula: Formula;
  numericFields: () => BusinessField[];
  removeFormula: (id: string) => void;
  updateFormula: (id: string, key: keyof Formula, value: any) => void;
  formulaError: (formula: Formula) => string | null;
}

const FormulaItem: Component<FormulaItemProps> = (props) => {
  const err = () => props.formulaError(props.formula);

  const fieldALabel = () =>
    props.numericFields().find((f) => f.name === props.formula.field_a)?.label ??
    props.formula.field_a;
  const fieldBLabel = () =>
    props.numericFields().find((f) => f.name === props.formula.field_b)?.label ??
    props.formula.field_b;
  const resultLabel = () =>
    props.numericFields().find((f) => f.name === props.formula.result)?.label ??
    props.formula.result;

  return (
    <div class="bg-violet-50/50 rounded-xl border border-violet-100 overflow-hidden">
      <div class="flex items-center gap-2 px-3.5 py-2.5 bg-violet-50 border-b border-violet-100">
        <Fa
          icon={solidIcons.faCalculator}
          class="text-violet-400 text-xs flex-shrink-0"
        />
        <div class="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          <span class="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-lg">
            {fieldALabel()}
          </span>
          <span class="text-sm font-bold text-violet-500">
            {OPERATOR_SYMBOLS[props.formula.operator]}
          </span>
          <span class="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-lg">
            {fieldBLabel()}
          </span>
          <span class="text-xs text-violet-400">=</span>
          <span class="text-xs font-bold text-white bg-violet-600 px-2 py-0.5 rounded-lg">
            {resultLabel()}
          </span>
        </div>
        <button
          type="button"
          class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 text-violet-300 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
          onClick={() => props.removeFormula(props.formula.id)}
        >
          <Fa icon={solidIcons.faTrash} class="text-[10px]" />
        </button>
      </div>

      <div class="px-4 py-3 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-[0.12em] text-violet-400 mb-1.5">
              Field A
            </label>
            <select
              class={formulaSelectCls}
              value={props.formula.field_a}
              onChange={(e) =>
                props.updateFormula(props.formula.id, "field_a", e.currentTarget.value)
              }
            >
              <For each={props.numericFields()}>
                {(f) => <option value={f.name}>{f.label}</option>}
              </For>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-[0.12em] text-violet-400 mb-1.5">
              Operasi
            </label>
            <select
              class={formulaSelectCls}
              value={props.formula.operator}
              onChange={(e) =>
                props.updateFormula(
                  props.formula.id,
                  "operator",
                  e.currentTarget.value as FormulaOperator
                )
              }
            >
              <For
                each={
                  Object.entries(OPERATOR_LABELS) as [FormulaOperator, string][]
                }
              >
                {([val, label]) => <option value={val}>{label}</option>}
              </For>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-[0.12em] text-violet-400 mb-1.5">
              Field B
            </label>
            <select
              class={formulaSelectCls}
              value={props.formula.field_b}
              onChange={(e) =>
                props.updateFormula(props.formula.id, "field_b", e.currentTarget.value)
              }
            >
              <For each={props.numericFields()}>
                {(f) => <option value={f.name}>{f.label}</option>}
              </For>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-[0.12em] text-violet-400 mb-1.5">
            Hasil Kalkulasi
          </label>
          <select
            class={formulaSelectCls}
            value={props.formula.result}
            onChange={(e) =>
              props.updateFormula(props.formula.id, "result", e.currentTarget.value)
            }
          >
            <For each={props.numericFields()}>
              {(f) => <option value={f.name}>{f.label}</option>}
            </For>
          </select>
          <p class="mt-1.5 text-[10px] text-violet-400">
            Field ini akan menjadi <strong>read-only</strong> saat input transaksi.
          </p>
        </div>

        <Show when={err()}>
          <div class="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <Fa
              icon={solidIcons.faExclamationTriangle}
              class="text-red-400 text-xs flex-shrink-0"
            />
            <p class="text-xs text-red-500 font-medium">{err()}</p>
          </div>
        </Show>
      </div>
    </div>
  );
};

const Skeleton: Component = () => (
  <div class="space-y-3 animate-pulse">
    <div class="h-12 bg-gray-100 rounded-xl" />
    <div class="h-12 bg-gray-100 rounded-xl" />
    <div class="h-12 bg-gray-100 rounded-xl" />
  </div>
);

interface DeleteConfirmProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  slug: string;
}

const DeleteConfirmModal: Component<DeleteConfirmProps> = (props) => {
  if (!props.visible) return null;
  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div class="px-5 pt-5 pb-4 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Fa icon={solidIcons.faTrash} class="text-red-500 text-sm" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-800 mb-1">
              Hapus Usaha Ini?
            </h3>
            <p class="text-xs text-gray-500 leading-relaxed">
              Semua data transaksi terkait usaha ini akan{' '}
              <span class="font-semibold text-red-500">terhapus permanen</span>{' '}
              dan tidak dapat dipulihkan.
            </p>
          </div>
        </div>

        <div class="mx-5 mb-4 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <p class="text-xs text-gray-400 mb-0.5">Usaha yang akan dihapus:</p>
          <p class="text-sm font-bold text-gray-700 capitalize">
            {props.slug.replace(/-/g, ' ')}
          </p>
        </div>

        <div class="flex gap-2 px-5 pb-5">
          <button
            type="button"
            class="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            onClick={props.onClose}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={props.isDeleting}
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={props.onDelete}
          >
            <Show when={props.isDeleting}>
              <Fa icon={solidIcons.faSpinner} class="animate-spin text-xs" />
            </Show>
            {props.isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageBusiness: Component = () => {
  const { changeTitle, changeSidebarRefresh } = Meta.useMeta();
  const params = useParams<{ role: string; slug: string }>();
  const navigate = useNavigate();

  createEffect(() =>
    changeTitle(`Manajemen Usaha - ${ucFirst(params.role)}`)
  );

  const [fieldsResource] = createResource(
    () => ({ role: params.role, slug: params.slug }),
    getFieldsData
  );
  const [formulasResource] = createResource(
    () => ({ role: params.role, slug: params.slug }),
    getFormulas
  );

  const [businessName, setBusinessName] = createSignal("");
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [fields, setFields] = createStore<BusinessField[]>([]);
  const [formulas, setFormulas] = createStore<Formula[]>([]);
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<"fields" | "formulas">("fields");

  createEffect(() => {
    const fs = fieldsResource();
    const fms = formulasResource();
    if (!fs || !fms || isLoaded()) return;

    setBusinessName(
      params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );

    const mapped: BusinessField[] = fs.map((f: any, i: number) => ({
      id: generateId(),
      label: f.label ?? f.name,
      name: f.name,
      type: f.is_currency || f.type === "currency" ? "currency" : f.type,
      order: f.order ?? i + 1,
      placeholder: f.placeholder ?? placeholderFor(f.label ?? f.name),
      required: f.required ?? false,
      filterable: f.filterable ?? false,
      validation: {
        min: f.validation?.min,
        max: f.validation?.max,
        minLength: f.validation?.minLength,
        maxLength: f.validation?.maxLength,
        pattern: f.validation?.pattern,
        patternMessage: f.validation?.patternMessage,
      },
      options: (f.options ?? []).map((o: any) =>
        typeof o === "object" ? o : { value: String(o), label: String(o) }
      ),
      expanded: false,
    }));

    setFields(mapped);
    setFormulas(
      (fms as any[]).map((fm: any) => ({
        id: generateId(),
        field_a: fm.field_a,
        operator: fm.operator as FormulaOperator,
        field_b: fm.field_b,
        result: fm.result,
        result_label: fm.result_label ?? fm.result,
        order: fm.order ?? 0,
      }))
    );
    setIsLoaded(true);
  });

  const numericFields = createMemo(() =>
    fields.filter((f) => f.type === "number" || f.type === "currency")
  );
  const resultFieldNames = createMemo(() => new Set(formulas.map((f) => f.result)));

  const addField = () =>
    setFields((f) => [
      ...f,
      {
        id: generateId(),
        label: "Field Baru",
        name: "field_baru",
        type: "text",
        order: f.length + 1,
        placeholder: placeholderFor("Field Baru"),
        required: false,
        filterable: false,
        validation: {},
        options: [],
        expanded: true,
      },
    ]);

  const removeField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (field) {
      setFormulas((fs) =>
        fs.filter(
          (fm) =>
            fm.field_a !== field.name &&
            fm.field_b !== field.name &&
            fm.result !== field.name
        )
      );
    }
    setFields((f) => f.filter((field) => field.id !== id));
  };

  const toggleExpand = (id: string) =>
    setFields((f) => f.id === id, "expanded", (v) => !v);

  const updateField = (id: string, key: keyof BusinessField, value: any) => {
    const oldField = fields.find((f) => f.id === id);
    const oldName = oldField?.name;
    setFields((f) => f.id === id, key as any, value);
    if (key === "name" && oldName && oldName !== value) {
      setFormulas(
        (fm) =>
          fm.field_a === oldName ||
          fm.field_b === oldName ||
          fm.result === oldName,
        (fm) => ({
          ...fm,
          field_a: fm.field_a === oldName ? value : fm.field_a,
          field_b: fm.field_b === oldName ? value : fm.field_b,
          result: fm.result === oldName ? value : fm.result,
          result_label:
            fm.result === oldName
              ? fields.find((f) => f.name === value)?.label ?? value
              : fm.result_label,
        })
      );
    }
  };

  const updateLabel = (id: string, label: string) => {
    updateField(id, "label", label);
    updateField(id, "name", toSlugLocal(label));
    updateField(id, "placeholder", placeholderFor(label));
  };

  const updateValidation = (id: string, key: string, value: any) => {
    const stringKeys = ["pattern", "patternMessage"];
    const parsed =
      value === ""
        ? undefined
        : stringKeys.includes(key)
        ? value
        : Number(value);
    setFields((f) => f.id === id, "validation", (v) => ({ ...v, [key]: parsed }));
  };

  const addOption = (id: string) =>
    setFields((f) => f.id === id, "options", (opts) => [
      ...opts,
      { label: "", value: "" },
    ]);

  const updateOption = (
    fieldId: string,
    idx: number,
    key: keyof FieldOption,
    val: string
  ) => setFields((f) => f.id === fieldId, "options", idx, key, val);

  const removeOption = (fieldId: string, idx: number) =>
    setFields((f) => f.id === fieldId, "options", (opts) =>
      opts.filter((_, i) => i !== idx)
    );

  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: DragEvent) => e.preventDefault();
  const onDrop = (targetIndex: number) => {
    const from = dragIndex();
    if (from === null || from === targetIndex) return;
    setFields((f) => {
      const updated = [...f];
      const [moved] = updated.splice(from, 1);
      updated.splice(targetIndex, 0, moved);
      return updated.map((fld, idx) => ({ ...fld, order: idx + 1 }));
    });
    setDragIndex(null);
  };
  const onDragEnd = () => setDragIndex(null);

  const addFormula = () => {
    const nf = numericFields();
    if (nf.length < 2) return;
    setFormulas((fs) => [
      ...fs,
      {
        id: generateId(),
        field_a: nf[0]?.name ?? "",
        operator: "*",
        field_b: nf[1]?.name ?? "",
        result: nf[0]?.name ?? "",
        result_label: nf[0]?.label ?? "",
        order: fs.length + 1,
      },
    ]);
  };

  const updateFormula = (id: string, key: keyof Formula, value: any) => {
    setFormulas((f) => f.id === id, key as any, value);
    if (key === "result") {
      const label = fields.find((f) => f.name === value)?.label ?? value;
      setFormulas((f) => f.id === id, "result_label", label);
    }
  };

  const removeFormula = (id: string) =>
    setFormulas((fs) => fs.filter((f) => f.id !== id));

  const formulaError = (formula: Formula): string | null => {
    if (!formula.field_a || !formula.field_b || !formula.result)
      return "Semua field harus dipilih.";
    if (formula.field_a === formula.field_b)
      return "Field A dan Field B tidak boleh sama.";
    if (
      formula.result === formula.field_a ||
      formula.result === formula.field_b
    )
      return "Field hasil tidak boleh sama dengan field input.";
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const name = businessName().trim();
    if (!name) {
      toastError("Nama usaha wajib diisi.", "Error");
      return;
    }
    for (const formula of formulas) {
      const err = formulaError(formula);
      if (err) {
        toastError(`Formula tidak valid: ${err}`, "Error");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        fields: fields.map(serializeField),
      };

      const res = await api.put(
        `/dashboard/${params.role}/business/${params.slug}`,
        payload
      );

      if (res.status === 200 || res.status === 201) {
        const businessSlug = slugify(name);
        const serialized = formulas.map((f, idx) => ({
          result: f.result,
          result_label:
            f.result_label ||
            fields.find((fld) => fld.name === f.result)?.label ||
            f.result,
          field_a: f.field_a,
          operator: f.operator,
          field_b: f.field_b,
          order: idx + 1,
        }));
        await saveFormulas(
          { role: params.role, slug: businessSlug },
          serialized
        );

        changeSidebarRefresh(true);
        success("Usaha berhasil diperbarui.", "Berhasil");
        navigate(`/usaha/${params.role}/${businessSlug}`);
      } else {
        toastError(res.data?.message || "Gagal memperbarui usaha.", "Error");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Terjadi kesalahan.";
      toastError(msg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(
        `/dashboard/${params.role}/business/${params.slug}`
      );
      if (res.status === 200 || res.status === 204) {
        changeSidebarRefresh(true);
        success("Usaha berhasil dihapus.", "Berhasil");
        navigate("/");
      } else {
        toastError("Gagal menghapus usaha.", "Error");
      }
    } catch {
      toastError("Terjadi kesalahan saat menghapus usaha.", "Error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const Skeleton = () => (
    <div class="space-y-3 animate-pulse">
      <div class="h-12 bg-gray-100 rounded-xl" />
      <div class="h-12 bg-gray-100 rounded-xl" />
      <div class="h-12 bg-gray-100 rounded-xl" />
    </div>
  );

  return (
    <div class="w-full pb-24">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
            onClick={() => navigate(`/usaha/${params.role}/${params.slug}`)}
          >
            <Fa icon={solidIcons.faArrowLeft} class="text-xs" />
          </button>
          <div>
            <h1 class="text-base font-bold text-gray-800">Manajemen Usaha</h1>
            <p class="text-xs text-gray-400 capitalize">
              {params.slug.replace(/-/g, " ")}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-red-100"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Fa icon={solidIcons.faTrash} class="text-[10px]" />
          Hapus Usaha
        </button>
      </div>

      <form onSubmit={handleSubmit} class="space-y-3">
        <div class="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
              <Fa icon={solidIcons.faStore} class="text-white text-xs" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">Informasi Usaha</p>
              <p class="text-xs text-gray-400">Nama dan identitas usaha</p>
            </div>
          </div>
          <div class="px-5 py-5">
            <label class={labelCls}>Nama Usaha</label>
            <input
              type="text"
              class={inputCls}
              placeholder="cth. Tiket Wisata, Sewa Warung..."
              value={businessName()}
              onInput={(e) => setBusinessName(e.currentTarget.value)}
              required
            />
          </div>
        </div>

        <div class="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
          <div class="flex border-b border-gray-100">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
              classList={{
                "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30":
                  activeTab() === "fields",
                "text-gray-400 hover:text-gray-600 hover:bg-gray-50":
                  activeTab() !== "fields",
              }}
              onClick={() => setActiveTab("fields")}
            >
              <Fa icon={solidIcons.faTag} class="text-[10px]" />
              Field Transaksi
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
              classList={{
                "text-violet-600 border-b-2 border-violet-600 bg-violet-50/30":
                  activeTab() === "formulas",
                "text-gray-400 hover:text-gray-600 hover:bg-gray-50":
                  activeTab() !== "formulas",
              }}
              onClick={() => setActiveTab("formulas")}
            >
              <Fa icon={solidIcons.faCalculator} class="text-[10px]" />
              Kalkulasi Otomatis
            </button>
          </div>

          <Show when={activeTab() === "fields"}>
            <div class="p-3">
              <div class="flex items-center justify-between mb-3 px-1">
                <p class="text-xs text-gray-400">
                  Drag untuk mengubah urutan field
                </p>
                <button
                  type="button"
                  onClick={addField}
                  class="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Fa icon={solidIcons.faPlus} class="text-[9px]" />
                  Tambah Field
                </button>
              </div>

              <Show
                when={!isLoaded()}
                fallback={
                  <div class="space-y-2">
                    <For each={fields}>
                      {(field, idx) => (
                        <FieldItem
                          field={field}
                          idx={idx()}
                          resultFieldNames={resultFieldNames()}
                          draggingIndex={dragIndex}
                          toggleExpand={toggleExpand}
                          removeField={removeField}
                          updateLabel={updateLabel}
                          updateField={updateField}
                          updateValidation={updateValidation}
                          addOption={addOption}
                          updateOption={updateOption}
                          removeOption={removeOption}
                          onDragStart={onDragStart}
                          onDragOver={onDragOver}
                          onDrop={onDrop}
                          onDragEnd={onDragEnd}
                        />
                      )}
                    </For>
                    <Show when={fields.length === 0}>
                      <div class="border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center text-center">
                        <div class="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                          <Fa icon={solidIcons.faTag} class="text-gray-300" />
                        </div>
                        <p class="text-sm font-semibold text-gray-400">
                          Belum ada field
                        </p>
                        <p class="text-xs text-gray-300 mt-0.5">
                          Klik "Tambah Field" untuk mulai
                        </p>
                      </div>
                    </Show>
                  </div>
                }
              >
                <Skeleton />
              </Show>
            </div>
          </Show>

          <Show when={activeTab() === "formulas"}>
            <div class="p-3">
              <div class="flex items-center justify-between mb-3 px-1">
                <p class="text-xs text-gray-400">
                  Field hasil kalkulasi menjadi read-only
                </p>
                <button
                  type="button"
                  onClick={addFormula}
                  disabled={numericFields().length < 2}
                  class="inline-flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-violet-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={
                    numericFields().length < 2
                      ? "Butuh minimal 2 field angka/mata uang"
                      : ""
                  }
                >
                  <Fa icon={solidIcons.faPlus} class="text-[9px]" />
                  Tambah Formula
                </button>
              </div>

              <Show when={numericFields().length < 2 && formulas.length === 0}>
                <div class="border-2 border-dashed border-violet-100 rounded-xl py-8 flex flex-col items-center justify-center text-center">
                  <div class="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                    <Fa
                      icon={solidIcons.faCalculator}
                      class="text-violet-300"
                    />
                  </div>
                  <p class="text-sm font-semibold text-gray-400">
                    Butuh minimal 2 field angka
                  </p>
                  <p class="text-xs text-gray-300 mt-0.5 max-w-[200px]">
                    Tambahkan field bertipe Angka atau Mata Uang di tab Field
                    Transaksi
                  </p>
                </div>
              </Show>

              <div class="space-y-2">
                <For each={formulas}>
                  {(formula) => (
                    <FormulaItem
                      formula={formula}
                      numericFields={numericFields}
                      removeFormula={removeFormula}
                      updateFormula={updateFormula}
                      formulaError={formulaError}
                    />
                  )}
                </For>

                <Show
                  when={formulas.length === 0 && numericFields().length >= 2}
                >
                  <div class="border-2 border-dashed border-violet-100 rounded-xl py-8 flex flex-col items-center justify-center text-center">
                    <div class="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                      <Fa
                        icon={solidIcons.faCalculator}
                        class="text-violet-300"
                      />
                    </div>
                    <p class="text-sm font-semibold text-gray-400">
                      Belum ada formula
                    </p>
                    <p class="text-xs text-gray-300 mt-0.5">
                      Klik "Tambah Formula" untuk mulai
                    </p>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>

        <div class="flex gap-2.5 sticky bottom-4 pt-1">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 bg-white text-gray-600 py-3 px-5 text-sm font-semibold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all cursor-pointer shadow-sm"
            onClick={() => navigate(`/usaha/${params.role}/${params.slug}`)}
          >
            <Fa icon={solidIcons.faArrowLeft} class="text-xs" />
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting()}
            class="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 text-sm font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            <Fa
              icon={isSubmitting() ? solidIcons.faSpinner : solidIcons.faSave}
              class={`text-xs ${isSubmitting() ? "animate-spin" : ""}`}
            />
            {isSubmitting() ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      <Show when={showDeleteConfirm()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div class="px-5 pt-5 pb-4 flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Fa icon={solidIcons.faTrash} class="text-red-500 text-sm" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-800 mb-1">
                  Hapus Usaha Ini?
                </h3>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Semua data transaksi terkait usaha ini akan{" "}
                  <span class="font-semibold text-red-500">
                    terhapus permanen
                  </span>{" "}
                  dan tidak dapat dipulihkan.
                </p>
              </div>
            </div>

            <div class="mx-5 mb-4 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <p class="text-xs text-gray-400 mb-0.5">
                Usaha yang akan dihapus:
              </p>
              <p class="text-sm font-bold text-gray-700 capitalize">
                {params.slug.replace(/-/g, " ")}
              </p>
            </div>

            <div class="flex gap-2 px-5 pb-5">
              <button
                type="button"
                class="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting()}
                class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDelete}
              >
                <Show when={isDeleting()}>
                  <Fa
                    icon={solidIcons.faSpinner}
                    class="animate-spin text-xs"
                  />
                </Show>
                {isDeleting() ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default ManageBusiness;