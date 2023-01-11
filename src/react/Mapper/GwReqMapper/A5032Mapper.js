import {isEmptyOrUndefined} from '../../Util/StringUtils'
import {getCurrentPeriodYearWithMonth} from "../../Util/Time";

const A5032ToGwObj = (data) => {
  const result = {
    taxAmount: {
      result: 0,
      score: -1
    },
    salesAmount: {
      result: 0,
      score: -1
    },
    dutyFreeSalesValue: {
      result: 0,
      score: -1
    },
    zeroTaxSalesValue: {
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
  result.evidenceNumber = result['carrierNumber']
  delete result.carrierNumber
  result.evidenceDate = result['invoiceDate']
  delete result.evidenceDate
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
    result: 'A5032',
    score: 1
  }

  result.otherFee = {
    result: 0,
    score: -1
  }
  result.salesAmount.result = isEmptyOrUndefined(result.salesAmount.result) ? 0 : parseInt(result.salesAmount.result)
  result.taxableSalesValue = result.salesAmount
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result)
  result.businessTaxValue = result.taxAmount
  result.zeroTaxSalesAmount.result = isEmptyOrUndefined(result.zeroTaxSalesAmount.result) ? 0 : parseInt(result.zeroTaxSalesAmount.result)
  result.zeroTaxSalesValue = result.zeroTaxSalesAmount
  let taxType = ''
  if (result.zeroTaxSalesAmount.result > 0 && result.salesAmount.result > 0) {
    taxType = '9'
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


  delete result.salesAmount
  delete result.taxAmount

  result.payAmount.result = isEmptyOrUndefined(result.payAmount.result) ? 0 : parseInt(result.payAmount.result)
  result.totalAmount = {
    result: result['payAmount'].result,
    score: -1
  }
  result.totalPayAmount = {
    result: result['payAmount'].result,
    score: -1
  }
  delete result.payAmount
  result['other'] = {
    result: result['otherFee'].result > 0 ? 'Y' : 'N',
    score: -1
  }
  result['saleAmount-view'] = {
    result: parseInt(result['taxableSalesValue'].result) + parseInt(result['dutyFreeSalesValue'].result) + parseInt(result['zeroTaxSalesValue'].result),
    score: 1
  }
  return result
}
export { A5032ToGwObj }
