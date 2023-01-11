import { convertUnixTimestamp } from "../Util/Time";
import * as RequestMapper from "./GwReqMapper";
import * as ramda from "ramda";

const TAX_TYPE = {
  1: {
    name: "應税",
    number: 1,
    value: "TAXABLE"
  },
  2: {
    name: "零税",
    number: 2,
    value: "ZERO_TAX"
  },
  3: {
    name: "免税",
    number: 3,
    value: "DUTY_FEE"
  },
  9: {
    name: "混税",
    number: 9,
    value: ""
  }
};

const DEDUCTION_TYPE = {
  1: "PURCHASE_AND_FEE",
  2: "FIXED_ASSETS",
  3: "NON_PURCHASE_AND_FEE",
  4: "NON_FIXED_ASSETS"
};

const GW_EVIDENCE_TYPE = {
  A1001: {
    id: "21",
    name: "三聯式統一發票",
    value: "TRIPLE_GUI"
  },
  A2001: {
    id: "22",
    name: "二聯式收銀發票",
    value: "DUPLICATE_CASH_REGISTER_GUI"
  },
  A5001: {
    id: "25",
    name: "三聯式收銀機發票",
    value: "TRIPLE_CASH_REGISTER_GUI"
  },
  A5002: {
    id: "25",
    name: "電子發票證明聯-格式一",
    value: "EGUI"
  },
  A5003: {
    id: "25",
    name: "電子發票證明聯-格式二",
    value: "EGUI"
  },
  A5010: {
    id: "25",
    name: "電力帳單",
    value: "ELECTRIC_BILL"
  },
  A5020: {
    id: "25",
    name: "水費帳單-台灣自來水",
    value: "WATER_BILL"
  },
  A5021: {
    id: "25",
    name: "水費帳單-台北自來水",
    value: "WATER_BILL"
  },
  A5030: {
    id: "25",
    name: "電信費帳單-中華電信",
    value: "TELECOM_BILL"
  },
  A5031: {
    id: "25",
    name: "電信費帳單-台灣大哥大",
    value: "TELECOM_BILL"
  },
  A5032: {
    id: "25",
    name: "電信費帳單-遠傳",
    value: "TELECOM_BILL"
  },
  A5033: {
    id: "25",
    name: "電信費帳單-台灣之星",
    value: "TELECOM_BILL"
  },
  A5034: {
    id: "25",
    name: "電信費帳單-亞太",
    value: "TELECOM_BILL"
  },
  A8001: {
    id: "28",
    name: "海關代徵營業稅繳納證",
    value: "CUSTOMS_TAXABLE_EVIDENCE"
  }
  // A3001: {
  //   id: '',
  //   name: '勞保',
  //   value: ''
  // },
  // A3002: {
  //   id: '',
  //   name: '勞退',
  //   value: ''
  // },
  // A4001: {
  //   id: '',
  //   name: '健保',
  //   value: ''
  // },
  // other: {
  //   id: '',
  //   name: '其他',
  //   value: ''
  // },
  // '': {
  //   id: '',
  //   name: '',
  //   value: ''
  // }
};

const extractValue = (value, key) => value.value;
const extractId = (value, key) => value.id;
const extractName = (value, key) => value.name;
const evidenceTypeValue = ramda.mapObjIndexed(extractValue, GW_EVIDENCE_TYPE);
const evidenceTypeId = ramda.mapObjIndexed(extractId, GW_EVIDENCE_TYPE);
const evidenceTypeName = ramda.mapObjIndexed(extractName, GW_EVIDENCE_TYPE);
const EVIDENCE_TYPE = ramda.invertObj(evidenceTypeName);

const extractResultValue = (value, key) => value.result;


//period add
const parseToDomainObjStrategy = {
  A1001: RequestMapper.A1001ToGwObj,
  A2001: RequestMapper.A2001ToGwObj,
  A5001: RequestMapper.A5001ToGwObj,
  A5002: RequestMapper.A5002ToGwObj,
  A5003: RequestMapper.A5003ToGwObj,
  A5010: RequestMapper.A5010ToGwObj,
  A5020: RequestMapper.A5020ToGwObj,
  A5021: RequestMapper.A5021ToGwObj,
  A5030: RequestMapper.A5030ToGwObj,
  A5031: RequestMapper.A5031ToGwObj,
  A5032: RequestMapper.A5032ToGwObj,
  A5033: RequestMapper.A5033ToGwObj,
  A5034: RequestMapper.A5034ToGwObj,
  A8001: RequestMapper.A8001ToGwObj
};

class GwMapperClass {
  toDomainObj(jsonData) {
    const { gwEvidenceType } = jsonData;
    if (jsonData.status === "completed") {
      const data = parseToDomainObjStrategy[gwEvidenceType](jsonData);
      data.createDate = {
        result: jsonData.createDate,
        score: -1
      };
      return data;
    }

    return {
      isDeclareBusinessTax: {
        result: jsonData.isDeclareBusinessTax,
        score: -1
      },
      fullPath: { result: jsonData.fullPath, score: -1 },
      evidenceDate: { result: "", score: -1 },
      buyerTaxId: { result: "", score: -1 },
      taxType: { result: "1", score: -1 },
      otherFee: { result: 0, score: -1 },
      period: { result: 0, score: -1 },
      taxableSalesValue: { result: 0, score: -1 },
      dutyFreeSalesValue: { result: 0, score: -1 },
      businessTaxValue: { result: 0, score: -1 },
      totalPayAmount: { result: 0, score: -1 },
      totalAmount: { result: 0, score: -1 },
      reportingPeriod: { result: jsonData.reportingPeriod, score: -1 },
      taxableDeductionType: {
        result: jsonData.deductionType,
        score: 1
      },
      zeroTaxDeductionType: {
        result: "",
        score: 1
      },
      dutyFreeDeductionType: {
        result: "",
        score: 1
      },
      id: { result: jsonData.id, score: -1 },
      errorMsg: { result: "", score: -1 },
      gwEvidenceType: { result: gwEvidenceType, score: -1 },
      evidenceType: { result: "", score: -1 },
      zeroTaxSalesValue: { result: 0, score: -1 },
      evidenceNumber: { result: "", score: -1 },
      sellerTaxId: { result: "", score: -1 }
    };
  }

  toView(jsonData, ticketId, sn) {
    const result = ramda.mapObjIndexed(extractResultValue, jsonData);
    const { name } = GW_EVIDENCE_TYPE[result["evidenceType"]];
    result["isDeclareBusinessTax-view"] = result["isDeclareBusinessTax"] === "true" ? "是" : "否";
    if (result["taxType"] === "1") {
      result["taxType-view"] = "應税";
    }
    if (result["taxType"] === "2") {
      result["taxType-view"] = "零税";
    }
    if (result["taxType"] === "3") {
      result["taxType-view"] = "免税";
    }
    if (result["taxType"] === "9") {
      result["taxType-view"] = "混税";
    }

    result["evidenceType-view"] = name;
    result.sn = sn;
    result.id = ticketId;
    result.errorMsg = jsonData.errorMsg.result;
    return result;
  }

  toGw(jsonData) {
    const jsonDataValue = ramda.mapObjIndexed(extractResultValue, jsonData);
    const evidenceData = {
      buyerTaxId: jsonDataValue.buyerTaxId,
      consolidateFiling: {
        commentType: "BLANK",
        summaryCount: null
      },
      declareBusinessTax: jsonDataValue.isDeclareBusinessTax,
      evidenceDate: convertUnixTimestamp(jsonDataValue.evidenceDate),
      evidenceType: evidenceTypeValue[jsonDataValue.evidenceType],
      evidencePeriod: jsonDataValue.period,
      id: {
        evidenceId: jsonDataValue.evidenceNumber,
        guiId: null,
        declarationId: null
      },
      otherFee: jsonDataValue.otherFee,
      reportingPeriod: jsonDataValue.reportingPeriod,
      sellerTaxId: jsonDataValue.sellerTaxId,
      status: null,
      taxInfoList: buildTaxInfo(jsonDataValue),
      totalAmount: jsonDataValue.totalAmount,
      totalPayAmount: jsonDataValue.totalPayAmount
    };
    return evidenceData;
  }
}

const buildTaxInfo = (jsonData) => {
  const clearanceType = "BLANK";
  const taxInfoList = [];
  // const deductionType12Map = {1: 3, 2: 4, 3: 3, 4: 4}
  const taxableSalesValue = jsonData.taxableSalesValue;
  const tax = jsonData.businessTaxValue;
  const zeroTaxSalesValue = jsonData.zeroTaxSalesValue;
  const dutyFreeSalesValue = jsonData.dutyFreeSalesValue;
  const deductionType = DEDUCTION_TYPE[parseInt(jsonData.taxableDeductionType)];
  const dutyFeeDeductionType = DEDUCTION_TYPE[parseInt(jsonData.dutyFreeDeductionType)];
  const zeroTaxDeductionType = DEDUCTION_TYPE[parseInt(jsonData.zeroTaxDeductionType)];
  if (taxableSalesValue > 0) {
    taxInfoList.push({
      taxType: "TAXABLE",
      amountReq: {
        value: taxableSalesValue,
        currency: "TWD"
      },
      tax: tax,
      deductionType: deductionType,
      clearanceType: clearanceType
    });
  }
  if (zeroTaxSalesValue > 0) {
    taxInfoList.push({
      taxType: "ZERO_TAX",
      amountReq: {
        value: zeroTaxSalesValue,
        currency: "TWD"
      },
      tax: 0,
      deductionType: zeroTaxDeductionType,
      clearanceType: clearanceType
    });
  }
  if (dutyFreeSalesValue > 0) {
    taxInfoList.push({
      taxType: "DUTY_FEE",
      amountReq: {
        value: dutyFreeSalesValue,
        currency: "TWD"
      },
      tax: 0,
      deductionType: dutyFeeDeductionType,
      clearanceType: clearanceType
    });
  }
  return taxInfoList;
};

const GwMapper = new GwMapperClass();
export { GW_EVIDENCE_TYPE, DEDUCTION_TYPE, EVIDENCE_TYPE, TAX_TYPE };

export default GwMapper;
