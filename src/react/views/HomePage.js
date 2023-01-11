import React, { useEffect } from "react";
import {
  Alert,
  Autocomplete,
  Badge,
  Box,
  Collapse,
  Container,
  CssBaseline,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { AdfScanner, Close, CloudUpload, Compare } from "@mui/icons-material";
import PropTypes from "prop-types";
import DialogComponent from "../core/ui/Dialog";
import { useAppDispatch, useAppState } from "../Context/context";
import DesktopNavbar from "../core/layout/DesktopNavbar";
import { getCurrentPeriod, toPeriodList } from "../Util/Time";
import { useLocation } from "react-router-dom";
import ScannedImageList from "../modules/scanning/ui/ScannedImageList";
import * as gwActions from "../Actions/gwActions";
import * as electronActions from "../Actions/electionActions";
import { gwUploaded, identifyResultConfirmed, identifyResultReceived, identifySent } from "../Actions/electionActions";
import { openScanner, scan } from "../Actions/scanAction";
import GwMapper from "../Mapper/gw_mapper";
import ConfirmedEvidenceListTable from "../modules/confirming/ui/ConfirmedEvidenceListTable";
import IdentifiedEvidenceListTable from "../modules/identifying/ui/IdentifiedEvidenceListTable";
import { getFileExt } from "../Util/FileUtils";
import { getIdentifyResult, recognizeAsync } from "../usecases/ocr";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

TabPanel.propTypes = {
  children: PropTypes.any,
  value: PropTypes.any,
  index: PropTypes.any
};

function HomePage() {
  const location = useLocation();
  const [value, setValue] = React.useState(0);
  const [declareProperties, setDeclareProperties] = React.useState({
    clientTaxId: "",
    reportingPeriod: getCurrentPeriod(),
    evidenceType: "",
    isDeclareBusinessTax: "true"
  });
  const dispatch = useAppDispatch();
  const appState = useAppState();

  const [scanCount, setScanCount] = React.useState(0);
  const [scanDisable, setScanDisable] = React.useState(false);
  const [scanAlert, setScanAlert] = React.useState(false);
  const [assignMap, setAssignMap] = React.useState();
  const [importDisable, setImportDisable] = React.useState(false);
  const [ownerId, setOwnerId] = React.useState("");

  useEffect(() => {
    const pageInit = async () => {
      await gwActions.getAllClientList(
        dispatch,
        appState.auth.user.username,
        appState.auth.user.taxId,
        appState.auth.user.token
      );
      if (declareProperties.clientTaxId !== "") {
        await electronActions.getBusinessEntityListLocal(
          dispatch,
          declareProperties.clientTaxId
        );
      }
      const assign = await electronActions.getAssign();
      setAssignMap(assign);
      openScanner(dispatch);
    };
    pageInit().catch(console.error);
  }, [value, declareProperties.clientTaxId]);

  useEffect(() => {
    if (declareProperties.clientTaxId !== "") {
      const ownerId = appState.appData.clientLists
        .filter((client) => {
          return parseInt(client.taxId.id) === parseInt(declareProperties.clientTaxId);
        })
        .map((client) => {
          return client.id;
        }) || "";
      setOwnerId(ownerId[0]);
    }
  });

  useEffect(() => {
    if (location.state != null) {
      setValue(1);
      setDeclareProperties(location.state);
      const ownerId = appState.appData.clientLists
        .filter((client) => {
          return parseInt(client.taxId.id) === location.state.clientTaxId;
        })
        .map((client) => {
          return client.id;
        });
      setOwnerId(ownerId[0]);
    }
  }, [location.state]);


  const handleTabChange = (event, newValue) => setValue(newValue);

  const handleSelectionChange = async (event) => {
    const { name, value } = event.target;
    setDeclareProperties((prevState) => ({
      ...prevState,
      [name]: value
    }));
    if (name === "clientTaxId") {
      const ownerId = appState.appData.clientLists
        .filter((client) => client.taxId.id === value)
        .map((client) => {
          return client.id;
        });
      setOwnerId(ownerId[0]);
      handleReset();
    }
  };

  const handleScannerError = (errorMsg) => {
    const isErrorMsgStartsWithError = errorMsg.startsWith("error:");
    setScanDisable(false);
    setImportDisable(false);
    if (isErrorMsgStartsWithError && errorMsg === "error:feeding error") {
      alert("無法掃描，請放入紙張");
      return;
    }
    if (isErrorMsgStartsWithError) {
      alert("無法與掃描機連線，請重新整理");
    }
  };

  // region scanned image list events
  const handleSendImageToIdentify = async (event, data) => {
    console.log("handleSendImageToIdentify", data);
    const accountingfirmTaxId = appState.auth.user.taxId;
    const businessEntityTaxId = declareProperties.clientTaxId;
    const sendToIdentifyData = data.map((d) => {
      const fileExt = getFileExt(d.fullPath);
      return {
        sourceFullPath: d.fullPath,
        sourceFileName: `${d.fileName}.${fileExt}`,
        fileBlob: d.fileBlob,
        accountingfirmTaxId,
        businessEntityTaxId,
        evidenceType: d.fileName.split("_")[0]
      };
    });
    console.log("handleSendImageToIdentify", sendToIdentifyData);

    const sentIdentifyResult = await recognizeAsync(
      appState.auth.user.token,
      ownerId,
      sendToIdentifyData
    );
    console.log(sentIdentifyResult);
    if (sentIdentifyResult.length > 0) {
      identifySent(dispatch, {
        user: appState.auth.user.username,
        result: sentIdentifyResult
      });
    }
  };

  const handleGetIdentifyResult = async (event, data) => {
    console.log("handleGetIdentifyResult", data);
    const keyList = Object.keys(data);
    console.log(keyList);
    const identifyResultReceivedList = [];
    for (let i = 0; i < keyList.length; i++) {
      const id = keyList[i];
      const json = data[keyList[i]];
      const identifyResult = await getIdentifyResult(
        appState.auth.user.token,
        ownerId,
        {
          createDate: json.createDate.result,
          fullPath: json.fullPath.result,
          reportingPeriod: json.reportingPeriod.result,
          deductionType: json.deductionType.result,
          isDeclareBusinessTax: json.isDeclareBusinessTax.result,
          gwEvidenceType: json.gwEvidenceType.result,
          id
        }
      );
      console.log("handleGetIdentifyResult identifyResult", identifyResult);
      if (identifyResult.status !== "processing") {
        const domainObj = GwMapper.toDomainObj(identifyResult);
        console.log("handleGetIdentifyResult domainObj", domainObj);
        identifyResultReceivedList.push(domainObj);
      }
    }
    identifyResultReceived(
      dispatch,
      declareProperties.clientTaxId,
      identifyResultReceivedList
    );
  };

  const handleSaveImage = (data) => {
    const url = window.URL.createObjectURL(data.fileBlob);
    const link = document.createElement("a");
    link.href = url;
    const fileNameExt = data.fullPath.split(data.fileName.split("_")[1])[1];
    link.setAttribute("download", data.fileName + fileNameExt);
    document.body.appendChild(link);
    link.click();
  };

  const handleViewImage = async (data) => {
    console.log("handleViewImage", data);
    await electronActions.openImage(data.fullPath);
    window.open("");
  };

  const handleDeleteImage = (data) => {
    const id = data.fileName.split("_")[1];
    handleDeleteEvidence(data.businessEntityTaxId, "01", id);
  };

  const handleDeleteEvidence = (businessEntityTaxId, step, ticketId) => {
    electronActions.deleteData(dispatch, businessEntityTaxId, step, ticketId);
  };

  const handleScanImage = () => {
    if (
      declareProperties.reportingPeriod !== "" &&
      declareProperties.isDeclareBusinessTax !== ""
    ) {
      setScanDisable(true);
      setScanAlert(true);
      setImportDisable(true);
      // fixme rm
      // handleMoveImage(1, C:\Users\amyyu\string123_24549210_1645062357828.jpg')
      scan(appState.appData.scannerName, handleMoveImage, handleScannerError, handleCloseDisable);
    }
  };

  const handleCloseDisable = () => setScanDisable(false);


  const handleMoveImage = async (count, filePath) => {
    setScanCount((prevState) => prevState + 1);
    await electronActions.scanImages(
      dispatch,
      filePath,
      appState.auth.user,
      declareProperties
    );
  };

  const handleResultAllConfirmed = async (businessEntityTaxId, filesByTicketId) => {
    console.log(businessEntityTaxId, filesByTicketId);
    try {
      const result = await identifyResultConfirmed(
        dispatch,
        businessEntityTaxId,
        filesByTicketId
      );
      return result;
    } catch (e) {
      throw new Error(e);
    }
  };

  const handleGwUploaded = async (businessEntityTaxId, data) => {
    console.log(businessEntityTaxId, data);
    try {
      const result = await gwUploaded(dispatch, businessEntityTaxId, data);
      return result;
    } catch (e) {
      throw new Error(e);
    }
  };

  const renderClientSelect = () => (
    <Stack spacing={2} direction="row" my={3}>
      <FormControl sx={{ width: "25%" }}>
        <Autocomplete
          id={"client-autocomplete"}
          renderInput={(param) => (
            <TextField {...param} label={"請輸入營利事業單位"} />
          )}
          getOptionLabel={(option) => {
            if (typeof option === "object") {
              return option.taxId.id + " " + option.businessName;
            }
            return appState.appData.clientLists
              .filter(data => {
                return parseInt(data.taxId.id) === option;
              })
              .map(data => {
                return data.taxId.id + " " + data.businessName;
              })[0] || "";
          }}
          onChange={(event) => {
            const { value } = event.target;
            let id = value;
            if ((value + "").length < 8) {
              id = "0".repeat(8 - (value + "").length) + id;
            }
            setDeclareProperties((prevState) => ({
              ...prevState,
              "clientTaxId": id
            }));
            const ownerId = appState.appData.clientLists
              .filter((client) => {
                return parseInt(client.taxId.id) === value;
              })
              .map((client) => {
                return client.id;
              });
            setOwnerId(ownerId[0]);
            handleReset();
          }}
          isOptionEqualToValue={(option, value) => {
            return option.taxId.id === value;
          }}
          value={parseInt(declareProperties.clientTaxId) || 0}
          renderOption={(props, option) => {
            const value = option.taxId.id + " " + option.businessName;
            return <li value={option.taxId.id + ""}  {...props}>{value}</li>;
          }}
          options={appState.appData.clientLists
            .sort((a, b) => {
              const taxId1 = parseInt(a.taxId.id);
              const taxId2 = parseInt(b.taxId.id);
              return taxId1 - taxId2;
            })
          }
        />
      </FormControl>
      <FormControl sx={{ width: "25%" }}>
        <TextField
          id="reporting-period-select"
          name="reportingPeriod"
          select
          label="申報期別"
          value={declareProperties.reportingPeriod}
          onChange={handleSelectionChange}
        >
          <MenuItem key={0} value="">
            請選擇申報期別
          </MenuItem>
          {toPeriodList()
            .filter((period) => period % 2 === 0)
            .map((period) => (
              <MenuItem key={period} value={period}>
                {period}
              </MenuItem>
            ))}
        </TextField>
      </FormControl>

    </Stack>
  );

  const handleReset = () => {
    setDeclareProperties((prevState) => ({
      ...prevState,
      reportingPeriod: getCurrentPeriod()
    }));
  };

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDialog2, setOpenDialog2] = React.useState(false);
  const handleClose = () => setOpenDialog(false);
  const handleClose2 = () => setOpenDialog2(false);

  const handleOpen = (isScan = true) => {
    if (isScan) {
      setScanCount(0);
      setOpenDialog(true);
    } else {
      setOpenDialog2(true);
    }
  };

  const handleImportImageClick = async (e) => {
    if (declareProperties.evidenceType === "") {
      return;
    }
    const result = await electronActions.importFromImage(declareProperties.evidenceType);
    for (let i = 0; i < result.length; i++) {
      await electronActions.scanImages(dispatch, result[i], appState.auth.user, declareProperties);
    }
  };

  return (
    <>
      <CssBaseline />
      <DesktopNavbar />
      <Container maxWidth="false">
        <DialogComponent
          isScan={true}
          declareProperties={declareProperties}
          handleSelectionChange={handleSelectionChange}
          handleReset={handleReset}
          handleClose={handleClose}
          open={openDialog}
          onConfirm={handleScanImage}
        />
        <DialogComponent
          isScan={false}
          declareProperties={declareProperties}
          handleSelectionChange={handleSelectionChange}
          handleReset={handleReset}
          handleClose={handleClose2}
          open={openDialog2}
          onConfirm={handleImportImageClick}
        />
        <Collapse in={scanAlert}>
          <Alert
            severity="info"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setScanAlert(false);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            此次掃描 {scanCount} 筆資料
          </Alert>
        </Collapse>
        <Box>{renderClientSelect()}</Box>
        <Tabs value={value} onChange={handleTabChange}>
          <Tab
            icon={<AdfScanner />}
            iconPosition="start"
            label="掃描"
            key={0}
            {...a11yProps(0)}
          />
          <Tab
            icon={<Compare />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={
                  appState.appData.fileLists["02"] === undefined
                    ? 0
                    : Object.keys(appState.appData.fileLists["02"]).length
                }
                color="secondary"
                {...a11yProps(1)}
              >
                辨識
              </Badge>
            }
          />
          <Tab
            icon={<CloudUpload />}
            iconPosition="start"
            label="上傳"
            key={2}
            {...a11yProps(2)}
          />
        </Tabs>
        <Paper>
          <TabPanel value={value} index={0}>
            <ScannedImageList
              data={appState.appData.fileLists["01"]}
              username={appState.auth.user.username}
              declareProperties={declareProperties}
              onOpenDialog={handleOpen}
              onScanClick={handleScanImage}
              onSendToIdentifyClick={handleSendImageToIdentify}
              onSaveImageClick={handleSaveImage}
              onImageOriginalViewClick={handleViewImage}
              onDeleteImageClick={handleDeleteImage}
              scanDisable={scanDisable}
              importDisable={importDisable}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <IdentifiedEvidenceListTable
              data={appState.appData.fileLists}
              onViewImage={handleViewImage}
              onGetIdentifyResult={handleGetIdentifyResult}
              onResultAllConfirmed={handleResultAllConfirmed}
              OnDeleteEvidence={handleDeleteEvidence}
              assignMap={assignMap}
              declareProperties={declareProperties}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <ConfirmedEvidenceListTable
              data={appState.appData.fileLists}
              user={appState.auth.user}
              onGwUploaded={handleGwUploaded}
              declareProperties={declareProperties}
              OnDeleteEvidence={handleDeleteEvidence}
              ownerId={ownerId}
            />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
}

export default HomePage;
