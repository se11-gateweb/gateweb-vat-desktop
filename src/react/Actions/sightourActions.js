// import { signtTourAxios } from './axios'

const getToken = async (id, psw) => {
  // try {
  //   const apiPath = '/requestToken.php';
  //   const formData = new FormData();
  //   formData.append('id', id);
  //   formData.append('psw', psw);
  //   const result = await signtTourAxios.post(apiPath, formData);
  //   return result.data.token;
  // } catch (error) {
  //   throw new Error(error);
  // }
};

export async function sendToIdentify(identifyData) {
  // const apiPath = '/upload.php'
  // const config = {
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }
  // }
  // let resultList = []
  // for (let i = 0; i < identifyData.length; i++) {
  //   const data = identifyData[i]
  //   try {
  //     const token = await getToken('gateweb1', 'qwe123')
  //     const formData = new FormData()
  //     formData.append('file', new File([data.fileBlob], data.sourceFileName))
  //     formData.append('type', data.evidenceType)
  //     formData.append('agent', data.accountingfirmTaxId)
  //     formData.append('company', data.businessEntityTaxId)
  //     formData.append('token', token)
  //     const result = await signtTourAxios.post(apiPath, formData, config)
  //     if (result.data['result'] === 0) {
  //       resultList.push({
  //         'result': true,
  //         'type': data.evidenceType,
  //         'businessEntityTaxId': data.businessEntityTaxId,
  //         'ticketId': result.data['ticket'],
  //         'sourceFullPath': data.sourceFullPath,
  //         'sourceFileName': data.sourceFileName
  //       })
  //     } else {
  //       resultList.push({
  //         'result': false,
  //         'type': data.evidenceType,
  //         'businessEntityTaxId': data.businessEntityTaxId,
  //         'sourceFullPath': data.sourceFullPath,
  //         'sourceFileName': data.sourceFileName
  //       })
  //     }
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }
  // return resultList
}
//
// export async function getIdentifyResult(payload) {
//   // try {
//   //   const apiPath = '/check.php'
//   //   const token = await getToken('gateweb1', 'qwe123')
//   //   const formData = new FormData()
//   //   formData.append('token', token)
//   //   formData.append('ticket', payload.ticketId)
//   //   const result = await signtTourAxios.post(apiPath, formData)
//   //   if (result.data.result === undefined) {
//   //     const status = result.data.pageList[0]['photoList'][0].result.length === 0 ?
//   //                    'failed' : 'completed'
//   //     return {
//   //       'fullPath': payload.fullPath,
//   //       'reportingPeriod': payload.reportingPeriod,
//   //       'deductionType': payload.deductionType,
//   //       'gwEvidenceType': payload.gwEvidenceType,
//   //       'ticketId': payload.ticketId,
//   //       'isDeclareBusinessTax': payload.isDeclareBusinessTax,
//   //       'status': status,
//   //       'data': result.data
//   //     }
//   //   }
//   //   if (result.data.result === -200014) {
//   //     return {
//   //       'fullPath': payload.fullPath,
//   //       'reportingPeriod': payload.reportingPeriod,
//   //       'deductionType': payload.deductionType,
//   //       'gwEvidenceType': payload.gwEvidenceType,
//   //       'ticketId': payload.ticketId,
//   //       'isDeclareBusinessTax': payload.isDeclareBusinessTax,
//   //       'status': 'process'
//   //     }
//   //   }
//   //   return {
//   //     'fullPath': payload.fullPath,
//   //     'reportingPeriod': payload.reportingPeriod,
//   //     'deductionType': payload.deductionType,
//   //     'gwEvidenceType': payload.gwEvidenceType,
//   //     'isDeclareBusinessTax': payload.isDeclareBusinessTax,
//   //     'ticketId': payload.ticketId,
//   //     'status': 'failed'
//   //   }
//   // } catch (error) {
//   //   throw new Error(error)
//   // }
// }
// deprecated
export async function sendConfirmedResult(payload) {
  // try {
  //   const apiPath = '/feedbackResult.php'
  //   const token = await getToken('gateweb1', 'qwe123')
  //   const data = [payload.data]
  //   const photoId = payload.photoId
  //   const formData = new FormData()
  //   formData.append('token', token)
  //   formData.append('data', JSON.stringify(data))
  //   formData.append('photo', photoId)
  //   const result = await signtTourAxios.post(apiPath, formData)
  //   return result.data['token']
  // } catch (error) {
  //   throw new Error(error)
  // }
}
