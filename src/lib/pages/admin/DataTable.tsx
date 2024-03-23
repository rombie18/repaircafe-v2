/* eslint-disable @typescript-eslint/no-explicit-any */
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { rankItem } from '@tanstack/match-sorter-utils';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  globalFilter: string;
  setGlobalFilter: any;
  sorting: any;
  setSorting: any;
};

export function DataTable<Data extends object>({
  data,
  columns,
  globalFilter,
  setGlobalFilter,
  sorting,
  setSorting,
}: DataTableProps<Data>) {
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
      itemRank,
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      globalFilter,
    },
    // initialState: initialTableState,
    initialState: {
      sorting: [
        {
          id: 'token',
          desc: false,
        },
      ],
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table size="sm">
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ textWrap: 'nowrap' }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}

                  {!header.column.getIsSorted()
                    ? null
                    : header.column.getIsSorted() === 'desc' && (
                        <TriangleDownIcon
                          ml={2}
                          aria-label="sorted descending"
                        />
                      )}
                  {!header.column.getIsSorted()
                    ? null
                    : header.column.getIsSorted() === 'asc' && (
                        <TriangleUpIcon ml={2} aria-label="sorted ascending" />
                      )}
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              return (
                <Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
