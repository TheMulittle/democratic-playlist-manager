import { useEffect } from 'react'
import { saveSession } from '../../auth'

const SpotifyRegistrationCallback = ({ location, history }) => {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const userType = params.get('userType')

    if (token && userType) {
      saveSession(token, userType)
      history.replace(userType === 'host' ? '/host' : '/invitee')
    } else {
      history.replace('/register?error=registration_failed')
    }
  }, [])

  return null
}

export default SpotifyRegistrationCallback
