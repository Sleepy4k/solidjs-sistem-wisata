import DataTable from "@components/DataTable";
import { Auth, Meta } from "@contexts";
import {
  faArrowDown,
  faArrowUp,
  faCalculator,
  faCalendar,
  faCalendarAlt,
  faCalendarCheck,
  faDatabase,
  faFileExcel,
  faFilePdf,
  faFilter,
  faMoneyBill,
  faPlus,
  faPrint,
  faRefresh,
  faSave,
  faSpinner,
  faTimes,
  faWallet,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import { getCardsData, getColumnsData, getFieldsData, getFormulas, api } from "@services";
import { IField, IFieldOption, ICard, IColumn } from "../../types/dashboard";
import { Params, useParams, useSearchParams, useNavigate} from "@solidjs/router";
import {
  formatCurrency,
  toSlug,
  ucFirst,
  ucWords,
  success,
  error as toastError,
} from "@utils";
import Fa from "solid-fa";
import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";

type FormulaOperator = "*" | "+" | "-" | "/";

interface Formula {
  id?: string;
  field_a: string;
  operator: FormulaOperator;
  field_b: string;
  result: string;
  result_label?: string;
  order?: number;
}

interface IParamData extends Params {
  role: string;
  slug?: string;
}

const cardMetaData = (cardName: string) => {
  switch (cardName.toLowerCase()) {
    case "total-transactions":
      return { color: "blue", icon: faDatabase };
    case "transactions-this-month":
      return { color: "green", icon: faCalendar };
    case "total-income":
      return { color: "green", icon: faArrowUp };
    case "total-outcome":
      return { color: "red", icon: faArrowDown };
    case "net-balance":
      return { color: "blue", icon: faWallet };
    default:
      return { color: "gray", icon: faMoneyBill };
  }
};

function evaluateFormula(
  formula: Formula,
  values: Record<string, number>,
): number | null {
  const a = values[formula.field_a];
  const b = values[formula.field_b];
  if (a === undefined || b === undefined || isNaN(a) || isNaN(b)) return null;
  switch (formula.operator) {
    case "*":
      return a * b;
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "/":
      return b === 0 ? null : a / b;
  }
}

const OPERATOR_SYMBOLS: Record<FormulaOperator, string> = {
  "*": "x",
  "+": "+",
  "-": "-",
  "/": "÷",
};

const Business: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const params = useParams<IParamData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [fields] = createResource(
    () => ({ role: params.role, slug: params.slug || "" }),
    getFieldsData,
  );
  const [columns] = createResource(
    () => ({ role: params.role, slug: params.slug || "" }),
    getColumnsData,
  );
  const [cards, { refetch: cardRefetch }] = createResource(
    () => ({ role: params.role, slug: params.slug || "" }),
    getCardsData,
  );

  const sp = (key: string): string => {
    const v = searchParams[key];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };

  const filterParams: Accessor<Record<string, string>> = createMemo(() => {
    const out: Record<string, string> = {};
    const df = sp("date_from");
    if (df) out["date_from"] = df;
    const dt = sp("date_to");
    if (dt) out["date_to"] = dt;

    (fields() || []).forEach((f) => {
      if (f.filterable) {
        const v = sp(`filter_${f.name}`);
        if (v) out[`filter_${f.name}`] = v;
      }
    });
    return out;
  });

  const setFilter = (key: string, value: string) => {
    setSearchParams({ [key]: value || undefined });
  };

  const resetFilters = () => {
    const clearing: Record<string, undefined> = {
      date_from: undefined,
      date_to: undefined,
    };
    (fields() || []).forEach((f) => {
      if (f.filterable) clearing[`filter_${f.name}`] = undefined;
    });
    setSearchParams(clearing);
  };

  const [formulasResource] = createResource(
    () => ({ role: params.role, slug: params.slug || "" }),
    getFormulas,
  );
  const [formulas, setFormulas] = createSignal<Formula[]>([]);
  createEffect(() => {
    const d = formulasResource();
    if (d) setFormulas(d);
  });
  const [computedValues, setComputedValues] = createSignal<
    Record<string, number | null>
  >({});

  const [tableKey, setTableKey] = createSignal<number>(0);
  const [showAdd, setShowAdd] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [showConfirmDelete, setShowConfirmDelete] = createSignal(false);
  const [modalTitleText, setModalTitleText] = createSignal("");
  const [selectedRow, setSelectedRow] = createSignal<any>(null);
  const [confirmLoading, setConfirmLoading] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  let modalForm: HTMLFormElement;
  let modalFieldContainer: HTMLDivElement;

  const [exportingType, setExportingType] = createSignal<
    "excel" | "pdf" | "print" | null
  >(null);

  const buildExportUrl = (type: "excel" | "pdf" | "print") => {
    const base = `/dashboard/${params.role}/${params.slug}/export/${type}`;
    const fp = filterParams();
    const qs = new URLSearchParams(
      Object.entries(fp).filter(([, v]) => v !== ""),
    ).toString();
    return qs ? `${base}?${qs}` : base;
  };

  const handleExport = async (type: "excel" | "pdf" | "print") => {
    if (exportingType()) return;
    setExportingType(type);
    try {
      if (type === "print") {
        const res = await api.get<string>(buildExportUrl("print"), {
          responseType: "text",
        });
        const html = res.data as unknown as string;
        const win = window.open("", "_blank");
        if (!win) {
          toastError(
            "Pop-up diblokir browser. Izinkan pop-up dan coba lagi.",
            "Error",
          );
          return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();

        setTimeout(() => {
          win.print();
        }, 600);
      } else {
        const extension = type === "excel" ? ".xlsx" : ".pdf";
        const res = await api.get(buildExportUrl(type), {
          responseType: "blob",
        });

        const disposition =
          res.headers["content-disposition"] ||
          res.headers["Content-Disposition"] ||
          "";
        const match = /filename[^;=\n]*=(['"]?)(.+?)\1(;|$)/i.exec(
          disposition,
        );
        const slug = params.slug || "data";
        const filename = match?.[2]?.trim() || `${slug}${extension}`;

        const blob = new Blob([res.data], {
          type:
            type === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success(
          `File ${type === "excel" ? "Excel" : "PDF"} berhasil diunduh.`,
          "Berhasil",
        );
      }
    } catch (err: any) {
      console.error("Export error", err);
      const msg =
        err?.response?.data?.message ??
        `Gagal mengekspor data ke ${type === "excel" ? "Excel" : type === "pdf" ? "PDF" : "cetak"}.`;
      toastError(msg, "Error");
    } finally {
      setExportingType(null);
    }
  };

  const formatNumber = (val: string) =>
    val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const unformatNumber = (val: string) => val.replace(/\./g, "");
  const fullUnformatNumber = (val: string) =>
    val.replace(/\./g, "").split(",")[0];

  const collectNumericValues = (): Record<string, number> => {
    const out: Record<string, number> = {};
    if (!modalFieldContainer) return out;
    modalFieldContainer
      .querySelectorAll<HTMLInputElement>("input[data-numeric-field]")
      .forEach((el) => {
        const name = el.dataset.numericField!;
        const raw = parseFloat(unformatNumber(el.value));
        if (!isNaN(raw)) out[name] = raw;
      });
    return out;
  };

  const recalculate = () => {
    const currentFormulas = formulas();
    if (!currentFormulas.length || !modalFieldContainer) return;

    const vals = collectNumericValues();
    const newComputed: Record<string, number | null> = {};

    currentFormulas.forEach((formula) => {
      const result = evaluateFormula(formula, vals);
      newComputed[formula.result] = result;

      const resultInput = modalFieldContainer.querySelector<HTMLInputElement>(
        `input[name="${formula.result}"]`,
      );
      if (resultInput) {
        resultInput.value = result !== null ? String(result) : "";
        const displayInput =
          modalFieldContainer.querySelector<HTMLInputElement>(
            `input[data-computed-display="${formula.result}"]`,
          );
        if (displayInput) {
          displayInput.value =
            result !== null ? formatNumber(Math.round(result).toString()) : "";
        }
      }
    });

    setComputedValues(newComputed);
  };

  const formatNumberInputs = () => {
    modalFieldContainer
      .querySelectorAll<HTMLInputElement>('input[data-type="number"]')
      .forEach((el) => {
        if (!el.value) return;
        const raw = unformatNumber(el.value);
        el.value = raw ? formatNumber(raw) : "";
      });
  };

  const attachNumberInputListeners = () => {
    modalFieldContainer
      .querySelectorAll<HTMLInputElement>('input[data-type="number"]')
      .forEach((el) => {
        el.addEventListener("input", () => {
          const raw = unformatNumber(el.value);
          el.value = raw ? formatNumber(raw) : "";
          recalculate();
        });
        el.addEventListener("blur", () => {
          const raw = Number(unformatNumber(el.value));
          const min = Number(el.dataset.min);
          const max = Number(el.dataset.max);
          if (el.value && raw < min) el.value = formatNumber(String(min));
          if (el.value && raw > max) el.value = formatNumber(String(max));
          recalculate();
        });
      });

    modalFieldContainer
      .querySelectorAll<HTMLInputElement>(
        'input[type="number"][data-numeric-field]',
      )
      .forEach((el) => {
        el.addEventListener("input", () => recalculate());
        el.addEventListener("change", () => recalculate());
      });
  };

  const inputCls =
    "w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md " +
    "focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white";

  const resultFieldNames = () => new Set(formulas().map((f) => f.result));

  const populateFormFields = (
    fieldList: IField[],
    values?: Record<string, any>,
  ) => {
    modalFieldContainer.innerHTML = "";
    setComputedValues({});

    const currentFormulas = formulas();
    const resultNames = new Set(currentFormulas.map((f) => f.result));

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5";
    modalFieldContainer.appendChild(grid);

    fieldList.forEach((field) => {
      const isComputed = resultNames.has(field.name);
      const fieldId = `modal-field-${toSlug(field.name)}`;
      const isRequired = !isComputed && field.required ? "required" : "";
      const requiredMark = isRequired
        ? '<span class="text-red-500 ml-0.5">*</span>'
        : "";

      const isFullWidth = field.type === "textarea" || field.type === "boolean";
      const formWrapper = document.createElement("div");
      formWrapper.className = isFullWidth ? "sm:col-span-2" : "";

      const formLabel = document.createElement("label");
      formLabel.setAttribute("for", fieldId);
      formLabel.className =
        "block text-gray-500 text-[11px] font-semibold mb-1 uppercase tracking-wide";

      if (isComputed) {
        formLabel.innerHTML =
          `${field.label} ` +
          `<span class="normal-case font-normal tracking-normal text-violet-500 text-[10px]">` +
          `<span class="inline-flex items-center gap-0.5">` +
          `<svg class="inline w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">` +
          `<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V4z"/>` +
          `</svg> otomatis</span></span>`;
      } else {
        formLabel.innerHTML = `${field.label}${requiredMark}`;
      }

      formWrapper.appendChild(formLabel);

      if (isComputed) {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = field.name;
        hiddenInput.value =
          values?.[field.name] !== undefined ? String(values[field.name]) : "";
        formWrapper.appendChild(hiddenInput);

        const displayWrapper = document.createElement("div");
        displayWrapper.className = "relative";

        const currencySpan = document.createElement("span");
        currencySpan.className =
          "absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-sm font-medium pointer-events-none";
        currencySpan.textContent = field.type === "currency" ? "Rp" : "=";
        displayWrapper.appendChild(currencySpan);

        const displayInput = document.createElement("input");
        displayInput.type = "text";
        displayInput.id = fieldId;
        displayInput.dataset.computedDisplay = field.name;
        displayInput.readOnly = true;
        displayInput.placeholder = "Dihitung otomatis…";
        displayInput.className =
          "w-full pl-9 pr-3 py-1.5 text-sm border border-violet-200 rounded-md " +
          "bg-violet-50 text-violet-700 font-semibold cursor-not-allowed " +
          "placeholder-violet-300 focus:outline-none";
        if (values?.[field.name] !== undefined) {
          displayInput.value = formatNumber(
            Math.round(Number(values[field.name])).toString(),
          );
        }
        displayWrapper.appendChild(displayInput);
        formWrapper.appendChild(displayWrapper);

        const hint = document.createElement("p");
        hint.className = "mt-1 text-[10px] text-violet-400";

        const srcFormula = currentFormulas.find((f) => f.result === field.name);
        if (srcFormula) {
          const aLabel =
            fieldList.find((f) => f.name === srcFormula.field_a)?.label ??
            srcFormula.field_a;
          const bLabel =
            fieldList.find((f) => f.name === srcFormula.field_b)?.label ??
            srcFormula.field_b;
          hint.textContent = `${aLabel} ${OPERATOR_SYMBOLS[srcFormula.operator]} ${bLabel}`;
        }
        formWrapper.appendChild(hint);
      } else {
        switch (field.type) {
          case "text":
          case "email":
          case "url":
            formWrapper.innerHTML += `
              <input type="${field.type}" id="${fieldId}" name="${field.name}"
                class="${inputCls}" placeholder="Masukkan ${field.label.toLowerCase()}" ${isRequired} />`;
            break;

          case "number": {
            const minimum = field.validation?.min ?? 0;
            const maximum = field.validation?.max ?? 100000000000;
            formWrapper.innerHTML += `
              <input type="text" id="${fieldId}" name="${field.name}"
                data-min="${minimum}" data-max="${maximum}"
                data-type="number" data-numeric-field="${field.name}"
                class="${inputCls}" placeholder="0" ${isRequired} />`;
            break;
          }

          case "currency":
            formWrapper.innerHTML += `
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">Rp</span>
                <input type="number" id="${fieldId}" name="${field.name}"
                  data-numeric-field="${field.name}"
                  class="${inputCls} pl-10" placeholder="0" ${isRequired} />
              </div>`;
            break;

          case "textarea":
            formWrapper.innerHTML += `
              <textarea id="${fieldId}" name="${field.name}" rows="2"
                class="${inputCls} resize-none"
                placeholder="Masukkan ${field.label.toLowerCase()}" ${isRequired}></textarea>`;
            break;

          case "select": {
            const opts: IFieldOption[] = (field.options || []).map((o: any) =>
              typeof o === "object" ? o : { value: o, label: String(o) },
            );
            const options = opts
              .map((o) => `<option value="${o.value}">${o.label}</option>`)
              .join("");
            formWrapper.innerHTML += `
              <select id="${fieldId}" name="${field.name}" class="${inputCls}" ${isRequired}>
                <option value="" disabled selected>Pilih ${field.label.toLowerCase()}</option>
                ${options}
              </select>`;
            break;
          }

          case "date":
            formWrapper.innerHTML += `
              <input type="date" id="${fieldId}" name="${field.name}"
                class="${inputCls}" ${isRequired} />`;
            break;

          case "datetime":
            formWrapper.innerHTML += `
              <input type="datetime-local" id="${fieldId}" name="${field.name}"
                class="${inputCls}" ${isRequired} />`;
            break;

          case "boolean":
            formWrapper.innerHTML += `
              <label class="inline-flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" id="${fieldId}" name="${field.name}"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span class="text-sm text-gray-700">${field.label}</span>
              </label>`;
            break;
        }
      }

      grid.appendChild(formWrapper);

      const errorPlaceholder = document.createElement("div");
      errorPlaceholder.className = "mt-1 text-sm text-red-600 field-error";
      errorPlaceholder.setAttribute("data-field", field.name);
      formWrapper.appendChild(errorPlaceholder);

      if (values && values[field.name] !== undefined && !isComputed) {
        const el = modalFieldContainer.querySelector(
          `[name="${field.name}"]`,
        ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (el) {
          if ((el as HTMLInputElement).type === "checkbox") {
            (el as HTMLInputElement).checked = !!values[field.name];
          } else {
            if (field.type === "number" || field.type === "currency") {
              (el as HTMLInputElement).value = fullUnformatNumber(
                String(values[field.name] ?? ""),
              );
            } else {
              (el as HTMLInputElement).value = values[field.name] ?? "";
            }
          }
        }
      }
    });

    attachNumberInputListeners();
    formatNumberInputs();
    recalculate();
  };

  const clearFormErrors = () => {
    modalFieldContainer
      .querySelectorAll<HTMLElement>(".field-error")
      .forEach((el) => {
        el.textContent = "";
      });
    modalFieldContainer
      .querySelectorAll<HTMLInputElement>("input,select,textarea")
      .forEach((el) => el.classList.remove("border-red-500"));
  };

  const showFieldError = (name: string, messages: string[]) => {
    const container = modalFieldContainer.querySelector<HTMLElement>(
      `.field-error[data-field="${name}"]`,
    );
    if (container) {
      container.innerHTML = messages.map((m) => `<div>${m}</div>`).join("");
      const el = modalFieldContainer.querySelector<HTMLElement>(
        `[name="${name}"]`,
      );
      if (el) el.classList.add("border-red-500");
    }
  };

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    clearFormErrors();

    modalFieldContainer
      .querySelectorAll<HTMLInputElement>('input[data-type="number"]')
      .forEach((el) => {
        el.value = unformatNumber(el.value);
      });

    recalculate();

    setIsSubmitting(true);
    try {
      const formData = new FormData(modalForm);
      const payload: Record<string, any> = {};
      const currentFields = fields() || [];

      formData.forEach((value, key) => {
        const el = modalForm.querySelector(
          `[name="${key}"]`,
        ) as HTMLInputElement | null;
        const fieldDef = currentFields.find((f) => f.name === key);
        const isComp = resultFieldNames().has(key);

        if (el?.type === "checkbox") {
          payload[key] = (el as HTMLInputElement).checked;
          return;
        }
        if (isComp) {
          const n = parseFloat(String(value ?? ""));
          payload[key] = isNaN(n) ? null : n;
          return;
        }
        if (fieldDef?.type === "number" || fieldDef?.type === "currency") {
          let v = String(value ?? "")
            .replace(/\./g, "")
            .replace(/,/g, ".");
          payload[key] = v === "" ? null : Number(v);
          return;
        }
        payload[key] = value;
      });

      const endpointBase = `/dashboard/${params.role}/${params.slug}`;

      if (showEdit()) {
        const id = selectedRow()?.id;
        const response = await api.put(`${endpointBase}/${id}`, payload);
        if (response.status === 200) {
          setShowEdit(false);
          cardRefetch?.();
          setTableKey((k) => k + 1);
          success("Data berhasil diperbarui.", "Berhasil");
        } else {
          toastError("Gagal memperbarui data.", "Error");
        }
      } else {
        const response = await api.post(endpointBase, payload);
        if (response.status === 200 || response.status === 201) {
          setShowAdd(false);
          cardRefetch?.();
          setTableKey((k) => k + 1);
          success("Data berhasil disimpan.", "Berhasil");
        } else {
          toastError("Gagal menyimpan data.", "Error");
        }
      }
    } catch (err: any) {
      console.error("Submit error", err);
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([field, msgs]) => {
          showFieldError(field, Array.isArray(msgs) ? msgs : [String(msgs)]);
        });
        const firstEl = modalFieldContainer.querySelector(
          `[name="${Object.keys(data.errors)[0]}"]`,
        );
        (firstEl as any)?.scrollIntoView?.({
          behavior: "smooth",
          block: "center",
        });
      } else {
        toastError("Terjadi kesalahan saat menyimpan data.", "Error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (row: any) => {
    setSelectedRow(row);
    setModalTitleText("Edit Data");
    setShowEdit(true);
  };
  const handleOpenDelete = (row: any) => {
    setSelectedRow(row);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmLoading(true);
    try {
      const resp = await api.delete(
        `/dashboard/${params.role}/${params.slug}/${selectedRow()?.id}`,
      );
      if (resp.status === 200 || resp.status === 204) {
        setShowConfirmDelete(false);
        cardRefetch?.();
        setTableKey((k) => k + 1);
        success("Data berhasil dihapus.", "Berhasil");
      } else {
        toastError("Gagal menghapus data.", "Error");
      }
    } catch {
      toastError("Terjadi kesalahan saat menghapus data.", "Error");
    } finally {
      setConfirmLoading(false);
    }
  };

  createEffect(() => {
    changeTitle(
      `${ucFirst(params.role)}${params.slug ? ` - ${ucWords(params.slug)}` : ""}`,
    );
  });

  createEffect(() => {
    if ((showAdd() || showEdit()) && modalFieldContainer) {
      populateFormFields(
        fields() || [],
        showEdit() ? (selectedRow() ?? undefined) : undefined,
      );
      clearFormErrors();
    }
  });

  const hasComputedFields = () => formulas().length > 0;

  return (
    <>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        <Show
          when={cards() && cards.state === "ready"}
          fallback={
            <For each={[1, 2, 3, 4, 5]}>
              {() => (
                <div class="animate-pulse bg-gray-200 rounded-xl h-20 md:h-24 shadow" />
              )}
            </For>
          }
        >
          <For each={cards()}>
            {(card) => {
              const metaData = cardMetaData(card.name);
              return (
                <div class="bg-white rounded-xl p-3 md:p-4 shadow card-hover">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-500 text-[10px] md:text-xs font-medium mb-0.5 leading-tight line-clamp-2">
                        {card.title}
                      </p>
                      <p
                        class={`text-sm md:text-base lg:text-lg font-bold text-${metaData.color}-600 truncate`}
                      >
                        {card.is_currency
                          ? formatCurrency(card.value) + ",00"
                          : card.value}
                      </p>
                    </div>
                    <div
                      class={`w-9 h-9 md:w-10 md:h-10 bg-${metaData.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <Fa
                        icon={metaData.icon}
                        class={`text-${metaData.color}-600 text-sm`}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </div>

      <div class="bg-white rounded-xl p-3 md:p-5 shadow mb-4 md:mb-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 class="text-sm md:text-base font-bold text-gray-800 whitespace-nowrap">
            Filter dan Aksi Data
          </h2>
          <div class="flex flex-wrap gap-1.5">
            <Show when={user()?.role === params.role}>
              <button
                onClick={() => {
                  setModalTitleText("Tambah Data");
                  setSelectedRow(null);
                  setShowAdd(true);
                }}
                class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-xs md:text-sm font-medium"
              >
                <Fa icon={faPlus} />
                <span class="hidden sm:inline">Tambah Data</span>
                <span class="sm:hidden">Tambah</span>
              </button>
            </Show>

            <button
              onClick={() => handleExport("excel")}
              disabled={!!exportingType()}
              class="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-xs md:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Show
                when={exportingType() === "excel"}
                fallback={<Fa icon={faFileExcel} />}
              >
                <Fa icon={faSpinner} class="animate-spin" />
              </Show>
              <span class="hidden sm:inline">Export Excel</span>
              <span class="sm:hidden">Excel</span>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={!!exportingType()}
              class="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-xs md:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Show
                when={exportingType() === "pdf"}
                fallback={<Fa icon={faFilePdf} />}
              >
                <Fa icon={faSpinner} class="animate-spin" />
              </Show>
              <span class="hidden sm:inline">Export PDF</span>
              <span class="sm:hidden">PDF</span>
            </button>

            <button
              onClick={() => handleExport("print")}
              disabled={!!exportingType()}
              class="inline-flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-xs md:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Show
                when={exportingType() === "print"}
                fallback={<Fa icon={faPrint} />}
              >
                <Fa icon={faSpinner} class="animate-spin" />
              </Show>
              <span class="hidden sm:inline">Cetak Tabel</span>
              <span class="sm:hidden">Cetak</span>
            </button>

            <button
              class="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-sm font-medium cursor-pointer"
              onClick={resetFilters}
            >
              <Fa icon={faRefresh} />
              <span>Reset</span>
            </button>

            <Show when={user()?.role === params.role}>
              <button
                onClick={() =>
                  navigate(`/manajemen-usaha/${params.role}/${params.slug}`)
                }
                class="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-xs md:text-sm font-medium"
              >
                <Fa icon={faCog} />
                <span class="hidden sm:inline">Manajemen Usaha</span>
                <span class="sm:hidden">Kelola</span>
              </button>
            </Show>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
          <div>
            <label class="flex items-center gap-1 text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
              <Fa icon={faCalendarAlt} class="text-gray-400" /> Dari Tanggal
            </label>
            <input
              type="date"
              value={sp("date_from")}
              onInput={(e) => setFilter("date_from", e.currentTarget.value)}
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label class="flex items-center gap-1 text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
              <Fa icon={faCalendarCheck} class="text-gray-400" /> Sampai Tanggal
            </label>
            <input
              type="date"
              value={sp("date_to")}
              onInput={(e) => setFilter("date_to", e.currentTarget.value)}
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <Show
            when={fields() && fields.state === "ready"}
            fallback={
              <For each={[1, 2]}>
                {() => (
                  <div>
                    <div class="bg-gray-200 rounded h-4 w-20 mb-1 animate-pulse" />
                    <div class="w-full bg-gray-200 rounded-lg h-8 animate-pulse" />
                  </div>
                )}
              </For>
            }
          >
            <For each={fields()}>
              {(field) =>
                field.filterable ? (
                  <div>
                    <label class="flex items-center gap-1 text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                      <Fa icon={faFilter} class="text-gray-400" /> {field.label}
                    </label>
                    <Switch>
                      <Match when={field.type === "select"}>
                        <select
                          value={sp(`filter_${field.name}`)}
                          onInput={(e) =>
                            setFilter(
                              `filter_${field.name}`,
                              e.currentTarget.value,
                            )
                          }
                          class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Semua {field.label}</option>
                          <For each={field.options}>
                            {(option) => (
                              <option value={option.value}>
                                {ucWords(option.label)}
                              </option>
                            )}
                          </For>
                        </select>
                      </Match>
                      <Match when={field.type === "date"}>
                        <input
                          type="date"
                          value={sp(`filter_${field.name}`)}
                          onInput={(e) =>
                            setFilter(
                              `filter_${field.name}`,
                              e.currentTarget.value,
                            )
                          }
                          class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </Match>
                    </Switch>
                  </div>
                ) : null
              }
            </For>
          </Show>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <DataTable<IColumn>
            columns={columns}
            endpoint={`/dashboard/${params.role}/${params.slug}`}
            refreshTrigger={tableKey()}
            extraParams={filterParams}
            user_role={user()?.role}
            allowed_action={[params.role]}
            action={{
              enableEdit: true,
              enableDelete: true,
              onEdit: handleOpenEdit,
              onDelete: handleOpenDelete,
            }}
          />
        </div>
      </div>

      <Show when={showAdd() || showEdit()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdd(false);
              setShowEdit(false);
            }
          }}
        >
          <div class="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800">
                {modalTitleText()}
              </h3>
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  setShowAdd(false);
                  setShowEdit(false);
                }}
              >
                <Fa icon={faTimes} class="text-xs" />
              </button>
            </div>

            <Show
              when={
                hasComputedFields() && Object.keys(computedValues()).length > 0
              }
            >
              <div class="px-4 py-2.5 bg-violet-50 border-b border-violet-100">
                <div class="flex items-start gap-2">
                  <div class="w-5 h-5 bg-violet-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Fa
                      icon={faCalculator}
                      class="text-violet-500 text-[9px]"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold text-violet-600 uppercase tracking-wide mb-1">
                      Kalkulasi Otomatis
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <For each={formulas()}>
                        {(formula) => {
                          const resultField = () =>
                            (fields() || []).find(
                              (f) => f.name === formula.result,
                            );
                          const val = () => computedValues()[formula.result];
                          return (
                            <div class="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-violet-100 shadow-sm">
                              <span class="text-[10px] text-gray-500">
                                {resultField()?.label ?? formula.result}:
                              </span>
                              <span class="text-[11px] font-bold text-violet-700">
                                {val() !== null && val() !== undefined
                                  ? resultField()?.type === "currency"
                                    ? "Rp " +
                                      formatNumber(
                                        Math.round(val()!).toString(),
                                      )
                                    : String(val())
                                  : "—"}
                              </span>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            <form
              ref={(el) => (modalForm = el)}
              onSubmit={handleFormSubmit}
              class="flex flex-col flex-1 min-h-0"
            >
              <div class="overflow-y-auto flex-1 px-4 py-3">
                <div ref={(el) => (modalFieldContainer = el)} />
              </div>

              <div class="flex gap-2 px-4 py-3 border-t border-gray-100">
                <button
                  type="button"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm cursor-pointer"
                  onClick={() => {
                    setShowAdd(false);
                    setShowEdit(false);
                  }}
                >
                  <Fa icon={faTimes} class="text-xs" /> Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting()}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting() ? (
                    <>
                      <Fa icon={faSpinner} class="animate-spin text-xs" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Fa icon={faSave} class="text-xs" /> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      <Show when={showConfirmDelete()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmDelete(false);
          }}
        >
          <div class="w-full max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800">Hapus Data</h3>
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => setShowConfirmDelete(false)}
              >
                <Fa icon={faTimes} class="text-xs" />
              </button>
            </div>
            <div class="px-4 py-3">
              <p class="text-sm text-gray-600 leading-snug">
                Yakin ingin menghapus data ini? Tindakan ini{" "}
                <span class="font-medium text-red-500">
                  tidak dapat dibatalkan
                </span>
                .
              </p>
            </div>
            <div class="flex gap-2 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                class="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm cursor-pointer"
                onClick={() => setShowConfirmDelete(false)}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirmLoading()}
                class="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleConfirmDelete}
              >
                {confirmLoading() ? (
                  <Fa icon={faSpinner} class="animate-spin text-xs" />
                ) : null}
                Hapus
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Business;
