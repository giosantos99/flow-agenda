import { defineBoot } from '#q-app'
import axios from 'axios'

// Create an isolated Axios instance with your base URL configuration
const api = axios.create({ baseURL: 'http://localhost:3000/' })

export default defineBoot(({ app }) => {

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
