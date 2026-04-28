import { useState, useEffect } from 'react'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import { clearSession } from '../../auth'

const InviteePage = ({ history, location }) => {
  const [playlistName, setPlaylistName] = useState(null)
  const [error, setError] = useState(null)

  const params = new URLSearchParams(location.search)
  const playlistId = params.get('playlistId')
  const inviteToken = params.get('inviteToken')

  useEffect(() => {
    if (!playlistId || !inviteToken) return
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/invitations/${playlistId}/${inviteToken}/accept`)
      .then(() => axios.get(`${process.env.REACT_APP_API_BASE_URL}/invitations/${playlistId}/${inviteToken}`))
      .then((res) => setPlaylistName(res.data.playlistName))
      .catch(() => setError('Invalid or expired invitation.'))
  }, [playlistId, inviteToken])

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
      {playlistName && <p>Playlist: <strong>{playlistName}</strong></p>}
      {error && <p>{error}</p>}
      <SpotifyButton clicked={logoutHandler}>Logout</SpotifyButton>
    </div>
  )
}

export default InviteePage
