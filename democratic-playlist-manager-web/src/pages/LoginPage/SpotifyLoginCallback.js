import { useEffect } from 'react'
import { saveSession } from '../../auth'

const SpotifyLoginCallback = ({ location, history }) => {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const userType = params.get('userType')

    if (token && userType) {
      saveSession(token, userType)
      history.replace(userType === 'host' ? '/host' : '/invitee')
    } else {
      history.replace('/login?error=login_failed')
    }
  }, [location.search, history])

  return null
}

export default SpotifyLoginCallback
