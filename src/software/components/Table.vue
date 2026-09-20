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
import { IconArrowDown, IconArrowUp } from "@tabler/icons-vue";
import {
  createColumnHelper,
  createSortedRowModel,
  FlexRender,
  metaHelper,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";
import { formatValue } from "@/util/string";

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
            <button
              v-if="header.column.getCanSort()"
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
                <IconArrowDown v-if="header.column.getIsSorted() === 'desc'" />
                <IconArrowUp
                  v-else-if="header.column.getIsSorted() === 'asc'"
                />
              </template>
            </button>
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
