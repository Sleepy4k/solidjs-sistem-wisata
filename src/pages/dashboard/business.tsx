import DataTable from "@components/DataTable";
import { Auth, Meta } from "@contexts";
import {
  faArrowDown,
  faArrowUp,
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
  faTimes,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { getCardsData, getColumnsData, getFieldsData } from "@services";
import { Params, useParams } from "@solidjs/router";
import { formatCurrency, toSlug, ucFirst, ucWords } from "@utils";
import Fa from "solid-fa";
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";

interface IParamData extends Params {
  role: string;
  slug?: string;
}

const buttons = [
  {
    id: "add-data",
    icon: faPlus,
    color: "blue",
    text: "Tambah Data",
    mobileText: "Tambah",
  },
  {
    id: "export-excel",
    icon: faFileExcel,
    color: "green",
    text: "Export Excel",
    mobileText: "Excel",
  },
  {
    id: "export-pdf",
    icon: faFilePdf,
    color: "red",
    text: "Export PDF",
    mobileText: "PDF",
  },
  {
    id: "print-table",
    icon: faPrint,
    color: "gray",
    text: "Cetak Tabel",
    mobileText: "Cetak Tabel",
  },
];

const cardMetaData = (cardName: string) => {
  switch (cardName.toLowerCase()) {
    case "total-transactions":
      return {
        color: "blue",
        icon: faDatabase,
      };
    case "transactions-this-month":
      return {
        color: "green",
        icon: faCalendar,
      };
    case "total-income":
      return {
        color: "green",
        icon: faArrowUp,
      };
    case "total-outcome":
      return {
        color: "red",
        icon: faArrowDown,
      };
    case "net-balance":
      return {
        color: "blue",
        icon: faWallet,
      };
    default:
      return {
        color: "gray",
        icon: faMoneyBill,
        isCurrency: false,
      };
  }
};

const Business: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const params = useParams<IParamData>();

  const [fields, _] = createResource(
    () => ({
      role: params.role,
      slug: params.slug || "",
    }),
    getFieldsData
  );
  const [columns, __] = createResource(
    () => ({
      role: params.role,
      slug: params.slug || "",
    }),
    getColumnsData
  );
  const [cards, ___] = createResource(
    () => ({
      role: params.role,
      slug: params.slug || "",
    }),
    getCardsData
  );

  let modalContainer: HTMLDivElement,
    modalTitle: HTMLHeadingElement,
    modalCloseIcon: HTMLButtonElement,
    modalForm: HTMLFormElement,
    modalFieldContainer: HTMLDivElement,
    modalCancelBtn: HTMLButtonElement,
    modalSubmitBtn: HTMLButtonElement;

  let addButton: HTMLButtonElement,
    exportExcelButton: HTMLButtonElement,
    exportPdfButton: HTMLButtonElement,
    printButton: HTMLButtonElement,
    filterContainer: HTMLDivElement,
    filterResetButton: HTMLButtonElement;

  const populateFormFields = (
    fields: Array<{ label: string; name: string; type: string }>
  ) => {
    modalFieldContainer.innerHTML = "";

    fields.forEach((field) => {
      const fieldId = `modal-field-${toSlug(field.name)}`;
      const isRequired = field.required ? "required" : "";
      const requiredMark = isRequired
        ? '<span class="text-red-500">*</span>'
        : "";

      const formWrapper = document.createElement("div");
      formWrapper.className = "form-group mb-4";

      const formLabel = document.createElement("label");
      formLabel.setAttribute("for", fieldId);
      formLabel.className = "block text-gray-700 text-sm font-medium mb-2";
      formLabel.innerHTML = `${field.label} ${requiredMark}`;
      formWrapper.appendChild(formLabel);

      switch (field.type) {
        case "text":
        case "email":
        case "url":
          formWrapper.innerHTML += `
            <input 
              type="${field.type}"
              id="${fieldId}"
              name="${field.name}"
              class=""w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Masukkan ${field.label.toLowerCase()}"
              ${isRequired}
            />
          `;
          break;
        case "number":
          const minimum = field.validation?.min || 0;
          const maximum = field.validation?.max || 100000000000;
          formWrapper.innerHTML += `
            <input 
              type="number"
              id="${fieldId}"
              name="${field.name}"
              min="${minimum}"
              max="${maximum}"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0"
              ${isRequired}
            />
          `;
          break;
        case "currency":
          formWrapper.innerHTML += `
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="number"
                id="${fieldId}"
                name="${field.name}"
                class="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0"
                ${isRequired}
              />
            </div>
          `;
          break;
        case "textarea":
          formWrapper.innerHTML += `
            <textarea
              id="${fieldId}"
              name="${field.name}"
              rows="4"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Masukkan ${field.label.toLowerCase()}"
              ${isRequired}
            ></textarea>
          `;
          break;
        case "select":
          const options = field.options
            ?.map(
              (option) =>
                `<option value="${option.value}">${option.label}</option>`
            )
            .join("");
          formWrapper.innerHTML += `
            <select
              id="${fieldId}"
              name="${field.name}"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              ${isRequired}
            >
              <option value="" disabled selected>Pilih ${field.label.toLowerCase()}</option>
              ${options}
            </select>
          `;
          break;
        case "date":
          formWrapper.innerHTML += `
            <input
              type="date"
              id="${fieldId}"
              name="${field.name}"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              ${isRequired}
            />
          `;
          break;
        case "datetime":
          formWrapper.innerHTML += `
            <input
              type="datetime-local"
              id="${fieldId}"
              name="${field.name}"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              ${isRequired}
            />
          `;
          break;
        case "boolean":
          formWrapper.innerHTML += `
            <div class="flex items-center">
              <input
                type="checkbox" 
                id="${fieldId}"
                name="${field.name}"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label for="${fieldId}" class="text-sm font-medium text-gray-700">
                ${field.label}
              </label>
            </div>
          `;
          break;
      }

      modalFieldContainer.appendChild(formWrapper);
    });
  };

  const openModal = () => {
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("flex");
  };

  const closeModal = () => {
    modalContainer.classList.remove("flex");
    modalContainer.classList.add("hidden");
  };

  onMount(() => {
    addButton.addEventListener("click", () => {
      modalTitle.textContent = "Tambah Data";
      populateFormFields(fields() || []);
      openModal();
    });

    modalCancelBtn.addEventListener("click", closeModal);
    modalCloseIcon.addEventListener("click", closeModal);

    onCleanup(() => {
      addButton.removeEventListener("click", () => {});
      modalCancelBtn.removeEventListener("click", closeModal);
      modalCloseIcon.removeEventListener("click", closeModal);
    });
  });

  createEffect(() => {
    changeTitle(
      `${ucFirst(params.role)}${
        params.slug ? ` - ${ucWords(params.slug)}` : ""
      }`
    );
  });

  return (
    <>
      <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Show
          when={cards() && cards.state === "ready"}
          fallback={
            <For each={[1, 2, 3, 4, 5]}>
              {() => (
                <div class="animate-pulse bg-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl h-18 md:h-28 shadow-lg"></div>
              )}
            </For>
          }
        >
          <For each={cards()}>
            {(card) => {
              const metaData = cardMetaData(card.name);
              return (
                <div class="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-4 md:p-5 lg:p-6 shadow-lg card-hover">
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0 pr-2">
                      <p class="text-gray-600 text-[10px] sm:text-lg font-medium mb-1 leading-tight">
                        {card.title}
                      </p>
                      <p
                        class={`text-base text-2xl md:text-sm lg:text-xl font-bold text-${metaData.color}-600 truncate`}
                        id="total-transactions"
                      >
                        {card.is_currency
                          ? formatCurrency(card.value) + ",00"
                          : card.value}
                      </p>
                    </div>
                    <div
                      class={`w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-${metaData.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <Fa
                        icon={metaData.icon}
                        size="lg"
                        class="text-sm xs:text-base sm:text-lg md:text-xl"
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </div>

      <div class="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 class="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            Filter dan Aksi Data
          </h2>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <For each={buttons}>
              {(button) => (
                <button
                  ref={(el) => {
                    if (button.id === "add-data") addButton = el;
                    else if (button.id === "export-excel")
                      exportExcelButton = el;
                    else if (button.id === "export-pdf") exportPdfButton = el;
                    else if (button.id === "print-table") printButton = el;
                  }}
                  class="text-white px-4 py-2 md:px-6 md:py-2 rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
                  classList={{
                    "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700":
                      button.color === "blue",
                    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700":
                      button.color === "green",
                    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700":
                      button.color === "red",
                    "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700":
                      button.color === "gray",
                  }}
                >
                  <div class="flex items-center justify-center">
                    <Fa icon={button.icon} class="mr-2" />
                    <span class="hidden sm:inline">{button.text}</span>
                    <span class="sm:hidden">{button.mobileText}</span>
                  </div>
                </button>
              )}
            </For>

            <button
              ref={(el) => (filterResetButton = el)}
              class="bg-gray-200 text-gray-700 px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <div class="flex items-center justify-center">
                <Fa icon={faRefresh} class="mr-2" />
                Reset Filter
              </div>
            </button>
          </div>
        </div>

        <div
          ref={(el) => (filterContainer = el)}
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              <div class="flex items-center">
                <Fa icon={faCalendarAlt} class="mr-1 text-gray-500" />
                Dari Tanggal
              </div>
            </label>
            <input
              type="date"
              id="filter-date-from"
              class="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${appConfig.color}-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              <div class="flex items-center">
                <Fa icon={faCalendarCheck} class="mr-1 text-gray-500" />
                Sampai Tanggal
              </div>
            </label>
            <input
              type="date"
              id="filter-date-to"
              class="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${appConfig.color}-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <Show
            when={fields() && fields.state === "ready"}
            fallback={
              <For each={[1, 2]}>
                {() => (
                  <div>
                    <label class="block bg-gray-200 rounded-md h-6 mb-2 animate-pulse"></label>
                    <div class="w-full bg-gray-200 rounded-md h-10 animate-pulse"></div>
                  </div>
                )}
              </For>
            }
          >
            <For each={fields()}>
              {(field) =>
                field.filterable ? (
                  <div>
                    <label class="block text-gray-700 text-sm font-medium mb-2">
                      <div class="flex items-center">
                        <Fa icon={faFilter} class="mr-1 text-gray-500" />
                        {field.label}
                      </div>
                    </label>
                    <Switch>
                      <Match when={field.type === "select"}>
                        <select
                          id={`filter-${field.name}`}
                          class="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
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
                          id={`filter-${field.name}`}
                          class="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
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

      <DataTable
        columns={columns}
        endpoint={`/dashboard/${params.role}/${params.slug}`}
        action={{
          enableEdit: true,
          enableDelete: true,
          onEdit: (row) => {
            console.log("Edit row:", row);
          },
          onDelete: (row) => {
            console.log("Delete row:", row);
          },
        }}
      />

      <div
        ref={(el) => (modalContainer = el)}
        class="fixed inset-0 bg-white/70 backdrop-blur-sm hidden items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3
              ref={(el) => (modalTitle = el)}
              class="text-lg md:text-xl font-bold text-gray-800"
            ></h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              ref={(el) => (modalCloseIcon = el)}
            >
              <Fa icon={faTimes} size="lg" />
            </button>
          </div>

          <form class="space-y-4" ref={(el) => (modalForm = el)}>
            <div ref={(el) => (modalFieldContainer = el)}></div>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                ref={(el) => (modalCancelBtn = el)}
                class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium text-sm md:text-base cursor-pointer"
              >
                <div class="flex items-center justify-center">
                  <Fa icon={faTimes} class="mr-2" />
                  Batal
                </div>
              </button>
              <button
                type="submit"
                ref={(el) => (modalSubmitBtn = el)}
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium text-sm md:text-base cursor-pointer"
              >
                <div class="flex items-center justify-center">
                  <Fa icon={faSave} class="mr-2" />
                  Simpan
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Business;
