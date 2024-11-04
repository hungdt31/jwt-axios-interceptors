// Author: TrungQuanDev: https://youtube.com/@trungquandev
import JWT from "jsonwebtoken";

/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: chữ ký bí mật (dạng một chuỗi string ngẫu nhiên) trên docs thì để tên là privateKey tùy đều được
 * tokenLife: thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign() của thư viện Jwt - Thuật toán mặc định là HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: "HS256", expiresIn: tokenLife});
  } catch (error) {
    throw new ErrorEvent(error);
  }
};

const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của thư viện Jwt
    return JWT.verify(token, secretSignature)
  } catch(error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken
}
