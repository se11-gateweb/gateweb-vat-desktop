import { gridPaginationSelector, useGridApiContext, useGridRootProps, useGridSelector } from "@mui/x-data-grid";
import React from "react";
import { TablePagination } from "@mui/material";

//ref: https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/components/GridPagination.tsx
export default function CustomTablePagination(props) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const paginationState = useGridSelector(apiRef, gridPaginationSelector);


  const lastPage = React.useMemo(
    () => Math.floor(paginationState.rowCount / (paginationState.pageSize || 1)),
    [paginationState.rowCount, paginationState.pageSize]
  );

  const handlePageSizeChange = React.useCallback(
    (event) => {
      const newPageSize = Number(event.target.value);
      apiRef.current.setPageSize(newPageSize);
    }, [apiRef]);

  const handlePageChange = React.useCallback(
    (event, page) => {
      apiRef.current.setPage(page);
    }, [apiRef]);

  return (
    <TablePagination
      showFirstButton={true}
      showLastButton={true}
      count={paginationState.rowCount}
      page={paginationState.page <= lastPage ? paginationState.page : lastPage}
      rowsPerPageOptions={
        rootProps.rowsPerPageOptions?.includes(paginationState.pageSize)
          ? rootProps.rowsPerPageOptions
          : []
      }
      rowsPerPage={paginationState.pageSize}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handlePageSizeChange}
      {...apiRef.current.getLocaleText("MuiTablePagination")}
      {...props}
    />);
}