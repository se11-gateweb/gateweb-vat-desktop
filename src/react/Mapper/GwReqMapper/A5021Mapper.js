import { isEmptyOrUndefined } from '../../Util/StringUtils'
import {getCurrentPeriodYear, getCurrentPeriodYearWithMonth} from "../../Util/Time";

const A5021ToGwObj = (data) => {
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
      const name = field.name
      result[name] = {
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
    result: 'A5021',
    score: 1
  }
  result.evidenceNumber = result['carrierNumber']
  delete result.carrierNumber


  result.zeroTaxSalesValue = {
    result: 0,
    score: -1
  }
  result.dutyFreeSalesValue = {
    result: 0,
    score: -1
  }

  result.taxableSalesValue = result.salesAmount
  result.taxableSalesValue.result = isEmptyOrUndefined(result.taxableSalesValue.result) ? 0 : parseInt(result.taxableSalesValue.result)
  delete result.salesAmount
  result.taxAmount.result = isEmptyOrUndefined(result.taxAmount.result) ? 0 : parseInt(result.taxAmount.result)
  result.businessTaxValue = result.taxAmount
  delete result.taxAmount
  result.levyAmount.result = isEmptyOrUndefined(result.levyAmount.result) ? 0 : parseInt(result.levyAmount.result)
  result.payAmount.result = isEmptyOrUndefined(result.payAmount.result) ? 0 : parseInt(result.payAmount.result)
  result.otherFee = {
    result: result['levyAmount'].result,
    score: -1
  }

  result.totalAmount.result = isEmptyOrUndefined(result.totalAmount.result) ? 0 : parseInt(result.totalAmount.result)
  delete result.levyAmount
  delete result.payAmount
  result.totalPayAmount = {
    result: result['totalAmount'].result + result['otherFee'].result,
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
export { A5021ToGwObj }
