import { Meta } from "@contexts";
import {
  faPlus,
  faSave,
  faTrash,
  faChevronDown,
  faChevronUp,
  faSearch,
  faTimes,
  faStore,
  faBuilding,
  faLeaf,
  faFish,
  faStar,
  faHeart,
  faHome,
  faCar,
  faUtensils,
  faShoppingCart,
  faBoxOpen,
  faMoneyBill,
  faChartLine,
  faUsers,
  faCog,
  faTag,
  faGlobe,
  faBolt,
  faWater,
  faMountain,
  faTree,
  faSeedling,
  faPaw,
  faTractor,
  faIndustry,
  faHammer,
  faTools,
  faWrench,
  faBriefcase,
  faLandmark,
  faMosque,
  faSchool,
  faHospital,
  faHotel,
  faCamera,
  faMusic,
  faGamepad,
  faPalette,
  faFlask,
  faMicroscope,
  faLaptop,
  faMobile,
  faWifi,
  faTruck,
  faShip,
  faPlane,
  faBus,
  faBicycle,
  faMotorcycle,
  faGripVertical,
  faArrowLeft,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "@solidjs/router";
import { ucFirst, success, error as toastError } from "@utils";
import { api } from "@services";
import Fa from "solid-fa";
import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

const iconCatalog = [
  { name: "store",         icon: faStore        },
  { name: "building",      icon: faBuilding     },
  { name: "leaf",          icon: faLeaf         },
  { name: "fish",          icon: faFish         },
  { name: "star",          icon: faStar         },
  { name: "heart",         icon: faHeart        },
  { name: "home",          icon: faHome         },
  { name: "car",           icon: faCar          },
  { name: "utensils",      icon: faUtensils     },
  { name: "shopping-cart", icon: faShoppingCart },
  { name: "box-open",      icon: faBoxOpen      },
  { name: "money-bill",    icon: faMoneyBill    },
  { name: "chart-line",    icon: faChartLine    },
  { name: "users",         icon: faUsers        },
  { name: "cog",           icon: faCog          },
  { name: "tag",           icon: faTag          },
  { name: "globe",         icon: faGlobe        },
  { name: "bolt",          icon: faBolt         },
  { name: "water",         icon: faWater        },
  { name: "mountain",      icon: faMountain     },
  { name: "tree",          icon: faTree         },
  { name: "seedling",      icon: faSeedling     },
  { name: "paw",           icon: faPaw          },
  { name: "tractor",       icon: faTractor      },
  { name: "industry",      icon: faIndustry     },
  { name: "hammer",        icon: faHammer       },
  { name: "tools",         icon: faTools        },
  { name: "wrench",        icon: faWrench       },
  { name: "briefcase",     icon: faBriefcase    },
  { name: "landmark",      icon: faLandmark     },
  { name: "mosque",        icon: faMosque       },
  { name: "school",        icon: faSchool       },
  { name: "hospital",      icon: faHospital     },
  { name: "hotel",         icon: faHotel        },
  { name: "camera",        icon: faCamera       },
  { name: "music",         icon: faMusic        },
  { name: "gamepad",       icon: faGamepad      },
  { name: "palette",       icon: faPalette      },
  { name: "flask",         icon: faFlask        },
  { name: "microscope",    icon: faMicroscope   },
  { name: "laptop",        icon: faLaptop       },
  { name: "mobile",        icon: faMobile       },
  { name: "wifi",          icon: faWifi         },
  { name: "truck",         icon: faTruck        },
  { name: "ship",          icon: faShip         },
  { name: "plane",         icon: faPlane        },
  { name: "bus",           icon: faBus          },
  { name: "bicycle",       icon: faBicycle      },
  { name: "motorcycle",    icon: faMotorcycle   },
];

const INPUT_TYPES = [
  { value: "text",     label: "Teks"         },
  { value: "number",   label: "Angka"        },
  { value: "currency", label: "Mata Uang"    },
  { value: "date",     label: "Tanggal"      },
  { value: "datetime", label: "Tgl & Waktu"  },
  { value: "select",   label: "Pilihan"      },
  { value: "textarea", label: "Teks Panjang" },
  { value: "email",    label: "Email"        },
  { value: "url",      label: "URL"          },
  { value: "boolean",  label: "Ya / Tidak"   },
];

const TYPE_COLORS: Record<string, string> = {
  text:     "bg-slate-100 text-slate-600",
  number:   "bg-orange-50 text-orange-600",
  currency: "bg-emerald-50 text-emerald-600",
  date:     "bg-blue-50 text-blue-600",
  datetime: "bg-indigo-50 text-indigo-600",
  select:   "bg-purple-50 text-purple-600",
  textarea: "bg-slate-100 text-slate-600",
  email:    "bg-pink-50 text-pink-600",
  url:      "bg-cyan-50 text-cyan-600",
  boolean:  "bg-teal-50 text-teal-600",
};

interface FieldOption { label: string; value: string; }

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

const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const toSlugLocal = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

const defaultFields = (): BusinessField[] => [
  {
    id: generateId(), label: "Tanggal Transaksi", name: "transaction_date",
    type: "date", order: 1, placeholder: "", required: true, filterable: true,
    validation: {}, options: [], expanded: false,
  },
  {
    id: generateId(), label: "Jumlah", name: "amount",
    type: "currency", order: 2, placeholder: "0", required: true, filterable: false,
    validation: { min: 0 }, options: [], expanded: false,
  },
  {
    id: generateId(), label: "Keterangan", name: "description",
    type: "textarea", order: 3, placeholder: "Masukkan keterangan", required: false, filterable: false,
    validation: {}, options: [], expanded: false,
  },
];

const AddBusiness: Component = () => {
  const { changeTitle } = Meta.useMeta();
  const params = useParams<{ role: string }>();
  const navigate = useNavigate();

  createEffect(() => changeTitle(`Tambah Usaha — ${ucFirst(params.role)}`));

  const [businessName, setBusinessName] = createSignal("");
  const [selectedIcon, setSelectedIcon] = createSignal<string | null>(null);
  const [iconSearch, setIconSearch] = createSignal("");
  const [iconPickerOpen, setIconPickerOpen] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [fields, setFields] = createStore<BusinessField[]>(defaultFields());

  const filteredIcons = () =>
    iconSearch()
      ? iconCatalog.filter((i) => i.name.includes(iconSearch().toLowerCase()))
      : iconCatalog;

  const selectedIconObj = () =>
    iconCatalog.find((i) => i.name === selectedIcon()) ?? null;

  const addField = () =>
    setFields((f) => [
      ...f,
      {
        id: generateId(), label: "Field Baru", name: "field_baru",
        type: "text", order: f.length + 1, placeholder: "",
        required: false, filterable: false, validation: {}, options: [], expanded: true,
      },
    ]);

  const removeField = (id: string) =>
    setFields((f) => f.filter((field) => field.id !== id));

  const toggleExpand = (id: string) =>
    setFields((f) => f.id === id, "expanded", (v) => !v);

  const updateField = (id: string, key: keyof BusinessField, value: any) =>
    setFields((f) => f.id === id, key as any, value);

  const updateValidation = (id: string, key: string, value: any) => {
    const stringKeys = ["pattern", "patternMessage"];
    const parsed = value === "" ? undefined : stringKeys.includes(key) ? value : Number(value);
    setFields((f) => f.id === id, "validation", (v) => ({ ...v, [key]: parsed }));
  };

  const addOption = (id: string) =>
    setFields((f) => f.id === id, "options", (opts) => [...opts, { label: "", value: "" }]);

  const updateOption = (fieldId: string, idx: number, key: keyof FieldOption, val: string) =>
    setFields((f) => f.id === fieldId, "options", idx, key, val);

  const removeOption = (fieldId: string, idx: number) =>
    setFields((f) => f.id === fieldId, "options", (opts) => opts.filter((_, i) => i !== idx));

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!businessName().trim()) { toastError("Nama usaha wajib diisi.", "Error"); return; }
    setIsSubmitting(true);
    try {
      const buildValidationRules = (f: BusinessField): string[] => {
        const rules: string[] = [];
        if (f.required) rules.push("required");
        if (f.type === "currency" || f.type === "number") rules.push("numeric");
        if (f.type === "text" || f.type === "textarea")   rules.push("string");
        if (f.type === "email")                           rules.push("email");
        if (f.type === "url")                             rules.push("url");
        if ((f.type === "number" || f.type === "currency") && f.validation.min !== undefined && !isNaN(f.validation.min))
          rules.push(`min:${f.validation.min}`);
        if ((f.type === "number" || f.type === "currency") && f.validation.max !== undefined && !isNaN(f.validation.max))
          rules.push(`max:${f.validation.max}`);
        if ((f.type === "text" || f.type === "textarea") && f.validation.minLength !== undefined && !isNaN(f.validation.minLength))
          rules.push(`min:${f.validation.minLength}`);
        if ((f.type === "text" || f.type === "textarea") && f.validation.maxLength !== undefined && !isNaN(f.validation.maxLength))
          rules.push(`max:${f.validation.maxLength}`);
        if (f.type === "select" && f.options.length > 0) {
          const vals = f.options.map((o) => o.value).filter(Boolean).join(",");
          if (vals) rules.push(`in:${vals}`);
        }
        if (f.validation.pattern) rules.push(`regex:${f.validation.pattern}`);
        return rules;
      };

      const payload = {
        name: businessName().trim(),
        icon: selectedIcon(),
        fields: fields.map((f, i) => ({
          name: f.name,
          label: f.label,
          type: f.type === "currency" ? "number" : f.type,
          order: i + 1,
          placeholder: f.placeholder,
          validation_rules: buildValidationRules(f),
          options: f.type === "select"
            ? f.options.map((o) => o.value).filter(Boolean)
            : [],
        })),
      };
      console.log("Payload:", JSON.stringify(payload, null, 2));
      const res = await api.post(`/dashboard/${params.role}/business`, payload);
      if (res.status === 200 || res.status === 201) {
        success("Usaha berhasil ditambahkan.", "Berhasil");
        navigate("/");
      } else {
        toastError("Gagal menambahkan usaha.", "Error");
      }
    } catch (err: any) {
      const data = err?.response?.data;
      console.error("Error detail:", JSON.stringify(data, null, 2));
      const msg = data?.message ?? data?.error ?? "Terjadi kesalahan.";
      const errDetail = data?.errors ? "\n" + JSON.stringify(data.errors, null, 2) : "";
      console.error("Errors:", errDetail);
      toastError(msg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div class="w-full pb-20">
      <form onSubmit={handleSubmit} class="space-y-3">

        <div class="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">

          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
              <Fa icon={faStore} class="text-white text-xs" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">Informasi Usaha</p>
              <p class="text-xs text-gray-400">Nama dan identitas usaha</p>
            </div>
          </div>

          <div class="px-5 py-5 space-y-5">

            <div>
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

            <div>
              <label class={labelCls}>
                Ikon <span class="normal-case font-normal tracking-normal text-gray-300">(opsional)</span>
              </label>

              <button
                type="button"
                class={
                  "w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl " +
                  "transition-all duration-200 bg-white cursor-pointer " +
                  (iconPickerOpen()
                    ? "border-blue-400 ring-2 ring-blue-500/20"
                    : "border-gray-200 hover:border-gray-300")
                }
                onClick={() => setIconPickerOpen((v) => !v)}
              >
                <div class="flex items-center gap-3">
                  <Show
                    when={selectedIconObj()}
                    fallback={
                      <div class="flex items-center gap-3">
                        <div class="w-7 h-7 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                          <Fa icon={faStar} class="text-gray-200 text-xs" />
                        </div>
                        <span class="text-sm text-gray-300">Pilih ikon...</span>
                      </div>
                    }
                  >
                    <div class="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
                      <Fa icon={selectedIconObj()!.icon} class="text-white text-xs" />
                    </div>
                    <span class="text-sm font-medium text-gray-700">{selectedIcon()}</span>
                  </Show>
                </div>
                <Fa icon={iconPickerOpen() ? faChevronUp : faChevronDown} class="text-gray-300 text-xs" />
              </button>

              <Show when={iconPickerOpen()}>
                <div class="mt-2 border border-gray-200 rounded-2xl bg-white shadow-xl shadow-gray-100 overflow-hidden">
                  <div class="p-2.5 border-b border-gray-100 bg-gray-50">
                    <div class="relative">
                      <Fa icon={faSearch} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                      <input
                        type="text"
                        class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                        placeholder="Cari ikon..."
                        value={iconSearch()}
                        onInput={(e) => setIconSearch(e.currentTarget.value)}
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-9 gap-1 p-2.5 max-h-44 overflow-y-auto">
                    <button
                      type="button"
                      class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-300 cursor-pointer border border-dashed border-gray-200 transition-all"
                      title="Tanpa ikon"
                      onClick={() => { setSelectedIcon(null); setIconPickerOpen(false); }}
                    >
                      <Fa icon={faTimes} class="text-xs" />
                    </button>
                    <For each={filteredIcons()}>
                      {(item) => (
                        <button
                          type="button"
                          title={item.name}
                          class="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                          classList={{
                            "bg-blue-600 text-white shadow-sm": selectedIcon() === item.name,
                            "hover:bg-gray-100 text-gray-500": selectedIcon() !== item.name,
                          }}
                          onClick={() => { setSelectedIcon(item.name); setIconPickerOpen(false); }}
                        >
                          <Fa icon={item.icon} />
                        </button>
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">

          <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Fa icon={faTag} class="text-white text-xs" />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-800">Field Transaksi</p>
                <p class="text-xs text-gray-400">Muncul saat input data transaksi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addField}
              class="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
            >
              <Fa icon={faPlus} class="text-[9px]" />
              Tambah Field
            </button>
          </div>

          <div class="p-3 space-y-2">

            <For each={fields}>
              {(field, idx) => (
                <div class="bg-gray-50 rounded-xl border border-gray-200/60 overflow-hidden">

                  <div class="flex items-center gap-2.5 px-3.5 py-3">
                    <Fa icon={faGripVertical} class="text-gray-300 cursor-grab flex-shrink-0" />

                    <div class="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span class="text-[9px] font-bold text-gray-500">{idx() + 1}</span>
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-800 truncate leading-tight">{field.label}</p>
                      <p class="text-[10px] text-gray-400 font-mono truncate">{field.name}</p>
                    </div>

                    <span class={`hidden sm:block text-[10px] font-bold px-2.5 py-1 rounded-lg ${TYPE_COLORS[field.type] ?? "bg-gray-100 text-gray-500"}`}>
                      {INPUT_TYPES.find((t) => t.value === field.type)?.label ?? field.type}
                    </span>

                    <div class="flex items-center gap-0.5">
                      <button
                        type="button"
                        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                        onClick={() => toggleExpand(field.id)}
                      >
                        <Fa icon={field.expanded ? faChevronUp : faChevronDown} class="text-xs" />
                      </button>
                      <button
                        type="button"
                        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                        onClick={() => removeField(field.id)}
                      >
                        <Fa icon={faTrash} class="text-[10px]" />
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
                            onInput={(e) => {
                              updateField(field.id, "label", e.currentTarget.value);
                              updateField(field.id, "name", toSlugLocal(e.currentTarget.value));
                            }}
                          />
                        </div>
                        <div>
                          <label class={labelCls}>
                            Nama Field <span class="normal-case font-normal tracking-normal text-gray-300">(snake_case)</span>
                          </label>
                          <input
                            type="text"
                            class={`${inputCls} font-mono`}
                            value={field.name}
                            onInput={(e) => updateField(field.id, "name", toSlugLocal(e.currentTarget.value))}
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
                                  [`${TYPE_COLORS[t.value] ?? "bg-gray-800 text-white"} border-transparent shadow-sm`]: field.type === t.value,
                                  "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50": field.type !== t.value,
                                }}
                                onClick={() => updateField(field.id, "type", t.value)}
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
                          onInput={(e) => updateField(field.id, "placeholder", e.currentTarget.value)}
                        />
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
                              onInput={(e) => updateValidation(field.id, "min", e.currentTarget.value)}
                            />
                          </div>
                          <div>
                            <label class={labelCls}>Nilai Maksimum</label>
                            <input
                              type="number"
                              class={inputCls}
                              placeholder="Tidak dibatasi"
                              value={field.validation.max ?? ""}
                              onInput={(e) => updateValidation(field.id, "max", e.currentTarget.value)}
                            />
                          </div>
                        </div>
                      </Show>

                      <Show when={field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "url"}>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class={labelCls}>Min Karakter</label>
                            <input
                              type="number"
                              class={inputCls}
                              placeholder="0"
                              value={field.validation.minLength ?? ""}
                              onInput={(e) => updateValidation(field.id, "minLength", e.currentTarget.value)}
                            />
                          </div>
                          <div>
                            <label class={labelCls}>Maks Karakter</label>
                            <input
                              type="number"
                              class={inputCls}
                              placeholder="Tidak dibatasi"
                              value={field.validation.maxLength ?? ""}
                              onInput={(e) => updateValidation(field.id, "maxLength", e.currentTarget.value)}
                            />
                          </div>
                        </div>
                      </Show>

                      <Show when={field.type === "text"}>
                        <div class="space-y-3">
                          <div>
                            <label class={labelCls}>
                              Pola Regex <span class="normal-case font-normal tracking-normal text-gray-300">(opsional)</span>
                            </label>
                            <input
                              type="text"
                              class={`${inputCls} font-mono`}
                              placeholder="cth. ^[A-Z]{3}\d{4}$"
                              value={field.validation.pattern ?? ""}
                              onInput={(e) => updateValidation(field.id, "pattern", e.currentTarget.value)}
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
                                onInput={(e) => updateValidation(field.id, "patternMessage", e.currentTarget.value)}
                              />
                            </div>
                          </Show>
                        </div>
                      </Show>

                      <Show when={field.type === "date" || field.type === "datetime"}>
                        <p class="text-xs text-gray-300 italic">Validasi tanggal ditentukan saat input transaksi.</p>
                      </Show>

                      <Show when={field.type === "boolean" || field.type === "select"}>
                        <p class="text-xs text-gray-300 italic">Tidak ada aturan validasi untuk tipe ini.</p>
                      </Show>

                      <Show when={field.type === "select"}>
                        {sectionDivider("Daftar Pilihan")}
                        <div>
                          <div class="flex items-center justify-between mb-2.5">
                            <p class="text-xs text-gray-400">Tambahkan opsi yang bisa dipilih</p>
                            <button
                              type="button"
                              class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                              onClick={() => addOption(field.id)}
                            >
                              <Fa icon={faPlus} class="text-[9px]" />
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
                                      updateOption(field.id, idx(), "label", e.currentTarget.value);
                                      updateOption(field.id, idx(), "value", toSlugLocal(e.currentTarget.value));
                                    }}
                                  />
                                  <input
                                    type="text"
                                    class={`${inputCls} w-32 font-mono text-xs`}
                                    placeholder="value"
                                    value={opt.value}
                                    onInput={(e) => updateOption(field.id, idx(), "value", e.currentTarget.value)}
                                  />
                                  <button
                                    type="button"
                                    class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                                    onClick={() => removeOption(field.id, idx())}
                                  >
                                    <Fa icon={faTimes} class="text-xs" />
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
              )}
            </For>

            <Show when={fields.length === 0}>
              <div class="border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center text-center">
                <div class="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <Fa icon={faTag} class="text-gray-300" />
                </div>
                <p class="text-sm font-semibold text-gray-400">Belum ada field</p>
                <p class="text-xs text-gray-300 mt-0.5">Klik "Tambah Field" untuk mulai</p>
              </div>
            </Show>

          </div>
        </div>

        <div class="flex gap-2.5 sticky bottom-4 pt-1">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 bg-white text-gray-600 py-3 px-5 text-sm font-semibold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all cursor-pointer shadow-sm"
            onClick={() => navigate("/")}
          >
            <Fa icon={faArrowLeft} class="text-xs" />
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting()}
            class="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 text-sm font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            <Fa
              icon={isSubmitting() ? faSearch : faSave}
              class={`text-xs ${isSubmitting() ? "animate-spin" : ""}`}
            />
            {isSubmitting() ? "Menyimpan..." : "Simpan Usaha"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddBusiness;