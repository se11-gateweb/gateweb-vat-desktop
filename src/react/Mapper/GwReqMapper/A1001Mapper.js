import { isEmptyOrUndefined } from "../../Util/StringUtils";
import { getTxtPeriod } from "../../Util/Time";

const A1001ToGwObj = (data) => {
  const result = {
    taxAmount: {
      result: 0,
      score: -1
    },
    zeroTaxSalesValue: {
      result: 0,
      score: -1
    },
    dutyFreeSalesValue: {
      result: 0,
      score: -1
    }
  };
  data.data.fields
    .forEach(field => {
      const name = field.name;
      result[name] = {
        result: field.text,
        score: -1
      };
    });
  result.isDeclareBusinessTax = { result: data.isDeclareBusinessTax, score: -1 };
  result.fullPath = { result: data.fullPath, score: 1 };
  result.evidenceDate = result["invoiceDate"];
  let period = "";
  try {
    period = getTxtPeriod(result.evidenceDate.result);
  } catch (e) {
    console.log(e);
  }
  result.period = {
    result: period,
    score: -1
  };
  result.reportingPeriod = {
    result: data.reportingPeriod,
    score: 1
  };
  result.taxableDeductionType = {
    result: data.deductionType,
    score: 1
  };
  result.zeroTaxDeductionType = {
    result: "",
    score: 1
  };
  result.dutyFreeDeductionType = {
    result: "",
    score: 1
  };
  result.id = {
    result: data.id,
    score: 1
  };
  result.errorMsg = {
    result: "",
    score: 1
  };
  result.gwEvidenceType = {
    result: data.gwEvidenceType,
    score: 1
  };
  result.evidenceType = {
    result: "A1001",
    score: 1
  };
  result.evidenceNumber = result["invoiceNumber"];
  delete result.invoiceNumber;
  delete result.invoiceDate;
  result.totalAmount.result = isEmptyOrUndefined(result.totalAmount.result) ? 0 : parseInt(result.totalAmount.result);
  result.otherFee = {
    result: 0,
    score: -1
  };
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result);
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result);
  result.totalPayAmount = {
    result: result.totalAmount.result,
    score: -1
  };
  let taxType = "1";
  result["taxableSalesValue"] = result["salesAmount"];
  if (result["taxable"].result === "True") {
    taxType = "1";
    result["taxableSalesValue"] = {
      result: result.salesAmount.result,
      score: -1
    };
  }
  if (result["zerotax"].result === "True") {
    taxType = "2";
    result["zeroTaxSalesValue"] = {
      result: result.salesAmount.result,
      score: -1
    };
    result.taxableSalesValue.result = 0;
  }
  if (result["taxExempt"].result === "True") {
    taxType = "3";
    result["dutyFreeSalesValue"] = {
      result: result.salesAmount.result,
      score: -1
    };
    result.taxableSalesValue.result = 0;
  }
  if ((result["zerotax"].result === "True" || result["taxExempt"].result === "True") && result["taxable"].result === "True") {
    taxType = "9";
    result["taxableSalesValue"] = {
      result: result.salesAmount.result,
      score: -1
    };
    result.zeroTaxSalesValue.result = 0;
    result.dutyFreeSalesValue.result = 0;
  }
  result["taxType"] = {
    result: taxType,
    score: -1
  };
  result["businessTaxValue"] = result["taxAmount"];
  result["other"] = {
    result: result["otherFee"].result > 0 ? "Y" : "N",
    score: -1
  };
  result["saleAmount-view"] = {
    result: parseInt(result["taxableSalesValue"].result) + parseInt(result["dutyFreeSalesValue"].result) + parseInt(result["zeroTaxSalesValue"].result),
    score: 1
  };
  delete result["taxAmount"];
  delete result["salesAmount"];
  delete result.taxExempt;
  delete result.taxable;
  delete result.zerotax;
  return result;
};
export { A1001ToGwObj };
