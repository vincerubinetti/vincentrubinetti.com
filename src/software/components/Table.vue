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

/** only sorting and pagination are used, so only those features are enabled */
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<Cols<Cell[]>[number]>(),
});
</script>

<script setup lang="ts" generic="Rows extends Cell[]">
import type { CSSProperties, HTMLAttributes, VNode } from "vue";
import type {
  SortFn,
  SortingState,
  Row as TanstackRow,
} from "@tanstack/vue-table";
import { computed } from "vue";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-vue";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";
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

const columnHelper = createColumnHelper<typeof features, Row>();

/** custom sorting function */
const sortingFunction: SortFn<typeof features, Row> = (
  a: TanstackRow<typeof features, Row>,
  b: TanstackRow<typeof features, Row>,
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
    columnHelper.accessor((row: Row) => row[col.key] as unknown, {
      /** unique column id */
      id: col.key,
      /** name */
      header: col.name,
      /** sortable */
      enableSorting: col.sortable ?? true,
      /** sorting function */
      sortFn: sortingFunction,
      /** put nullish values lower */
      sortUndefined: -1,
      /** extra metadata */
      meta: col,
    }),
  ),
);

/** tanstack table api */
const table = useTable<typeof features, Row>({
  features,
  data: computed(() => props.rows),
  columns,
  initialState: {
    sorting: props.sort ?? [],
    pagination: {
      pageIndex: 0,
      pageSize: 50,
    },
  },
});

/** current pagination state */
const pagination = computed(() => table.atoms.pagination.get());

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
          :aria-disabled="!table.getCanPreviousPage()"
          title="First page"
          @click="table.getCanPreviousPage() && table.setPageIndex(0)"
        >
          <IconChevronsLeft />
        </button>
        <button
          :aria-disabled="!table.getCanPreviousPage()"
          title="Previous page"
          @click="table.getCanPreviousPage() && table.previousPage()"
        >
          <IconChevronLeft />
        </button>

        <span>
          {{ pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </span>

        <button
          :aria-disabled="!table.getCanNextPage()"
          title="Next page"
          @click="table.getCanNextPage() && table.nextPage()"
        >
          <IconChevronRight />
        </button>
        <button
          :aria-disabled="!table.getCanNextPage()"
          title="Last page"
          @click="
            table.getCanNextPage() &&
            table.setPageIndex(table.getPageCount() - 1)
          "
        >
          <IconChevronsRight />
        </button>
      </div>

      <!-- page size -->
      <div class="flex flex-wrap items-center gap-2">
        <label>
          <Select
            :modelValue="pagination.pageSize as 5"
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
                  ...cellStyle(header.column.columnDef.meta),
                }"
                v-bind="cellAttrs(header.column.columnDef.meta)"
                class="hover:bg-dark/5 w-full gap-2 p-2"
                @click="
                  (event: Event) =>
                    header.column.getToggleSortingHandler()?.(event)
                "
              >
                <component :is="header.column.columnDef.meta?.icon" />
                <FlexRender :header="header" />
                <template v-if="header.column.getCanSort()">
                  <IconArrowDown
                    v-if="header.column.getIsSorted() === 'desc'"
                  />
                  <IconArrowUp
                    v-else-if="header.column.getIsSorted() === 'asc'"
                  />
                </template>
              </component>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getAllCells()" :key="cell.id">
              <div
                :style="{ ...cellStyle(cell.column.columnDef.meta) }"
                v-bind="cellAttrs(cell.column.columnDef.meta, row.original)"
                class="flex gap-2 p-2"
              >
                <slot
                  v-if="
                    cell.column.columnDef.meta?.slot &&
                    $slots[cell.column.columnDef.meta?.slot]
                  "
                  :name="cell.column.columnDef.meta?.slot"
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

<style scoped>
@reference "tailwindcss";
@reference "../../software/styles.css";

table {
  @apply bg-white;
}

tr:nth-child(even) {
  @apply bg-dark/3;
}

th {
  @apply bg-dark/3;
}

td:not(:first-child) {
  @apply border-dark/3 border-l-2;
}
</style>
