// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from "axios"
import { toast } from "react-toastify";
import { handleLogoutAPI, handleRefreshTokenAPI } from "~/apis";

// Khởi tạo đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.

const authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request là 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// withCredentials: sẽ cho phép axios tự động đính kèm và gửi cookie trong mỗi request lên BE
// phục vụ trường hợp nếu chúng ta sử dụng JWT tokens (refresh và access) theo cơ chế httpOnly Cookie
authorizedAxiosInstance.defaults.withCredentials = true

/**
 * Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request và Response)
 * https://axios-http.com/docs/interceptors
 */

// Add a request interceptor: can thiệp vào giữa những request API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Lấy accessToken từ localstorage và đính kèm vào header
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    // Cần thêm "Bearer " vì chúng ta nên tuân thủ theo tiêu chuẩn OAuth 2.0 trong việc xác định loại token đang sử dụng
    // Bearer là định nghĩa loại token dành cho việc xác thực và ủy quyền, tham khảo các loại token khác như: Basic token, Digest token, OAuth token, ...vv
    config.headers.Authorization = `Bearer ${accessToken}`
  }
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
}, async (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error

  // Khu vực xử lý refresh token tự động ở đây
  // Nếu mã lỗi trả về từ API là 401 thì gọi API logout luôn
  if (error.response?.status === 401) {
    handleLogoutAPI().then(() => {
      location.href = '/login'
    })
  }
  // Nếu nhận 410 - GONE thì cần refresh lại token và tạo mới access token
  const originalRequest = error.config;
  console.log('Original request: ', originalRequest)
  if (error.response?.status === 410 && !originalRequest._retry) {
    // Gán thêm một giá trị _retry luôn = true trong khoảng thời gian chờ, để việc refresh token này chỉ luôn gọi 1 lần tại 1 thời điểm
    originalRequest._retry = true;

    // Lấy refreshToken từ localstorage cho trường hợp cần refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    return handleRefreshTokenAPI(refreshToken).then((res) => {
      const { accessToken } = res.data;
      console.log('New access token: ', accessToken)
      localStorage.setItem('accessToken', accessToken);
      authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
      
      // Trong trường hợp sử dụng cookie thì không cần phải set thêm header Authorization ở đây
      return authorizedAxiosInstance(originalRequest);
    })
    .catch((_error) => {
      // Bất kỳ lỗi nào về refresh token cũng cần logout người dùng ra khỏi hệ thống
      handleLogoutAPI().then(() => {
        location.href = '/login'
      });
      return Promise.reject(_error);
    });
  }
  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây
  // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh lại token
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }
  return Promise.reject(error);
});

export default authorizedAxiosInstance
