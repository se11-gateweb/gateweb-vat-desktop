import axios from 'axios';

const GW_ROOT_URL = 'http://34.80.79.216:8080'; // uat //34.80.79.216(dev)
// const axios = require('axios').default
const gwAxios = axios.create({
  baseURL: GW_ROOT_URL,
  headers: {'Content-Type': 'application/json'},
});

const gwVatAxios = axios.create({
  baseURL: 'http://34.80.79.216:8082',
  headers: {'Content-Type': 'application/json'},
})

export {gwAxios, gwVatAxios};
