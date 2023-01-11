/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomTablePagination from "./CustomTablePagination";

const getRowClassName = (params) => {
  if (params.row.rowStatus === "error") {
    return "highlight";
  }
};

function EvidenceListTable(props) {
  const navigate = useNavigate();
  const {
    data, handleEditRow, handleDelete, handleOpenImage, columns, checkboxSelection, handleSelection, declareProperties
  } = props;
  const [dataRows, setDataRows] = useState([]);

  useEffect(() => {
    setDataRows(data);
  }, [data]);


  const handleCellEditCommit = useCallback(({ id, field, value }) => {
    const ticketId = id;
    const rowData = dataRows.filter((d) => d.id === ticketId)[0];
    rowData[field] = value;
    handleEditRow(rowData, field);
  }, [dataRows, handleEditRow]);

  const handleCellClick = async (param, event) => {
    const { row } = param;
    if (event.target.name === "taxType") {
      row.taxType = event.target.value;
      handleEditRow(param.row, "taxType");
    }
    if (param.field === "image") {
      handleOpenImage(param.row.fullPath);
    }
    if (param.field === "delete") {
      const id = param.row.id;
      handleDelete(id);
    }
    if (param.field === "sn") {
      navigate("/evidence-detail", {
        state: {
          "data": param.row,
          "declareProperties": declareProperties
        }
      });
    }
  };

  const handlePageChange = (e) => {
    setPageNumber(e);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(e);
    setPageNumber(0);
  };

  const sortModel = [
    {
      field: "createDate",
      sort: "asc"
    }
  ];

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div style={{ height: 650, width: "100%" }}>
      <Box
        sx={{
          height: 650,
          width: "100%",
          "& .highlight": {
            backgroundColor: "yellow"
          },
          "& .color-highlight": {
            color: "red"
          },
          "& .all-highlight": {
            backgroundColor: "yellow",
            color: "red"
          }
        }}
      >
        <DataGrid
          localeText={{
            MuiTablePagination: {
              labelRowsPerPage: "每頁數量:",
              labelDisplayedRows: ({ from, to, count }) => {
                if (count === 0) {
                  return `此頁0筆上傳憑證清單，總共0筆`;
                }
                return `此頁${parseInt(to) - parseInt(from) + 1}筆上傳憑證清單，總共${count}筆`;
              }
            }
          }}
          rows={dataRows}
          columns={columns}
          sortModel={sortModel}
          checkboxSelection={checkboxSelection}
          onSelectionModelChange={handleSelection}
          onCellEditCommit={handleCellEditCommit}
          getCellClassName={getRowClassName}
          onCellClick={handleCellClick}
          page={pageNumber}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 30, 40, 50]}
          pagination
          components={{
            Pagination: CustomTablePagination
          }}
        />
      </Box>
    </div>
  );
}


EvidenceListTable.propTypes = {
  data: PropTypes.any,
  columns: PropTypes.any,
  checkboxSelection: PropTypes.any,
  handleSelection: PropTypes.func,
  handleDelete: PropTypes.func,
  handleEditRow: PropTypes.func,
  handleOpenImage: PropTypes.func
};
export default EvidenceListTable;
