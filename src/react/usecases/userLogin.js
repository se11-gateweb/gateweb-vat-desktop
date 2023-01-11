import {gwAxios} from "../Actions/axios";

/**
 *
 * @param loginPayload {taxId: string, username: string, password: string}
 * @returns {Promise<{data: {}, success: boolean, error: {code: string, message: string}}>}
 */
const userLogin = async (loginPayload) => {
    let loginResult = {
        success: false,
        data: {},
        error: {
            code: '',
            message: ''
        }
    }
    try {

        const response = await gwAxios.post('/login', JSON.stringify(loginPayload)); // await fetch(`${ROOT_URL}/auth/login`, requestOptions);
        if (response.status !== 200) {
            loginResult.success = false
            loginResult.error.code = response.data.errorCode
            loginResult.error.message = response.data.errorMsg
        } else {
            loginResult.success = true;
            loginResult.data = {
                ...response.data,
                taxId: loginPayload.taxId,
                username: loginPayload.username,
            };
            delete loginResult.data['result']
        }
    } catch (error) {
        loginResult.success = false
        loginResult.error.code = 'SYSTEM_ERROR'
        loginResult.error.message = error.response.data.errorMsg
    }
    return loginResult;
}

const getUserInfo = async (accountingFirmTaxId, token) => {
    const headers = {
        'Content-type': 'application/json',
        'accountingFirmTaxId': accountingFirmTaxId,
        'Authorization': `Bearer ${token}`
    }
    const response = await gwAxios.get('/login', {headers});

}

const refreshToken = async (token) => {
    const headers = {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    const response = await gwAxios.post('/refresh/token', {}, {headers});
    console.log(response)
}

export {userLogin, getUserInfo, refreshToken}