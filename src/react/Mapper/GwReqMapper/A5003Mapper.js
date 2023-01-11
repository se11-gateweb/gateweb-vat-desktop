import { isEmptyOrUndefined } from "../../Util/StringUtils";
import { getPeriod, getTxtPeriod } from "../../Util/Time";


//[{"id":"531c32b6-8429-49a2-927b-1a31cd69e358","fileId":"63a8ff7adf2f9664a9fa8304","fileName":"A5003_1672019821024.jpg","modelId":"A5003-20221214-01","fields":[{"text":"HL34511341","name":"invoiceNumber","score":0.999},{"text":"20201130","name":"invoiceDate","score":0.999},{"text":"16151904","name":"buyerTaxId","score":0.9781},{"text":"24306240","name":"sellerTaxId","score":0.9988},{"text":"True","name":"taxable","score":0.428},{"text":"True","name":"zerotax","score":0.486},{"text":"True","name":"taxExempt","score":0.119},{"text":"2667","name":"salesAmount","score":0.9988},{"text":"133","name":"taxAmount","score":0.999},{"text":"2800","name":"totalAmount","score":0.999}]}]
const A5003ToGwObj = (data) => {
  console.log("A5003ToGwObj", data);
  const result = {
    taxableSalesValue: {
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
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result);
  let taxType = "1";
  result.taxableSalesValue = {
    result: result.salesAmount.result,
    score: -1
  };
  if (result.taxable.result === "True") {
    taxType = "1";
  }
  if (result.zerotax.result === "True") {
    taxType = "2";
    result.zeroTaxSalesValue = {
      result: result.salesAmount.result,
      score: -1
    };
    result.taxableSalesValue.result = 0;
  }
  if (result.taxExempt.result === "True") {
    taxType = "3";
    result.dutyFreeSalesValue = {
      result: result.salesAmount.result,
      score: -1
    };
    result.taxableSalesValue.result = 0;
  }
  if ((result.zerotax.result === "True" || result.taxExempt.result === "True") && result.taxable.result === "True") {
    taxType = "9";
    result.zeroTaxSalesValue.result = 0;
    result.dutyFreeSalesValue.result = 0;
    result.taxableSalesValue = {
      result: result.salesAmount.result,
      score: -1
    }
  }
  result.taxType = {
    result: taxType,
    score: 1
  };
  delete result.salesAmount;

  result.isDeclareBusinessTax = { result: data.isDeclareBusinessTax, score: -1 };
  result.fullPath = { result: data.fullPath, score: 1 };
  result.evidenceDate = result["invoiceDate"];
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
    result: "A5003",
    score: 1
  };
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
  result.evidenceNumber = result["invoiceNumber"];
  delete result.taxExempt;
  delete result.taxable;
  delete result.zerotax;
  delete result.invoiceNumber;
  delete result.invoiceDate;
  result.totalAmount.result = isEmptyOrUndefined(result.totalAmount.result) ? 0 : parseInt(result.totalAmount.result);
  result.otherFee = {
    result: 0,
    score: -1
  };
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result);
  result["businessTaxValue"] = result["taxAmount"];
  delete result.taxAmount;
  result.totalPayAmount = {
    result: result.totalAmount.result,
    score: -1
  };
  result["other"] = {
    result: result["otherFee"].result > 0 ? "Y" : "N",
    score: -1
  };
  result["saleAmount-view"] = {
    result: parseInt(result["taxableSalesValue"].result) + parseInt(result["dutyFreeSalesValue"].result) + parseInt(result["zeroTaxSalesValue"].result),
    score: 1
  };
  return result;
};
export { A5003ToGwObj };
