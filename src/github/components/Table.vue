<script lang="ts">
type Cell = Record<string, unknown>;

export type Cols<Rows extends Cell[] = Cell[]> = {
  /** key of row object to access as default cell value */
  key: Extract<keyof Rows[number], string>;
  /** slot name for custom cell rendering */
  slot?: string;
  /** label for header */
  name: string;
  /** icon for header */
  icon?: unknown;
  /** horizontal alignment */
  align?: "left" | "center" | "right";
  /** cell attributes */
  attrs?: HTMLAttributes | ((row?: Rows[number]) => HTMLAttributes);
  /** cell style */
  style?: CSSProperties;
  /** should column be sortable */
  sortable?: boolean;
}[];

declare module "@tanstack/vue-table" {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends RowData, TValue> {
    colProp: Cols<Cell[]>[number];
  }
}
</script>

<script setup lang="ts" generic="Rows extends Cell[]">
import {
  computed,
  type CSSProperties,
  type HTMLAttributes,
  type VNode,
} from "vue";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type Row as TanstackRow,
} from "@tanstack/vue-table";
import type { RowData, SortingFn, SortingState } from "@tanstack/vue-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";
import { formatValue } from "@/util/string";
import Select from "./Select.vue";

type Props = {
  cols: Cols<Rows>;
  rows: Rows;
  sort?: SortingState;
};

const props = defineProps<Props>();

type SlotNames = string;

type Row = Rows[number];

defineSlots<{
  [slot in SlotNames]: ({ row }: { row: Row }) => VNode;
}>();

const columnHelper = createColumnHelper<Row>();

/** custom sorting function */
const sortingFunction: SortingFn<Row> = (
  a: TanstackRow<Row>,
  b: TanstackRow<Row>,
  columnId: string,
) => {
  /** get row values */
  const aValue = a.getValue<Required<unknown>>(columnId);
  const bValue = b.getValue<Required<unknown>>(columnId);
  /** compare arrays by length */
  const aCompare = Array.isArray(aValue) ? aValue.length : aValue;
  const bCompare = Array.isArray(bValue) ? bValue.length : bValue;
  /** basic compare */
  if (aCompare < bCompare) return -1;
  if (aCompare > bCompare) return 1;
  return 0;
};

/** column definitions */
const columns = computed(() =>
  props.cols.map((col) =>
    columnHelper.accessor((row: Row) => row[col.key], {
      /** unique column id */
      id: col.key,
      /** name */
      header: col.name,
      /** sortable */
      enableSorting: col.sortable ?? true,
      /** sorting function */
      sortingFn: sortingFunction,
      /** put nullish values lower */
      sortUndefined: -1,
      /** extra metadata */
      meta: {
        colProp: col,
      },
    }),
  ),
);

/** note: https://github.com/TanStack/table/issues/5653 */

/** tanstack table api */
const table = useVueTable({
  /** https://github.com/TanStack/table/discussions/4455 */
  get data() {
    return props.rows;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getFacetedMinMaxValues: getFacetedMinMaxValues(),
  initialState: {
    sorting: props.sort,
    pagination: {
      pageIndex: 0,
      pageSize: 50,
    },
  },
});

/** get cell style from col definition */
const cellStyle = (col?: Cols[number]) => ({
  textAlign: col?.align ?? "center",
  justifyContent: {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[col?.align ?? "center"],
  ...col?.style,
});

/** get cell attrs from col definition */
const cellAttrs = (col?: Cols[number], row?: Row) => {
  if (typeof col?.attrs === "object") return col?.attrs;
  if (typeof col?.attrs === "function") return col?.attrs(row);
  return {};
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- controls -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 max-md:flex-col"
    >
      <!-- pages -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          :disabled="!table.getCanPreviousPage()"
          title="First page"
          @click="table.setPageIndex(0)"
        >
          <ChevronsLeft />
        </button>
        <button
          :disabled="!table.getCanPreviousPage()"
          title="Previous page"
          @click="table.previousPage()"
        >
          <ChevronLeft />
        </button>

        <span>
          {{ table.getState().pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </span>

        <button
          :disabled="!table.getCanNextPage()"
          title="Next page"
          @click="table.nextPage()"
        >
          <ChevronRight />
        </button>
        <button
          :disabled="!table.getCanNextPage()"
          title="Last page"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <ChevronsRight />
        </button>
      </div>

      <!-- page size -->
      <div class="flex flex-wrap items-center gap-2">
        <label>
          Show
          <Select
            :modelValue="table.getState().pagination.pageSize as 5"
            @update:modelValue="(value) => table.setPageSize(value ?? 5)"
            :options="
              [
                { value: 5 },
                { value: 10 },
                { value: 25 },
                { value: 50 },
                { value: 100 },
                { value: 9999, label: 'All' },
              ] as const
            "
          />
        </label>
        <div>of {{ formatValue(rows.length) }} items</div>
      </div>
    </div>

    <!-- table body -->
    <div class="w-full overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
            >
              <component
                :is="header.column.getCanSort() ? 'button' : 'div'"
                :style="{
                  ...cellStyle(header.column.columnDef.meta?.colProp),
                }"
                v-bind="cellAttrs(header.column.columnDef.meta?.colProp)"
                class="w-full gap-2 p-2"
                :class="header.column.getCanSort() ? 'hover:bg-zinc-200' : ''"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <component :is="header.column.columnDef.meta?.colProp.icon" />
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <template v-if="header.column.getCanSort()">
                  <ArrowDown v-if="header.column.getIsSorted() === 'desc'" />
                  <ArrowUp v-else-if="header.column.getIsSorted() === 'asc'" />
                  <ArrowUpDown v-else class="text-zinc-400" />
                </template>
              </component>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <div
                :style="{ ...cellStyle(cell.column.columnDef.meta?.colProp) }"
                v-bind="
                  cellAttrs(cell.column.columnDef.meta?.colProp, row.original)
                "
                class="flex gap-2 p-2"
              >
                <slot
                  v-if="
                    cell.column.columnDef.meta?.colProp.slot &&
                    $slots[cell.column.columnDef.meta?.colProp.slot]
                  "
                  :name="cell.column.columnDef.meta?.colProp.slot"
                  :row="row.original"
                />
                <template v-else>
                  {{ formatValue(cell.getValue()) }}
                </template>
              </div>
            </td>
          </tr>

          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="cols.length">No data</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
