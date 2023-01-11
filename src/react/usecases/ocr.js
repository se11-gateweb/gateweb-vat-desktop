import { gwAxios } from "../Actions/axios";

const recognizeAsync = async (token, ownerId, identifyData) => {
  console.log("recognizeAsync", identifyData);
  const requestOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,
      "ownerId": ownerId
    }
  };
  let resultList = [];
  try {
    for (let i = 0; i < identifyData.length; i++) {
      const data = identifyData[i];
      const formData = new FormData();
      formData.append("documentTypeCode", data.evidenceType);
      //docx pdf
      formData.append("fileContent", new File([data.fileBlob], data.sourceFileName));
      formData.append("url", null);
      const response = await gwAxios.post("/ocr/api/v1/recognize/async", formData, requestOptions);
      resultList.push({
        "result": true,
        "type": data.evidenceType,
        "businessEntityTaxId": data.businessEntityTaxId,
        "sourceFullPath": data.sourceFullPath,
        "sourceFileName": data.sourceFileName,
        "id": response.data.id
      });
    }
    return resultList;
  } catch (error) {
    throw new Error(error);
  }

};


async function getIdentifyResult(token, owner, payload) {
  console.log("getId", payload);
  const requestOptions = {
    headers: {
      "Authorization": `Bearer ${token}`,
      "ownerId": owner
    }
  };
  try {
    const apiPath = "/ocr/api/v1/recognize/" + payload.id;
    const response = await gwAxios.get(apiPath, requestOptions);
    //cs 偷改response error handler
    if (!Array.isArray(response.data)) {
      return {
        "createDate": payload.createDate,
        "fullPath": payload.fullPath,
        "reportingPeriod": payload.reportingPeriod,
        "deductionType": payload.deductionType,
        "gwEvidenceType": payload.gwEvidenceType,
        "id": payload.id,
        "isDeclareBusinessTax": payload.isDeclareBusinessTax,
        "data": response.data,
        "status": "completed"
      };
    }
    return {
      "createDate": payload.createDate,
      "fullPath": payload.fullPath,
      "reportingPeriod": payload.reportingPeriod,
      "deductionType": payload.deductionType,
      "gwEvidenceType": payload.gwEvidenceType,
      "id": payload.id,
      "isDeclareBusinessTax": payload.isDeclareBusinessTax,
      "data": response.data[0],
      "status": "completed"
    };
  } catch (error) {
    console.log(error);
    return {
      "fullPath": payload.fullPath,
      "reportingPeriod": payload.reportingPeriod,
      "deductionType": payload.deductionType,
      "gwEvidenceType": payload.gwEvidenceType,
      "id": payload.id,
      "isDeclareBusinessTax": payload.isDeclareBusinessTax,
      "status": "processing"
    };
  }
}

export { recognizeAsync, getIdentifyResult };
