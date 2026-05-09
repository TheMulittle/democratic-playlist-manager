import { useState, useEffect } from 'react'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import PlaylistRow from '../../UI/PlaylistRow/PlaylistRow'
import TrackList from '../../UI/TrackList/TrackList'
import { clearSession } from '../../auth'
import './InviteePage.css'

const InviteePage = ({ history, location }) => {
  const [playlists, setPlaylists] = useState([])
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState(null)

  const params = new URLSearchParams(location.search)
  const playlistId = params.get('playlistId')
  const inviteToken = params.get('inviteToken')

  useEffect(() => {
    const acceptAndLoad = async () => {
      if (playlistId && inviteToken) {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/invitations/${playlistId}/${inviteToken}/accept`)
          .catch(() => {})
      }
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/me/invitee-playlists`)
        .then((res) => {
          setPlaylists(res.data.playlists.map((p) => ({ id: p.playlistId, name: p.playlistName, selected: false })))
        })
        .catch(() => setError('Failed to load playlists.'))
    }
    acceptAndLoad()
  }, [playlistId, inviteToken])

  const playlistClickedHandler = (clickedId) => {
    const updated = playlists.map((p) => ({ ...p, selected: p.id === clickedId ? !p.selected : false }))
    setPlaylists(updated)
    setTracks([])

    const isNowSelected = updated.find((p) => p.id === clickedId)?.selected
    if (isNowSelected) {
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/me/invitee-playlists/${clickedId}/tracks`)
        .then((res) => setTracks(res.data.tracks))
        .catch(() => setError('Failed to load tracks.'))
    }
  }

  const logoutHandler = () => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/logout`)
      .finally(() => {
        clearSession()
        history.push('/login')
      })
  }

  const selectedPlaylist = playlists.find((p) => p.selected)

  return (
    <div className="InviteePage">
      <SpotifyButton clicked={logoutHandler}>Logout</SpotifyButton>
      {error && <p className="error">{error}</p>}
      {playlists.length === 0
        ? <p className="empty-message">No playlists at the moment.</p>
        : (
          <div className="InviteeContent">
            <div className="playlist-panel">
              {playlists.map((p) => (
                <PlaylistRow
                  key={p.id}
                  name={p.name}
                  selected={p.selected}
                  onClick={() => playlistClickedHandler(p.id)}
                />
              ))}
            </div>
            {selectedPlaylist && (
              <div className="track-panel">
                <h3>{selectedPlaylist.name}</h3>
                {tracks.length > 0
                  ? <TrackList tracks={tracks} />
                  : <p style={{ color: '#b3b3b3' }}>Loading tracks...</p>
                }
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}

export default InviteePage
