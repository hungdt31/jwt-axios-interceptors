// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from "axios"
import { toast } from "react-toastify";

// Khởi tạo đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.

const authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request là 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// withCredentials: sẽ cho phép axios tự động đính kèm và gửi cookie trong mỗi request lên BE
// phục vụ trường hợp nếu chúng ta sử dụng JWT tokens (refresh và access) theo cơ chế httpOnly Cookie
// authorizedAxiosInstance.defaults.withCredentials = true

/**
 * Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request và Response)
 * https://axios-http.com/docs/interceptors
 */

// Add a request interceptor: can thiệp vào giữa những request API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Do something before request is sent
  return config;
}, (error) => {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor: Can thiệp vào những response nhận về từ API
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây
  // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh lại token
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }
  return Promise.reject(error);
});

export default authorizedAxiosInstance
