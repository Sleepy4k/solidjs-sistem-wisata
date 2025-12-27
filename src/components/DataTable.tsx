import { createSignal, createEffect, Show, For, on } from "solid-js";
import {
  createSolidTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  PaginationState,
  SortingState,
  OnChangeFn,
} from "@tanstack/solid-table";
import { api } from "@services";

type ColumnApiResponse = {
  status: boolean;
  message: string;
  data: {
    data: string;
    name: string;
    title: string;
    sortable?: boolean;
    searchable?: boolean;
  }[];
};

type BackendColumn = {
  data: string;
  name: string;
  title: string;
  sortable?: boolean;
  searchable?: boolean;
};

type DataTableApiResponse<T = any> = {
  data: T[];
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
};

interface DataTableProps {
  endpoint: string;
  columnsEndpoint?: string;
}

export default function DataTable(props: DataTableProps) {
  const [draw, setDraw] = createSignal<number>(0);
  const [data, setData] = createSignal<any[]>([]);
  const [columns, setColumns] = createSignal<ColumnDef<any>[]>([]);
  const [isConfigLoading, setIsConfigLoading] = createSignal(true);
  const [isDataLoading, setIsDataLoading] = createSignal(false);
  const [error, setError] = createSignal<string>("");

  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [globalFilter, setGlobalFilter] = createSignal("");
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = createSignal("");
  const [pageCount, setPageCount] = createSignal(0);
  const [recordsTotal, setRecordsTotal] = createSignal(0);
  const [recordsFiltered, setRecordsFiltered] = createSignal(0);

  let searchDebounceTimer: number | undefined;

  const fetchConfig = async () => {
    const url = props.columnsEndpoint || `${props.endpoint}/columns`;

    try {
      const response = await api.get<ColumnApiResponse>(url);

      if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

      const json = response.data;
      const colsData = json.data || json;

      setColumns(
        colsData.map((col: BackendColumn) => ({
          accessorKey: col.data,
          header: col.title,
          enableSorting: col.sortable !== false,
        }))
      );
      setError("");
    } catch (err) {
      setError("Failed to load table configuration");
      console.error("Config error:", err);
    } finally {
      setIsConfigLoading(false);
    }
  };

  const fetchData = async () => {
    if (isConfigLoading()) return;

    setIsDataLoading(true);
    setError("");

    const params: Record<string, any> = {
      start: String(pagination().pageIndex * pagination().pageSize),
      length: String(pagination().pageSize),
    };

    if (debouncedGlobalFilter()) {
      params["search[value]"] = debouncedGlobalFilter();
      params["search[regex]"] = "false";
    }

    const sortState = sorting();

    if (sortState.length > 0) {
      sortState.forEach((sort, index) => {
        const columnIndex = columns().findIndex(
          (col: any) => col.accessorKey === sort.id
        );

        if (columnIndex !== -1) {
          params[`order[${index}][column]`] = String(columnIndex);
          params[`order[${index}][dir]`] = sort.desc ? "desc" : "asc";
        }
      });
    }

    columns().forEach((col: any, index) => {
      params[`columns[${index}][data]`] = col.accessorKey;
      params[`columns[${index}][name]`] = col.accessorKey;
      params[`columns[${index}][searchable]`] = "true";
      params[`columns[${index}][orderable]`] =
        col.enableSorting !== false ? "true" : "false";
      params[`columns[${index}][search][value]`] = "";
      params[`columns[${index}][search][regex]`] = "false";
    });

    setDraw((d) => d + 1);
    params.draw = String(draw());

    try {
      const response = await api.get<DataTableApiResponse>(props.endpoint, {
        params,
      });

      if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

      const json = response.data;
      const rows = Array.isArray(json.data) ? json.data : [];

      setData(rows);
      setRecordsTotal(json.recordsTotal || 0);
      setRecordsFiltered(json.recordsFiltered || 0);

      const totalPages = Math.ceil(
        (json.recordsFiltered || 0) / pagination().pageSize
      );
      setPageCount(totalPages);
    } catch (err) {
      setError("Failed to load data");
      console.error("Data error:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setGlobalFilter(value);

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      setDebouncedGlobalFilter(value);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 300) as unknown as number;
  };

  const getPageNumbers = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  createEffect(
    on(
      () => props.endpoint,
      () => {
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
        }

        setData([]);
        setColumns([]);
        setIsConfigLoading(true);
        setPagination({ pageIndex: 0, pageSize: 10 });
        setSorting([]);
        setGlobalFilter("");
        setDebouncedGlobalFilter("");
        setPageCount(0);
        setRecordsTotal(0);
        setRecordsFiltered(0);
        fetchConfig();
      }
    )
  );

  createEffect(
    on(
      [isConfigLoading, pagination, sorting, debouncedGlobalFilter],
      ([loading]) => !loading && fetchData()
    )
  );

  const table = createSolidTable({
    get data() {
      return data();
    },
    get columns() {
      return columns();
    },
    get pageCount() {
      return pageCount();
    },
    state: {
      get pagination() {
        return pagination();
      },
      get sorting() {
        return sorting();
      },
      get globalFilter() {
        return debouncedGlobalFilter();
      },
    },
    onPaginationChange: setPagination as OnChangeFn<PaginationState>,
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div class="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <Show when={error()}>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p class="text-red-700 font-medium">{error()}</p>
        </div>
      </Show>

      <Show
        when={!isConfigLoading()}
        fallback={
          <div class="h-96 flex items-center justify-center">
            <div class="text-center">
              <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
              <p class="text-gray-500 text-sm">Loading table...</p>
            </div>
          </div>
        }
      >
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onInput={(e) => table.setPageSize(Number(e.currentTarget.value))}
              class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <For each={[10, 25, 50, 100]}>
                {(size) => <option value={size}>{size}</option>}
              </For>
            </select>
            <span class="text-sm text-gray-600">entries</span>
          </div>

          <div class="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter()}
              onInput={(e) => handleSearchInput(e.currentTarget.value)}
              class="border border-gray-300 rounded-md px-4 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Show when={globalFilter() !== debouncedGlobalFilter()}>
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-blue-600"></div>
              </div>
            </Show>
          </div>
        </div>

        <div class="relative overflow-x-auto">
          <Show when={isDataLoading()}>
            <div class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-blue-600"></div>
                <span class="text-gray-600 text-sm">Loading...</span>
              </div>
            </div>
          </Show>

          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                  <tr>
                    <For each={headerGroup.headers}>
                      {(header) => (
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider transition-colors"
                          classList={{
                            "cursor-pointer hover:bg-gray-100 select-none":
                              header.column.getCanSort(),
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div class="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <Show when={header.column.getCanSort()}>
                              <span class="text-gray-400 text-sm">
                                {header.column.getIsSorted() === "asc"
                                  ? "↑"
                                  : header.column.getIsSorted() === "desc"
                                  ? "↓"
                                  : "↕"}
                              </span>
                            </Show>
                          </div>
                        </th>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <Show
                when={table.getRowModel().rows.length > 0}
                fallback={
                  <tr>
                    <td
                      colSpan={columns().length}
                      class="px-6 py-16 text-center text-gray-500 text-sm"
                    >
                      No data available
                    </td>
                  </tr>
                }
              >
                <For each={table.getRowModel().rows}>
                  {(row) => (
                    <tr class="hover:bg-gray-50 transition-colors">
                      <For each={row.getVisibleCells()}>
                        {(cell) => (
                          <td class="px-6 py-4 text-sm text-gray-900">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            Showing{" "}
            <span class="font-medium">
              {pagination().pageIndex * pagination().pageSize + 1}
            </span>{" "}
            to{" "}
            <span class="font-medium">
              {Math.min(
                (pagination().pageIndex + 1) * pagination().pageSize,
                recordsFiltered()
              )}
            </span>{" "}
            of <span class="font-medium">{recordsFiltered()}</span> entries
            {recordsFiltered() !== recordsTotal() && (
              <span class="text-gray-500">
                {" "}
                (filtered from {recordsTotal()} total entries)
              </span>
            )}
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>

            <div class="hidden sm:flex items-center gap-1">
              <For each={getPageNumbers()}>
                {(page) => (
                  <Show
                    when={typeof page === "number"}
                    fallback={<span class="px-2 text-gray-400">...</span>}
                  >
                    <button
                      class="min-w-[2rem] px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      classList={{
                        "bg-blue-600 text-white":
                          table.getState().pagination.pageIndex + 1 === page,
                        "border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer":
                          table.getState().pagination.pageIndex + 1 !== page,
                      }}
                      disabled={
                        table.getState().pagination.pageIndex + 1 === page
                      }
                      onClick={() => table.setPageIndex((page as number) - 1)}
                    >
                      {page}
                    </button>
                  </Show>
                )}
              </For>
            </div>

            <div class="flex sm:hidden items-center gap-2">
              <span class="px-3 py-1.5 text-sm font-medium text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
            </div>

            <button
              class="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
