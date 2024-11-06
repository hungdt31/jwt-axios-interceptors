// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider } from '~/providers/JwtProvider'
import { ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'
/**
 * Mock nhanh thông tin user thay vì phải tạo Database rồi query.
 * Nếu muốn học kỹ và chuẩn chỉnh đầy đủ hơn thì xem Playlist này nhé:
 * https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V
 */
const MOCK_DATABASE = {
  USER: {
    ID: 'trungquandev-sample-id-12345678',
    EMAIL: 'trungquandev.official@gmail.com',
    PASSWORD: 'trungquandev@123'
  }
}

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 * Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
 * Xem thêm về biến môi trường: https://youtu.be/Vgr3MWb7aOw
 */


const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Your email or password is incorrect!' })
      return;
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    // Tạo thông tin payload để đính kèm trong JWT Token: bao gồm _id và email của user
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    // Tạo ra hai loại token, accessToken, và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '5s',
      // '1h'
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '15s',
      // '7d'
    );

    // /**
    //  * Xử lý trường hợp trả về http only cookie cho phía client
    //  * Về cái maxAge và thư viện ms
    //  * Đối với maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 2 tuần tùy dự án. Lưu ý thời gian sống của cookie khác với thời gian sống của token.
    //  */

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
  
    res.status(StatusCodes.OK).json({
      ... userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error
    })
  }
}

const logout = async (req, res) => {
  try {
    // Do something
    // Xóa cookie trong trường hợp logout
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // Do something
    // Cách 1: Lấy refreshToken từ req.cookies
    const refreshTokenFromCookie = req.cookies?.refreshToken
    // Cách 2: Từ localStorage gửi lên body
    const refreshTokenFromBody = req.body?.refreshToken
    // verify refreshToken xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      refreshTokenFromBody || refreshTokenFromCookie,
      REFRESH_TOKEN_SECRET_SIGNATURE
    );
    console.log('refreshTokenDecoded: ', refreshTokenDecoded);
    // Lấy thông tin payload từ refreshToken

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      {
        id: refreshTokenDecoded.id,
        email: refreshTokenDecoded.email
      },
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '5s'
    );

    // Res lại cookie accessToken mới cho trường hợp sử dụng cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    });
    
    // Trả về cho phía client một accessToken mới
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    console.log('Refresh token is not valid!')
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Refresh token failed!',
    })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
