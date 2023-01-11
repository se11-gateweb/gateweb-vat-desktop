import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { PlaylistAddCheck, ReadMore } from "@mui/icons-material";
import PropTypes from "prop-types";
import { getJsonRawData, updateData } from "../../../Actions/electionActions";
import GwMapper, { EVIDENCE_TYPE } from "../../../Mapper/gw_mapper";
import { validData } from "../../../Valid/valid";
import { getPeriod, getTxtPeriod } from "../../../Util/Time";
import EvidenceListTable from "../../../core/ui/EvidenceListTable";
import { IdentifiedEvidenceColumnDefinitions } from "../../../Components/ColumnDefinitions";

const validTextHighlight = (data) => {
  let textHighlight = [];
  if (data.sellerTaxId === data.buyerTaxId) {
    textHighlight.push("buyerTaxId");
    textHighlight.push("sellerTaxId");
  }
  const evidencePeriod = getPeriod(data.evidenceDate) || 0;
  const reportingPeriod = parseInt(data.reportingPeriod) || 0;
  const tenYearAgoPeriod = reportingPeriod - 1000;
  const isBetweenTenYearAgoPeriodAndReportingPeriod = (reportingPeriod > evidencePeriod) && (tenYearAgoPeriod < evidencePeriod);
  if (isBetweenTenYearAgoPeriodAndReportingPeriod) {
    textHighlight.push("evidenceDate");
    textHighlight.push("reportingPeriod");
  }
  data.textHighlight = textHighlight;
  console.log("validTextHighlight", data);
  return data;
};

//todo validation
const validEvidence = (evidenceObj, businessEntityTaxId, assignMap) => Object.keys(evidenceObj)
  .map((id, idx) => {
    const obj = evidenceObj[id];
    const data = validTextHighlight(validData(
      businessEntityTaxId,
      GwMapper.toView(obj, id, idx + 1),
      assignMap
    ));
    //todo 提醒
    return data;
  });

function IdentifiedEvidenceListTable(props) {
  const {
    data, declareProperties, assignMap, onResultAllConfirmed,
    onViewImage, OnDeleteEvidence, onGetIdentifyResult
  } = props;
  const [rowData, setRowData] = useState([]);
  const [localFiles, setLocalFiles] = useState(data);
  const [selectionModel, setSelectionModel] = React.useState([]);

  useEffect(() => {
    const init = async () => {
      setLocalFiles(data);
      if (Object.keys(data).length > 0) {
        let result = validEvidence(data["03"], declareProperties.clientTaxId, assignMap);
        setRowData(result);
      }
    };
    init();
  }, [assignMap, data, declareProperties.clientTaxId]);

  const handleResultAllConfirmed = async () => {
    const errorIdList = rowData.filter((obj) => obj.cellHighlight.length > 0).map((obj) => obj.id);
    const filterIdList = Object.keys(localFiles["03"])
      .filter((key) => {
        const ticketId = localFiles["03"][key].id.result;
        return selectionModel.includes(ticketId);
      }).filter((key) => {
        const ticketId = localFiles["03"][key].id.result;
        return !errorIdList.includes(ticketId);
      });
    const result = await onResultAllConfirmed(declareProperties.clientTaxId, filterIdList);
    setLocalFiles(result);
    const validResult = validEvidence(result["03"], declareProperties.clientTaxId, assignMap);
    setRowData(validResult);
  };

  const handleSelection = (newSelectionModel) => setSelectionModel(newSelectionModel);

  const handleEditRow = async (editData, field = "") => {
    const jsonData = await getJsonRawData(editData.id, declareProperties.clientTaxId);
    if (field === "evidenceType-view") {
      jsonData["evidenceType"].result = EVIDENCE_TYPE[editData[field]];
    } else if (field === "evidenceDate") {
      jsonData["evidenceDate"].result = editData[field];
      jsonData["period"].result = getTxtPeriod(editData[field]) + "";
    } else if (field === "isDeclareBusinessTax-view") {
      jsonData["isDeclareBusinessTax"].result = editData[field] === "是" ? "true" : "false";
    } else if (field === "taxType-view") {
      jsonData["taxType"].result = editData[field] === "應税" ? "1" : editData[field] === "零税" ? "2" :
        editData[field] === "免税" ? "3" : "9";
    } else {
      jsonData[field].result = editData[field];
    }
    const result = await updateData(declareProperties.clientTaxId, jsonData);
    const validResult = validEvidence(result["03"], declareProperties.clientTaxId, assignMap);
    setLocalFiles(result);
    setRowData(validResult);
  };

  const handleOpenImage = async (fullPath) => {
    onViewImage({
      "fullPath": fullPath
    });
  };

  const handleDelete = async (id) => {
    await OnDeleteEvidence(declareProperties.clientTaxId, "03", id);
  };

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          startIcon={<ReadMore />}
          disableElevation="true"
          onClick={(e) => onGetIdentifyResult(e, localFiles["02"])}
        >
          取得辨識結果
        </Button>
        <Button
          variant="contained"
          startIcon={<PlaylistAddCheck />}
          disableElevation="true"
          onClick={handleResultAllConfirmed}
        >
          確認辨識結果
        </Button>
      </Stack>
      <EvidenceListTable data={rowData}
                         checkboxSelection={true}
                         handleSelection={handleSelection}
                         handleEditRow={handleEditRow}
                         handleOpenImage={handleOpenImage}
                         columns={IdentifiedEvidenceColumnDefinitions}
                         declareProperties={declareProperties}
                         handleDelete={handleDelete} />
    </>
  );
}

IdentifiedEvidenceListTable.propTypes = {
  data: PropTypes.any,
  declareProperties: PropTypes.any,
  OnDeleteEvidence: PropTypes.func,
  onViewImage: PropTypes.func,
  onGetIdentifyResult: PropTypes.func,
  assignMap: PropTypes.any,
  onResultAllConfirmed: PropTypes.func
};

export default IdentifiedEvidenceListTable;
