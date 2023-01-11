import moment from "moment";
import { getPeriod } from "../Util/Time";
import { EVIDENCE_TYPE } from "../Mapper/gw_mapper";

const validTaxId = (taxId) => {
  const invalidList = "00000000,11111111";
  if (/^\d{8}$/.test(taxId) === false || invalidList.indexOf(taxId) !== -1) {
    return false;
  }
  const validateOperator = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;
  const calculate = function(product) { // 個位數 + 十位數
    const ones = product % 10;
    const tens = (product - ones) / 10;
    return ones + tens;
  };
  for (let i = 0; i < validateOperator.length; i++) {
    sum += calculate(taxId[i] * validateOperator[i]);
  }
  return sum % 10 === 0 || (taxId[6] === "7" && (sum + 1) % 10 === 0);
};

const validData = (clientTaxId, json, assignMap) => {
  let validResult = validTaxMoney(json);
  const type = EVIDENCE_TYPE[json["evidenceType-view"]];
  const isCustom = type === "A8001";
  if (!isCustom && (json.sellerTaxId.length !== 8 || !validTaxId(json.sellerTaxId))) {
    validResult.push("sellerTaxId");
  }
  if (isCustom && (json.sellerTaxId.length !== 0)) {
    validResult.push("sellerTaxId");
  }
  if (json.buyerTaxId.length !== 8 || !validTaxId(json.buyerTaxId) || json.buyerTaxId !== clientTaxId.toString()) {
    validResult.push("buyerTaxId");
  }
  const isBill = type === "A5010"
    || type === "A5020"
    || type === "A5021"
    || type === "A5030"
    || type === "A5031"
    || type === "A5032"
    || type === "A5033"
    || type === "A5034";
  if (isBill) {
    if (json["other"] === "Y" && parseInt(json["otherFee"]) === 0) {
      validResult.push("other");
    }
  }

  validResult = validResult
    .concat(validEvidenceType[type](json, assignMap))
    .concat(validEvidenceDate(json));
  json.cellHighlight = [...new Set(validResult)];
  json.cellHighlight = json.cellHighlight
    .filter((value) => value !== "");
  json.cellHighlight = json.cellHighlight.length > 0 ? json.cellHighlight.concat("sn") : json.cellHighlight;
  json.cellHighlight = [...new Set(validResult)];
  json.cellHighlight = json.cellHighlight
    .filter(el => el);
  console.log("valid result", json.cellHighlight);
  return json;
};


const validEvidenceDate = (json) => {
  if (!moment(json.evidenceDate, "YYYYMMDD", true).isValid()) {
    return "evidenceDate";
  }
  const evidencePeriod = getPeriod(json.evidenceDate);
  const reportingPeriod = parseInt(json.reportingPeriod);
  const tenYearAgoPeriod = reportingPeriod - 1000;
  const isBetweenTenYearAgoPeriodAndReportingPeriod = (reportingPeriod >= evidencePeriod) && (tenYearAgoPeriod <= evidencePeriod);

  if (!isBetweenTenYearAgoPeriodAndReportingPeriod) {
    return "evidenceDate";
  }
  return "";
};

const validGUI = (typeValue, json, assignMap) => {
  if (json.evidenceDate === undefined) {
    return ["evidenceNumber"];
  }
  const yyyymm = getPeriod(json.evidenceDate);
  const trackId = json.evidenceNumber.substring(0, 2);
  const isTrackIdIncludeAssign = assignMap[typeValue][yyyymm] === undefined ? false : assignMap[typeValue][yyyymm].includes(trackId);
  if (!isTrackIdIncludeAssign) {
    return ["evidenceNumber"];
  }
  const isNumber = !isNaN(json.evidenceNumber.substring(2));
  return json.evidenceNumber !== undefined && json.evidenceNumber.length === 10 && isTrackIdIncludeAssign && isNumber ? [""] : ["evidenceNumber"];
};

const validBill = (json) => (json.evidenceNumber !== undefined && json.evidenceNumber.length === 10 && json.evidenceNumber.startsWith("BB") ? [""] : ["evidenceNumber"]);

const validEvidenceType = {
  A1001: (json, assignMap) => validGUI(21, json, assignMap),
  A2001: (json, assignMap) => validGUI(22, json, assignMap),
  A5001: (json, assignMap) => validGUI(25, json, assignMap),
  A5002: (json, assignMap) => validGUI(25, json, assignMap),
  A5003: (json, assignMap) => validGUI(25, json, assignMap),
  A5010: (json, assignMap) => validBill(json),
  A5020: (json, assignMap) => validBill(json),
  A5021: (json, assignMap) => validBill(json),
  A5030: (json, assignMap) => validBill(json),
  A5031: (json, assignMap) => validBill(json),
  A5033: (json, assignMap) => validBill(json),
  A5032: (json, assignMap) => validBill(json),
  A5034: (json, assignMap) => validBill(json),
  A8001: (json, assignMap) => {
    const { evidenceNumber } = json;
    const isLenEqual14 = evidenceNumber !== undefined && evidenceNumber.length === 14;
    const firstAlpha = evidenceNumber.substring(0, 1);
    const isBlank = firstAlpha !== " ";
    const thirdAlpha = evidenceNumber.substring(2, 3);
    const isEqualI = thirdAlpha === "I";
    const isEvidenceNumberOk = isLenEqual14 && isBlank && isEqualI ? "" : "evidenceNumber";
    return [isEvidenceNumberOk];
  },
  "": (json, assignMap) => ["evidenceType", "evidenceNumber"],
  undefined: (json, assignMap) => ["evidenceType", "evidenceNumber"]
};

const validTaxType = {
  1: (json) => {
    const isZeroTaxSalesValueEq0 = parseInt(json.zeroTaxSalesValue) === 0 ? "" : "zeroTaxSalesValue";
    const isDutyFreeSalesValueEq0 = parseInt(json.dutyFreeSalesValue) === 0 ? "" : "dutyFreeSalesValue";
    const isTaxableSalesValueGte0 = parseInt(json.taxableSalesValue) >= 0 ? "" : "taxableSalesValue";
    const isTaxableDeductionType = (json.taxableDeductionType === "1" || json.taxableDeductionType === "2" || json.taxableDeductionType === "3" || json.taxableDeductionType === "4") ? "" : "sn";
    const isZeroTaxDeductionType = json.zeroTaxDeductionType === "" ? "" : "sn";
    const isDutyFreeDeductionType = json.dutyFreeDeductionType === "" ? "" : "sn";
    return [isZeroTaxSalesValueEq0, isDutyFreeSalesValueEq0, isTaxableSalesValueGte0,
      isTaxableDeductionType, isZeroTaxDeductionType, isDutyFreeDeductionType];
  },
  2: (json) => {
    const isZeroTaxSalesValueGte0 = parseInt(json.zeroTaxSalesValue) >= 0 ? "" : "zeroTaxSalesValue";
    const isDutyFreeSalesValueEq0 = parseInt(json.dutyFreeSalesValue) === 0 ? "" : "dutyFreeSalesValue";
    const isTaxableSalesValueEq0 = parseInt(json.taxableSalesValue) === 0 ? "" : "taxableSalesValue";
    const isBusinessTaxValueEq0 = parseInt(json.businessTaxValue) === 0 ? "" : "businessTaxValue";
    const isTaxableDeductionType = json.taxableDeductionType === "" ? "" : "sn";
    const isZeroTaxDeductionType = (json.zeroTaxDeductionType === "3" || json.zeroTaxDeductionType === "4") ? "" : "sn";
    const isDutyFreeDeductionType = json.dutyFreeDeductionType === "" ? "" : "sn";
    return [isZeroTaxSalesValueGte0, isDutyFreeSalesValueEq0, isTaxableSalesValueEq0, isBusinessTaxValueEq0,
      isTaxableDeductionType, isZeroTaxDeductionType, isDutyFreeDeductionType];
  },
  3: (json) => {
    const isZeroTaxSalesValueEq0 = parseInt(json.zeroTaxSalesValue) === 0 ? "" : "zeroTaxSalesValue";
    const isDutyFreeSalesValueGte0 = parseInt(json.dutyFreeSalesValue) >= 0 ? "" : "dutyFreeSalesValue";
    const isTaxableSalesValueEq0 = parseInt(json.taxableSalesValue) === 0 ? "" : "taxableSalesValue";
    const isBusinessTaxValueEq0 = parseInt(json.businessTaxValue) === 0 ? "" : "businessTaxValue";
    const isTaxableDeductionType = json.taxableDeductionType === "" ? "" : "sn";
    const isZeroTaxDeductionType = json.zeroTaxDeductionType === "" ? "" : "sn";
    const isDutyFreeDeductionType = (json.dutyFreeDeductionType === "3" || json.dutyFreeDeductionType === "4") ? "" : "sn";
    return [isZeroTaxSalesValueEq0, isDutyFreeSalesValueGte0, isTaxableSalesValueEq0, isBusinessTaxValueEq0,
      isTaxableDeductionType, isZeroTaxDeductionType, isDutyFreeDeductionType];
  },
  9: (json) => {
    const isTaxableSalesValueGte0 = parseInt(json.taxableSalesValue) >= 0 ? "" : "taxableSalesValue";
    const isBusinessTaxValueGt0 = parseInt(json.businessTaxValue) >= 0 ? "" : "businessTaxValue";
    const isZeroTaxSalesValueGt0 = parseInt(json.zeroTaxSalesValue) >= 0 ? "" : "zeroTaxSalesValue";
    const isDutyFreeSalesValueGt0 = parseInt(json.dutyFreeSalesValue) >= 0 ? "" : "dutyFreeSalesValue";
    const deductionType12Map = { 1: 3, 2: 4, 3: 3, 4: 4 };
    const isTaxableDeductionType = (json.taxableDeductionType === "1" || json.taxableDeductionType === "2" || json.taxableDeductionType === "3" || json.taxableDeductionType === "4") ? "" : "sn";
    const deductionType2 = deductionType12Map[parseInt(json.taxableDeductionType)];
    let isZeroTaxDeductionType = "";
    if (parseInt(json["zeroTaxSalesValue"]) > 0) {
      isZeroTaxDeductionType = json.zeroTaxDeductionType === deductionType2 + "" ? "" : "sn";
    }
    let isDutyFreeDeductionType = "";
    if (parseInt(json["dutyFreeSalesValue"]) > 0) {
      isDutyFreeDeductionType = json.dutyFreeDeductionType === deductionType2 + "" ? "" : "sn";
    }
    return [isTaxableSalesValueGte0, isBusinessTaxValueGt0, isZeroTaxSalesValueGt0, isDutyFreeSalesValueGt0,
      isTaxableDeductionType, isZeroTaxDeductionType, isDutyFreeDeductionType];
  },
  "": (json) => ["zeroTaxSalesValue", "dutyFreeSalesValue", "taxableSalesValue", "taxType", "businessTaxValue", "sn"],
  undefined: (json) => ["zeroTaxSalesValue", "dutyFreeSalesValue", "taxableSalesValue", "taxType", "businessTaxValue", "sn"]
};

const validB2B = (json) => {
  const taxableSalesValue = parseInt(json.taxableSalesValue);
  const withoutTaxAmount = parseInt(json.taxableSalesValue) + parseInt(json.zeroTaxSalesValue) + parseInt(json.dutyFreeSalesValue);
  const realTax = taxableSalesValue * 0.05;
  const ceilTax = Math.ceil(realTax);
  const floorTax = Math.floor(realTax);
  const calcResultValue = parseInt(json.totalAmount) - withoutTaxAmount;
  if (calcResultValue <= ceilTax && calcResultValue >= floorTax) {
    return [];
  }
  return ["zeroTaxSalesValue", "dutyFreeSalesValue", "taxableSalesValue", "businessTaxValue"];
};

const validB2C = (json) => {
  let result = [];
  const businessTaxValue = parseInt(json.businessTaxValue);
  const withoutTaxAmount = parseInt(json.taxableSalesValue) + parseInt(json.zeroTaxSalesValue) + parseInt(json.dutyFreeSalesValue);
  if (withoutTaxAmount !== parseInt(json.totalAmount)) {
    result.push("zeroTaxSalesValue");
    result.push("dutyFreeSalesValue");
    result.push("taxableSalesValue");
    result.push("saleAmount-view");
  }
  if (businessTaxValue !== 0) {
    result.push("businessTaxValue");
  }
  return result;
};

const validTax = (json) => {
  const type = EVIDENCE_TYPE[json["evidenceType-view"]];
  switch (type) {
    case "A2001":
      return validB2C(json);
    default:
      return validB2B(json);
  }
};

const validTaxMoney = (json) => {
  const validResult =
    validTaxType[parseInt(json.taxType)](json)
      .concat(validTax(json));
  const withoutTotalAmount = parseInt(json.taxableSalesValue) + parseInt(json.zeroTaxSalesValue) + parseInt(json.dutyFreeSalesValue);
  if (withoutTotalAmount !== parseInt(json["saleAmount-view"])) {
    validResult.push("saleAmount-view");
  }
  const totalAmount = withoutTotalAmount + parseInt(json.businessTaxValue);
  if (totalAmount !== parseInt(json.totalAmount) || totalAmount === 0) {
    validResult.push("totalAmount", "zeroTaxSalesValue", "businessTaxValue", "dutyFreeSalesValue", "taxableSalesValue", "saleAmount-view");
  }
  const payAmount = totalAmount + parseInt(json.otherFee);
  if (payAmount !== parseInt(json.totalPayAmount) || payAmount === 0) {
    validResult.push("totalAmount", "otherFee", "totalPayAmount", "saleAmount-view");
  }
  return [...new Set(validResult)];
};

export { validData, validTaxId };
