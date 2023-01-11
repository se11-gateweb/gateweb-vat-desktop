import { isEmptyOrUndefined } from '../../Util/StringUtils'
import { getPeriod, getTxtPeriod } from "../../Util/Time";

const A5001ToGwObj = (data) => {
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
  }
  data.data.fields
    .forEach(field => {
      const name = field.name
      result[name] = {
        result: field.text,
        score: -1
      }
    })
  result.isDeclareBusinessTax = { result: data.isDeclareBusinessTax, score: -1 }
  result.fullPath = { result: data.fullPath, score: 1 }
  result.evidenceDate = result['invoiceDate']
  result.taxType = {
    result: '1',
    score: 1
  }
  result.otherFee = {
    result: 0,
    score: -1
  }
  result.reportingPeriod = {
    result: data.reportingPeriod,
    score: 1
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
    score: 1
  }
  result.gwEvidenceType = {
    result: data.gwEvidenceType,
    score: 1
  }
  result.evidenceType = {
    result: 'A5001',
    score: 1
  }
  result.evidenceNumber = result['invoiceNumber']
  delete result.invoiceNumber
  delete result.invoiceDate
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
  result.totalAmount.result = isEmptyOrUndefined(result.totalAmount.result) ? 0 : parseInt(result.totalAmount.result)
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result)
  result.businessTaxValue = result.taxAmount
  delete result.taxAmount
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result)
  result.taxableSalesValue = result.salesAmount
  delete result.salesAmount
  result.totalPayAmount = {
    result: result.totalAmount.result ,
    score: -1
  }
  result['other'] = {
    result: result['otherFee'].result> 0 ? 'Y' : 'N',
    score: -1
  }
  result['saleAmount-view'] = {
    result: parseInt(result['taxableSalesValue'].result) + parseInt(result['dutyFreeSalesValue'].result) + parseInt(result['zeroTaxSalesValue'].result),
    score: 1
  }
  return result
}
export { A5001ToGwObj }
