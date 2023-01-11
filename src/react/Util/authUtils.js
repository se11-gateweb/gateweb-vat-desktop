import moment from "moment/moment";
import jwt_decode from 'jwt-decode'
export const isTokenExpired = (token) => {
  const tokenExpDate = getTokenExpDate(token)
  const now = moment().utcOffset(8)
  const dateDiff = now.diff(tokenExpDate.expDate)
  return dateDiff >=0
}

export const getTokenExpDate = (token) => {
  const result = jwt_decode(token)
  const expDate = moment(new Date(result.exp * 1000)).utcOffset(8)
  return {
    expDate,
    prettyFormat: expDate.format('YYYY-MM-DD HH:mm:ss')
  }
}

export const getTokenInfo = (token) => {
  if (!token){
    return {isExpired: true}
  }
  const result = jwt_decode(token)
  const expDate = moment(new Date(result.exp * 1000)).utcOffset(8)
  const now = moment().utcOffset(8)
  const dateDiff = now.diff(expDate)
  const remaining = Math.round(moment.duration((dateDiff * -1)).asSeconds())
  return {
    ...result,
    exp_pretty: expDate.format('YYYY-MM-DD HH:mm:ss'),
    isExpired: (dateDiff >=0),
    timeToExpire: remaining
  }
}