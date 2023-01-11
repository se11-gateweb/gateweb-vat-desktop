import { isEmptyOrUndefined } from '../../Util/StringUtils'
import {getCurrentPeriodYear, getCurrentPeriodYearWithMonth} from "../../Util/Time";

const A5030ToGwObj = (data) => {
  const result = {
    taxAmount: {
      result: 0,
      score: -1
    },
    salesAmount: {
      result: 0,
      score: -1
    },
    totalAmount: {
      result: 0,
      score: -1
    },
    freeTaxSalesAmount: {
      result: 0,
      score: -1
    },
    zeroTaxSalesAmount: {
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
  delete result.evidenceDate
  result.evidenceNumber = result['carrierNumber']
  delete result.carrierNumber
  result.taxType = {
    result: '1',
    score: -1
  }
  result.period = result['carrierPeriod']
  result.evidenceDate = {
    result: result.period.result + '01',
    score: -1
  }
  result.period.result = getCurrentPeriodYearWithMonth(result.period.result)
  delete result['carrierPeriod']
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
    result: 'A5030',
    score: 1
  }
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result)
  result.businessTaxValue = result.taxAmount
  result.freeTaxSalesAmount.result = isEmptyOrUndefined(result.freeTaxSalesAmount.result) ? 0 : parseInt(result.freeTaxSalesAmount.result)
  result.dutyFreeSalesValue = result.freeTaxSalesAmount
  result.zeroTaxSalesAmount.result = isEmptyOrUndefined(result.zeroTaxSalesAmount.result) ? 0 : parseInt(result.zeroTaxSalesAmount.result)
  result.zeroTaxSalesValue = result.zeroTaxSalesAmount
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result)
  result.taxableSalesValue = result.salesAmount
  let totalAmt = result.salesAmount.result + result.taxAmount.result + result.zeroTaxSalesAmount.result +
    result.freeTaxSalesAmount.result

  result.totalAmount = {
    result: totalAmt,
    score: -1
  }
  let taxType = ''
  if ((result.freeTaxSalesAmount.result > 0 || result.zeroTaxSalesAmount.result > 0) && result.salesAmount.result > 0) {
    taxType = '9'
  }
  if (result.freeTaxSalesAmount.result > 0) {
    taxType = '3'
  }
  if (result.zeroTaxSalesAmount.result > 0) {
    taxType = '2'
  }
  if (result.salesAmount.result > 0) {
    taxType = '1'
  }
  result.taxType = {
    result: taxType,
    score: -1
  }
  delete result.taxAmount
  delete result.freeTaxSalesAmount
  delete result.zeroTaxSalesAmount
  delete result.salesAmount
  result.payAmount.result = isEmptyOrUndefined(result.payAmount.result) ? 0 : parseInt(result.payAmount.result)
  result.otherFee = {
    result: 0,
    score: -1
  }
  delete result.payAmount
  result.totalPayAmount = {
    result: result.totalAmount.result + result.otherFee.result,
    score: -1
  }
  result['other'] = {
    result:result['otherFee'].result > 0 ? 'Y' : 'N',
    score: -1
  }
  result['saleAmount-view'] = {
    result: parseInt(result['taxableSalesValue'].result) + parseInt(result['dutyFreeSalesValue'].result) + parseInt(result['zeroTaxSalesValue'].result),
    score: 1
  }
  return result
}
export { A5030ToGwObj }
