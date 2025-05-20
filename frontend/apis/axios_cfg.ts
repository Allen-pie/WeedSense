import axios from "axios";
import api from './api'

const axios_cfg = axios.create({
  baseURL: 'http://localhost:5000',  // atau api.BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axios_cfg;
