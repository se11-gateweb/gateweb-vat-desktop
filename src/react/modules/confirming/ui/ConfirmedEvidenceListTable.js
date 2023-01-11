import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import { Delete, FileUpload } from "@mui/icons-material";
import { getImageData } from "../../../Actions/electionActions";
import { uploadToGw } from "../../../Actions/gwActions";
import { confirmedEvidenceTableHead } from "../../../core/database/confirmedEvidenceTableRow";
import GwMapper, { TAX_TYPE } from "../../../Mapper/gw_mapper";

function newFileName(filePath) {
  let fileName = `${Date.now()}`;
  if (filePath.endsWith(".pdf")) {
    fileName += ".pdf";
  }
  if (filePath.endsWith(".jpg")) {
    fileName += ".jpg";
  }
  if (filePath.endsWith(".jpeg")) {
    fileName += ".jpg";
  }
  if (filePath.endsWith(".png")) {
    fileName += ".png";
  }
  return fileName;
}

function ConfirmedEvidenceListTable(props) {
  const {
    data, declareProperties, user, onGwUploaded, OnDeleteEvidence, ownerId
  } = props;
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setRowData(Object.keys(data["04"])
        .map((ticketId, idx) => {
          const obj = data["04"][ticketId];
          const res = GwMapper.toView(obj, ticketId, idx + 1);
          return res;
        }));
    }
  }, [data, declareProperties.clientTaxId]);

  const handleUpload = async () => {
    const keyList = Object.keys(data["04"]);
    const uploadData = [];
    for (let i = 0; i < keyList.length; i++) {
      const data = props.data["04"][keyList[i]];
      const image = await getImageData(data.fullPath.result);
      let fileName = newFileName(data.fullPath.result);
      uploadData.push(
        {
          id: keyList[i],
          image: new File([image], fileName),
          json: GwMapper.toGw(data)
        }
      );
    }
    const uploadResult = await uploadToGw(uploadData, ownerId, user.token);
    console.log(uploadResult);
    onGwUploaded(declareProperties.clientTaxId, uploadResult);
  };

  const handleDelete = async (e, id) => {
    console.log("id", id);
    await OnDeleteEvidence(declareProperties.clientTaxId, "04", id);
  };

  // TablePagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sliceNumber, setSliceNumber] = React.useState({
    "from": 0,
    "to": rowsPerPage
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSliceNumber({
      "from": newPage * rowsPerPage,
      "to": newPage * rowsPerPage + rowsPerPage
    });
  };
  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value);
    setRowsPerPage(value);
    setPage(0);
    if (value === -1) {
      setSliceNumber({
        "from": 0,
        "to": rowData.length
      });
    } else {
      setSliceNumber({
        "from": 0,
        "to": value
      });
    }
  };


  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          startIcon={<FileUpload />}
          disableElevation="true"
          onClick={handleUpload}
        >
          上傳
        </Button>
      </Stack>
      <TableContainer sx={{ border: "1px solid #ccc", borderRadius: "4px" }}>
        <Table>
          <TableHead>
            <TableRow>
              {confirmedEvidenceTableHead
                .map((thead) => (
                  <TableCell
                    key={thead.headerName}
                    align="center"
                    sx={{ flex: 1, whiteSpace: "nowrap" }}>{thead.headerName}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowData
              .slice(sliceNumber.from, sliceNumber.to)
              .map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row" align="center">
                    {row.sn}
                  </TableCell>
                  <TableCell align="center">{row.errorMsg}</TableCell>
                  <TableCell align="center">{row.reportingPeriod}</TableCell>
                  <TableCell align="center">{row.isDeclareBusinessTax ? "是" : "否"}</TableCell>
                  <TableCell align="center">{row["evidenceType-view"]}</TableCell>
                  <TableCell align="center">{TAX_TYPE[row["taxType"]].name}</TableCell>
                  <TableCell align="center">{row.other}</TableCell>
                  <TableCell align="center">{row.evidenceDate}</TableCell>
                  <TableCell align="center">{row.evidenceNumber}</TableCell>
                  <TableCell align="center">{row.buyerTaxId}</TableCell>
                  <TableCell align="center">{row.sellerTaxId}</TableCell>
                  <TableCell align="center">{row.taxableSalesValue}</TableCell>
                  <TableCell align="center">{row.totalAmount}</TableCell>
                  <TableCell align="center">{row.totalPayAmount}</TableCell>
                  <TableCell onClick={(e) => handleDelete(e, row.id)}>
                    <IconButton aria-label="delete" color="primary">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rowData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage={"每頁顯示"}
          labelDisplayedRows={({
                                 from,
                                 to,
                                 count
                               }) => {
            if (count === 0) {
              return `此頁0筆上傳憑證清單，總共0筆`;
            }
            return `此頁${parseInt(to) - parseInt(from) + 1}筆上傳憑證清單，總共${count}筆`;
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton={true}
          showLastButton={true}
        />
      </TableContainer>

    </>
  );
}

ConfirmedEvidenceListTable.propTypes = {
  data: PropTypes.any,
  declareProperties: PropTypes.any,
  user: PropTypes.any,
  onGwUploaded: PropTypes.func,
  OnDeleteEvidence: PropTypes.func
};
export default ConfirmedEvidenceListTable;
