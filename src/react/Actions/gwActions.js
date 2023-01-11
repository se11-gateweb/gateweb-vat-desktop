import { gwAxios } from "./axios";
import actionTypes from "./actionTypes";
import { userLogin } from "../usecases/userLogin";
import { isMatchLocalVersion, getServerHistoryAssignLog } from "../usecases/getHistoryAssignLog";
import axios from "axios";


export async function loginUser(dispatch, loginPayload) {
  dispatch({ type: actionTypes.REQUEST_LOGIN });
  const loginResult = await userLogin(loginPayload);
  console.log("loginUser", loginResult);
  if (loginResult.success) {
    dispatch({ type: "LOGIN_SUCCESS", payload: loginResult.data });
    localStorage.setItem("currentUser", JSON.stringify(loginResult.data));
    return loginResult;
  } else {
    dispatch({ type: actionTypes.LOGIN_ERROR, error: loginResult.error.message });
    return loginResult;
  }

}

export async function logout(dispatch) {
  dispatch({ type: "LOGOUT" });
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
}

export const getHistoryAssignLog = async (localVersion) => {
  let result = {
    success: false,
    data: {},
    error: {
      code: "",
      message: ""
    }
  };
  const compareResult = await isMatchLocalVersion(localVersion);
  if (!compareResult.isMatch) {
    console.log("notmatch");
    result = await getServerHistoryAssignLog(compareResult.remoteVersion);
  }
  return result;
};

export async function uploadToGw(payload, ownerId, token) {
  console.log(payload, ownerId, token);
  const url = "/vat/api/v1/evidence/input";
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      ownerId: ownerId,
      Authorization: "Bearer " + token
    }
  };
  const resultList = [];
  for (let i = 0; i < payload.length; i++) {
    const id = payload[i].id;
    try {
      const req = payload[i].json;
      const bodyFormData = new FormData();
      bodyFormData.append("json", JSON.stringify(req));
      bodyFormData.append("file", payload[i].image);
      const result = await gwAxios.post(url, bodyFormData, config);
      resultList.push({
        id: id,
        status: true,
        errorMsg: ""
      });
    } catch (error) {
      let errorMsg = "";
      if (error.response === undefined) {
        errorMsg = "網路錯誤";
      } else {
        errorMsg = error.response.data.errorMsg;
      }
      resultList.push({
        id: id,
        status: false,
        errorMsg
      });
    }
  }
  return resultList;
}

export const getAllClientList = async (dispatch, username, taxId, token) => {
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      "accountingfirmTaxId": taxId,
      "Authorization": `Bearer ${token}`
    }
  };

  const result = await gwAxios.get("/vat/api/v1/businessEntity", requestOptions).catch((error) => {
    // TODO Error handling, logout or re-login?
    console.log("getAllClientList error", JSON.stringify(error));
    dispatch({ type: actionTypes.GET_CLIENT_LIST_FAILED, payload: error });
  });
  console.log("getAllClientList result", result);
  if (result) {
    dispatch({ type: actionTypes.GET_CLIENT_LIST_SUCCESS, payload: result.data });
  }
};
