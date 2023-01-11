// {
//         "text": "AXI21190426600",
//         "name": "taxStatementNumber",
//         "score": 0.995
//       },
//       {
//         "text": "20200413",
//         "name": "invoiceDate",
//         "score": 0.995
//       },
//       {
//         "text": "84876976",
//         "name": "buyerTaxId",
//         "score": 0.819
//       },
//       {
//         "text": "48606",
//         "name": "salesAmount",
//         "score": 0.654
//       },
//       {
//         "text": "2430",
//         "name": "taxAmount",
//         "score": 0.992
//       }

import { isEmptyOrUndefined } from '../../Util/StringUtils'
import { getPeriod, getTxtPeriod } from "../../Util/Time";

const A8001ToGwObj = (data) => {
  const result = {
    taxAmount: {
      result: 0,
      score: -1
    },
    salesAmount: {
      result: 0,
      score: -1
    }
  }
  data.data.fields
    .forEach(field => {
      result[field.name] = {
        result: field.text,
        score: -1
      }
    })

  result.isDeclareBusinessTax = { result: data.isDeclareBusinessTax, score: -1 }
  result.fullPath = { result: data.fullPath, score: 1 }
  result.evidenceDate = result['invoiceDate']
  delete result.invoiceDate
  result.taxType = {
    result: '1',
    score: -1
  }
  result.otherFee = {
    result: 0,
    score: -1
  }
  let period = ''
  try {
    period = getTxtPeriod(result.evidenceDate.result)
  } catch (e) {
    console.log(e)
  }
  result.period = {
    result: period,
    score: -1
  }
  result.reportingPeriod = {
    result: data.reportingPeriod,
    score: -1
  }
  result.taxableDeductionType = {
    result: data.deductionType,
    score: 1
  }
  result.zeroTaxDeductionType = {
    result: '',
    score: 1
  }
  result.dutyFreeDeductionType = {
    result: '',
    score: 1
  }
  result.id = {
    result: data.id,
    score: 1
  }
  result.errorMsg = {
    result: '',
    score: -1
  }
  result.gwEvidenceType = {
    result: data.gwEvidenceType,
    score: -1
  }
  result.evidenceType = {
    result: 'A8001',
    score: 1
  }
  result.evidenceNumber = result['taxStatementNumber']
  delete result.taxStatementNumber
  result.zeroTaxSalesValue = {
    result: 0,
    score: -1
  }
  result.dutyFreeSalesValue = {
    result: 0,
    score: -1
  }
  result.sellerTaxId = {
    result: '',
    score: -1
  }
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result)
  result.taxableSalesValue = result.salesAmount
  delete result.salesAmount
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result)
  result.businessTaxValue = result.taxAmount
  delete result.taxAmount
  result.totalAmount = {
    result: result.taxableSalesValue.result + result.businessTaxValue.result,
    score: -1
  }
  result.totalPayAmount = {
    result: result.totalAmount.result,
    score: -1
  }
  result['other'] = {
    result: result['otherFee'] > 0 ? 'Y' : 'N',
    score: -1
  }
  result['saleAmount-view'] = {
    result: parseInt(result['taxableSalesValue'].result) + parseInt(result['dutyFreeSalesValue'].result) + parseInt(result['zeroTaxSalesValue'].result),
    score: 1
  }
  return result
}
export { A8001ToGwObj }
