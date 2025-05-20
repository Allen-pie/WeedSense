import axios from "axios";
import api from './api'

const axios_cfg = axios.create({
  baseURL: api.BASE_API_URL, // atau http://localhost:5000
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axios_cfg;
