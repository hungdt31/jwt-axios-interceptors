import authorizedAxiosInstance from "~/utils/authorizedAxios";
import { API_ROOT } from "~/utils/constants";

export const handleLogoutAPI = async () => {
  // Trường hợp 1: DÙng localStorage -> chỉ cần xóa thông tin user trong localstorage phía Front-end
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  // Trường hợp 2: Dùng HttpOnly Cookie -> cần gửi request lên server để xóa cookie
  return await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`);
}

export const handleRefreshTokenAPI = async (refreshToken) => {
  return await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, { refreshToken });
}