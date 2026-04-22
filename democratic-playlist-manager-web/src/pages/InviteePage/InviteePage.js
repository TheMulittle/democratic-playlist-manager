import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import { clearSession } from '../../auth'

const InviteePage = ({ history }) => {
  const logoutHandler = () => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/logout`)
      .finally(() => {
        clearSession()
        history.push('/login')
      })
  }

  return (
    <div>
      <h2>Invitee Page</h2>
      <SpotifyButton clicked={logoutHandler}>Logout</SpotifyButton>
    </div>
  )
}

export default InviteePage
