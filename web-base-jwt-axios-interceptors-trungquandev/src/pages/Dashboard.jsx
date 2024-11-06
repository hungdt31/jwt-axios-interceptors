// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_ROOT } from '~/utils/constants'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { handleLogoutAPI } from '~/apis'

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
        console.log('Data from API: ', res.data)
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        console.log('Data from Localstorage: ', userInfo)
        setUser(res.data)
      } catch (error) {
        toast.error(error.response?.data?.message || error?.message)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await handleLogoutAPI();

    // cuối cùng điều hướng đến trang login sau khi logout thành công
    navigate("/login");
  }
  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      maxWidth: '1120px',
      marginTop: '1em',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em'
    }}>
      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>
      <Button variant="contained" color="primary" sx={{ my: 2 }} onClick={handleLogout}>Log out</Button>
      <Divider sx={{ my: 2 }} />
    </Box>
  )
}

export default Dashboard
