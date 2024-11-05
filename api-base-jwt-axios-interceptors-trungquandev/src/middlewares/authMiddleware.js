// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { JwtProvider } from "~/providers/JwtProvider";
import { StatusCodes } from "http-status-codes"
import { ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from "~/providers/JwtProvider";

// Middleware này sẽ đảm nhiệm việc quan trọng: lấy và xác thực JWT accessToken nhận được từ phía FE có hợp lệ hay không
// Chỉ một trong hai cách lấy token: cookie và localstorage
const isAuthorized = async (req, res, next) => {
  // Cách 1: Lấy accessToken trong request cookies phía client - withCredentials trong file authorizeAxios và credentials trong CORS
  const accessTokenFromCookie = req.cookies?.accessToken
  console.log('accessTokenFromCookie: ', accessTokenFromCookie);
  console.log('---');
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized"
    });
    return;
  }
  // Cách 2: Lấy accessToken trong trường hợp phía FE lưu localstorage và gửi lên thông qua header authorization
  const accessTokenFromHeader = req.headers.authorization
  console.log('accessTokenFromHeader: ', accessTokenFromHeader);
  console.log('---');
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized"
    });
    return;
  }
  try {
    // Bước 1: giải mã xem có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      // accessTokenFromCookie,
      accessTokenFromHeader.substring('Bearer '.length),
      ACCESS_TOKEN_SECRET_SIGNATURE
    );
    console.log(accessTokenDecoded)
    // Bước 2: Nếu như token hợp lệ thì sẽ cần phải lưu thông tin giải mã được vào req.jwtDecoded, để sử dụng cho các tầng cần xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho pháp request đi tiếp
    next();
  } catch (error) {
    console.log('Error from authMiddleware: ', error);

    // Trường hợp lỗi 01: Nếu accessToken bị hết hạn (expired) thì cần trả về mã lối GONE - 410 cho phía FE
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({
        message: 'Need to refresh token'
      })
      return;
    }

    // Trường hợp lỗi 02: Nếu accessToken không hợp lệ ngoài hết hạn thì trả về mã 401 cho phía FE xử lý logout hoặc hoặc gọi API logout tùy trường hợp
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized: Please login"
    });
  }
}

export const authMiddleware = {
  isAuthorized
}