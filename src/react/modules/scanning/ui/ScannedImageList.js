import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  MenuItem,
  Stack, TablePagination,
  TextField,
  Typography
} from "@mui/material";
import { Delete, InsertPhoto, Save, Send, ZoomIn } from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import PropTypes from "prop-types";
import { GW_EVIDENCE_TYPE } from "../../../Mapper/gw_mapper";
import { ipcRenderer } from "electron";
import "electron";


const getRowData = async (jsonData, businessEntityTaxId) => {
  const rowData = [];
  const keys = Object.keys(jsonData);
  for (let idx = 0; idx < keys.length; idx += 1) {
    const item = jsonData[keys[idx]];
    const imageFileBlob = await getImageFileBlob(item.fullPath.result);
    const fileName = `${item.gwEvidenceType.result}_${keys[idx]}`;
    const rowItem = {
      id: idx + 1,
      businessEntityTaxId,
      fileName,
      fileBlob: imageFileBlob,
      imageUrl: URL.createObjectURL(imageFileBlob),
      fullPath: item.fullPath.result
    };
    rowData.push(rowItem);
  }
  return rowData;
};

const getImageFileBlob = async (fullPath) => {
  if (ipcRenderer) {
    const image = await ipcRenderer.invoke("evidence:getImageFileContent", fullPath);
    return new Blob([image]);
  }
  return "";
};

const isTaxIdSelected = (taxIdSelected) => !!taxIdSelected;

const isScanEnabled = (params) => {
  return !isTaxIdSelected(params.taxId) || params.disabled;
};

const isImportEnabled = (params) => {
  return !isTaxIdSelected(params.taxId) || params.disabled;
};

function ScannedImageList(props) {
  const {
    data, declareProperties,
    onImageOriginalViewClick, onSaveImageClick, onDeleteImageClick
  } = props;
  const [dataRows, setDataRows] = useState([]);
  const [selectionDataRows, setSelectionDataRow] = useState({ selection: [] });
  const [selectionEvidenceType, setSelectionEvidenceType] = useState("All");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [sliceNumber, setSliceNumber] = React.useState({
    "from": 0,
    "to": rowsPerPage
  });


  useEffect(() => {
    const initDataRows = async (data, businessEntityTaxId) => {
      let rowData = (data) ? await getRowData(data, businessEntityTaxId) : [];
      rowData = rowData
        .map(d => {
          if (selectionEvidenceType === "All") {
            return d;
          }
          const type = d.fileName.split("_")[0];
          if (type === selectionEvidenceType) {
            return d;
          }
          return null;
        })
        .filter(d => d != null)
        .sort((a, b) => {
          const fileName1 = a.fileName.split("_")[1].split(".")[0];
          const fileName2 = b.fileName.split("_")[1].split(".")[0];
          if (fileName1 >= fileName2) {
            return 1;
          }
          return -1;
        });
      setDataRows(rowData);
    };

    initDataRows(data, declareProperties.clientTaxId);
  }, [data, declareProperties, selectionEvidenceType]);

  // TODO
  const handleChange = (event) => {
    const { value } = event.target;
    const selectData = dataRows.filter((obj) => obj.fullPath === value)[0];
    const isExist = selectionDataRows.selection
      .filter((obj) => selectData.fullPath === obj.fullPath).length > 0;
    console.log("handleChange", selectData);
    if (!isExist) {
      setSelectionDataRow((prevState) => ({
        selection: [...prevState.selection, selectData]
      }));
    } else {
      setSelectionDataRow((prevState) => ({
        selection: prevState.selection.filter((obj) => selectData.fullPath !== obj.fullPath)
      }));
    }
  };

  const handleSelectionEvidenceTypeChange = (event) => {
    console.log("handleSelectionEvidenceTypeChange", event);
    const { value } = event.target;
    setSelectionEvidenceType(value);
    setSelectionDataRow((prevState) => ({
      selection: []
    }));
    console.log("handleSelectionEvidenceTypeChange", value);
  };

  const uploadFileHandler = (event) => props.onOpenDialog(false);


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
        "to": dataRows.length
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
          onClick={uploadFileHandler}
          disableElevation="true"
          startIcon={<InsertPhoto />}
          component="label"
          disabled={isScanEnabled({ taxId: props.declareProperties.clientTaxId, disabled: props.importDisable })}
        >
          匯入圖檔
        </Button>
        <Button
          variant="contained"
          startIcon={<InsertPhoto />}
          disableElevation="true"
          onClick={props.onOpenDialog}
          disabled={isImportEnabled({ taxId: props.declareProperties.clientTaxId, diasbled: props.scanDisable })}
        >
          掃描文件
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          disableElevation="true"
          onClick={(e) => {
            props.onSendToIdentifyClick(e, selectionDataRows.selection);
            setSelectionDataRow({ selection: [] });
          }}
        >
          送出辨識
        </Button>
      </Stack>
      <div>
        <FormControl sx={{ width: "25%" }}>
          <TextField
            id="evidenceType-select"
            name="evidenceType-select"
            select
            onChange={handleSelectionEvidenceTypeChange}
            value={selectionEvidenceType}
            label="請選擇憑證種類"
          >
            <MenuItem key={0} value="All">
              All
            </MenuItem>
            {
              Object.keys(GW_EVIDENCE_TYPE)
                .filter(val => val !== "")
                .filter(val => val !== "A3001")
                .filter(val => val !== "A3002")
                .filter(val => val !== "A4001")
                .filter(val => val !== "other")
                .map(val => {
                  return <MenuItem key={val} value={val}>
                    {GW_EVIDENCE_TYPE[val].id} {GW_EVIDENCE_TYPE[val].name}
                  </MenuItem>;
                })
            }
          </TextField>
        </FormControl>
      </div>
      <ImageList cols={3} gap={12}>
        {dataRows
          .slice(sliceNumber.from, sliceNumber.to)
          .map((item) => (
            <ImageListItem key={item.fileName}
                           sx={{ borderRadius: "8px", border: "1px solid #ccc", overflow: "hidden" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormControl>
                  <Checkbox
                    id={item.id}
                    name={item.id}
                    value={item.fullPath}
                    onChange={handleChange}
                    checked={selectionDataRows.selection.filter((obj) => item.fullPath === obj.fullPath).length > 0}
                  />
                </FormControl>
                <Typography>{item.fileName}</Typography>
              </Box>
              <Box sx={{ width: "100%", height: "300px", overflow: "hidden" }}>

                {item.fullPath.endsWith(".pdf") ?
                  <Typography align={"center"}>無法顯示</Typography>
                  : <img
                    src={item.imageUrl}
                    alt={item.fileName}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />}
              </Box>
              <ImageListItemBar
                actionIcon={(
                  <div>
                    <IconButton
                      aria-label={`info about ${item.fileName}`}
                      onClick={(e) => onImageOriginalViewClick(item)}
                    >
                      <ZoomIn sx={{ color: blue[200] }} />
                    </IconButton>
                    <IconButton
                      aria-label={`info about ${item.fileName}`}
                      onClick={(e) => onSaveImageClick(item)}
                    >
                      <Save sx={{ color: blue[200] }} />
                    </IconButton>
                    <IconButton
                      aria-label={`info about ${item.fileName}`}
                      onClick={(e) => onDeleteImageClick(item)}
                    >
                      <Delete sx={{ color: blue[200] }} />
                    </IconButton>
                  </div>
                )}
              />
            </ImageListItem>
          ))}

      </ImageList>
      {
        dataRows.length === 0 ? <></> : <TablePagination
          rowsPerPageOptions={[
            100, { label: "All", value: -1 }]}
          count={dataRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          component="div"
          labelDisplayedRows={({
                                 from,
                                 to,
                                 count
                               }) => `此頁${parseInt(to) - parseInt(from) + 1}筆掃描憑證清單，總共${count}筆`}
          labelRowsPerPage={"每頁顯示"}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton={true}
          showLastButton={true}
        />
      }
    </>

  );
}

ScannedImageList.propTypes = {
  onScanClick: PropTypes.func,
  onSendToIdentifyClick: PropTypes.func,
  onDeleteImageClick: PropTypes.func,
  onSaveImageClick: PropTypes.func,
  onImageOriginalViewClick: PropTypes.func,
  onImportImageClick: PropTypes.func,
  username: PropTypes.string,
  data: PropTypes.array,
  clientTaxId: PropTypes.string,
  declareProperties: PropTypes.any,
  onOpenDialog: PropTypes.func,
  scanDisable: PropTypes.any,
  importDisable: PropTypes.any
};

export default ScannedImageList;
