import React from "react";
import { IconButton } from "@mui/material";
import { GW_EVIDENCE_TYPE } from "../Mapper/gw_mapper";
import { Delete, ImageSearch } from "@mui/icons-material";

const R = require("ramda");

export const IdentifiedEvidenceColumnDefinitions = [
  {
    field: "image",
    headerName: "圖檔",
    width: 70,
    cellClassName: renderCellClassName,
    editable: false,
    renderCell: () => <ImageSearch color="primary">打開</ImageSearch>
  },
  {
    field: "createDate", headerName: "time", hide: true //for sorting
  },
  {
    field: "sn", headerName: "序號", width: 110, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "reportingPeriod",
    headerName: "申報期別",
    width: 150,
    cellClassName: renderCellClassName,
    editable: true
  },
  {
    field: "isDeclareBusinessTax-view",
    headerName: "申報",
    width: 150,
    cellClassName: renderCellClassName,
    editable: true,
    type: "singleSelect",
    valueOptions: ["是", "否"]
  },
  {
    field: "evidenceType-view",
    headerName: "憑證類型",
    width: 200,
    cellClassName: renderCellClassName,
    editable: true,
    type: "singleSelect",
    valueOptions: renderEvidenceType()
  },

  {
    field: "taxType-view",
    headerName: "課稅別",
    width: 90,
    cellClassName: renderCellClassName,
    editable: true,
    type: "singleSelect",
    valueOptions: ["應税", "免税", "零税", "混税"]
  },
  {
    field: "other",
    headerName: "其他代收付",
    width: 110,
    cellClassName: renderCellClassName,
    editable: true,
    type: "singleSelect",
    valueOptions: ["Y", "N"]
  },
  {
    field: "evidenceDate", headerName: "憑證日期", width: 150, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "evidenceNumber", headerName: "憑證號碼", width: 200, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "buyerTaxId", headerName: "買受人統編", width: 150, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "sellerTaxId", headerName: "銷售人統編", width: 150, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "saleAmount-view",
    headerName: "銷售額",
    width: 150,
    cellClassName: renderCellClassName,
    editable: true
  },
  {
    field: "businessTaxValue", headerName: "税額", width: 150, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "totalAmount", headerName: "總額", width: 150, cellClassName: renderCellClassName, editable: true
  },
  {
    field: "totalPayAmount",
    headerName: "付款總金額",
    width: 150,
    cellClassName: renderCellClassName,
    editable: true
  },
  {
    field: "cellHighlight", hide: true
  },
  {
    field: "delete", headerName: "刪除", width: 110, renderCell: renderDeleteBtnCell
  }
];


function renderEvidenceType() {
  const keyList = R.keys(GW_EVIDENCE_TYPE);
  const result = keyList
    .map(key => {
      const { name } = GW_EVIDENCE_TYPE[key];
      return name;
    });
  return result;
}

function renderCellClassName(cellValues) {
  if (cellValues.row.cellHighlight && cellValues.row.textHighlight) {
    if (cellValues.row.textHighlight.indexOf(cellValues.field) > -1 && cellValues.row.cellHighlight.indexOf(cellValues.field) > -1) {
      return "all-highlight";
    }
  }
  if (cellValues.row.textHighlight && cellValues.row.textHighlight.indexOf(cellValues.field) > -1) {
    return "color-highlight";
  }
  if (cellValues.row.cellHighlight && cellValues.row.cellHighlight.indexOf(cellValues.field) > -1) {
    return "highlight";
  }
}


function renderDeleteBtnCell() {
  return <IconButton aria-label="delete" color="primary">
    <Delete />
  </IconButton>;
}