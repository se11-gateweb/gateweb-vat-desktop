import {gwAxios} from "../Actions/axios";


/**
 *
 * @returns {Promise<{data: {}, success: boolean, error: {code: string, message: string}}>}
 * @constructor
 */
const getServerHistoryAssignLog = async (version) => {
  let result = {
    success: false,
    data: {
      version: version,
      historyAssignLog: {}
    },
    error: {
      code: '',
      message: ''
    }
  }
  try {
    const response = await gwAxios.get('/vat/api/v1/assign/year');
    result.success = true
    result.data.historyAssignLog = response.data
  } catch (error) {
    result.success = false
    result.error.message = 'failed'
    result.error.code = 'failed'
  }
  return result;
};


const getServerHistoryAssignLogVersion = async () => {
  console.log('getServerHistoryAssign')
  const result = {
    success: false,
    data: {},
    error: {
      code: '',
      message: ''
    }
  }
  try {
    const response = await gwAxios.get('/vat/api/v1/assign/year/version');
    console.log('getHistory', response)
    result.success = true
    result.data = response.data
  } catch (e) {
    result.success = false
    result.error.message = e.message
    result.error.code = 'failed'
  }
  return result;
};

/**
 *
 * @param localVersion
 * @returns {Promise<{localVersion, remoteVersion: (*|string), isMatch: boolean}|boolean>}
 */
const isMatchLocalVersion = async (localVersion=true) => {
  if (!localVersion) {
    return false
  }
  const versionResult = await getServerHistoryAssignLogVersion();
  const remoteVersion = (versionResult.success) ? versionResult.data.version : ''
  return {isMatch: localVersion === remoteVersion, localVersion, remoteVersion}
}

export {getServerHistoryAssignLog, getServerHistoryAssignLogVersion, isMatchLocalVersion}