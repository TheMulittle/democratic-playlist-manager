import { useState, useEffect, useRef } from 'react'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import PlaylistRow from '../../UI/PlaylistRow/PlaylistRow'
import TrackList from '../../UI/TrackList/TrackList'
import { clearSession, getToken } from '../../auth'
import './InviteePage.css'

const InviteePage = ({ history, location }) => {
  const [playlists, setPlaylists] = useState([])
  const [tracks, setTracks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const wsRef = useRef(null)

  const params = new URLSearchParams(location.search)
  const playlistId = params.get('playlistId')
  const inviteToken = params.get('inviteToken')

  useEffect(() => {
    const acceptAndLoad = async () => {
      if (playlistId && inviteToken) {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/invitations/${playlistId}/${inviteToken}/accept`)
          .catch(() => {})
      }
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/me/invitee-playlists`)
        .then((res) => setPlaylists(res.data.playlists.map((p) => ({ id: p.playlistId, name: p.playlistName, selected: false }))))
        .catch(() => setError('Failed to load playlists.'))
    }
    acceptAndLoad()
    return () => { if (wsRef.current) wsRef.current.close() }
  }, [playlistId, inviteToken])

  const connectWebSocket = (pid) => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    const token = getToken()
    const wsBase = import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsBase}/me/invitee-playlists/${pid}/live?token=${token}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'tracks_updated') {
        setTracks(data.tracks)
      }
    }
    ws.onclose = (event) => {
      if (event.code !== 1000 && wsRef.current === ws) {
        setTimeout(() => connectWebSocket(pid), 3000)
      }
    }
    ws.onerror = () => {}
    wsRef.current = ws
  }

  const playlistClickedHandler = (clickedId) => {
    const updated = playlists.map((p) => ({ ...p, selected: p.id === clickedId ? !p.selected : false }))
    setPlaylists(updated)
    setTracks([])
    setSearchResults([])
    setSearchQuery('')

    const isNowSelected = updated.find((p) => p.id === clickedId)?.selected
    if (isNowSelected) {
      loadTracks(clickedId)
      connectWebSocket(clickedId)
    } else {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  }

  const loadTracks = (pid) => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/me/invitee-playlists/${pid}/tracks`)
      .then((res) => setTracks(res.data.tracks))
      .catch(() => setError('Failed to load tracks.'))
  }

  const searchHandler = () => {
    if (!searchQuery.trim()) return
    const pid = playlists.find((p) => p.selected)?.id
    if (!pid) return
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/me/invitee-playlists/${pid}/search?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => setSearchResults(res.data.tracks))
      .catch(() => setError('Search failed.'))
  }

  const addTrackHandler = (trackUri) => {
    const pid = playlists.find((p) => p.selected)?.id
    if (!pid) return
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/me/invitee-playlists/${pid}/tracks`, { trackUri })
      .then(() => {
        setSearchResults([])
        setSearchQuery('')
        loadTracks(pid)
      })
      .catch(() => setError('Failed to add track.'))
  }

  const logoutHandler = () => {
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/logout`)
      .finally(() => { clearSession(); history.push('/login') })
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
                <PlaylistRow key={p.id} name={p.name} selected={p.selected} onClick={() => playlistClickedHandler(p.id)} />
              ))}
            </div>
            {selectedPlaylist && (
              <div className="track-panel">
                <h3>{selectedPlaylist.name}</h3>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search for a song..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchHandler()}
                  />
                  <button onClick={searchHandler}>Search</button>
                </div>
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((t) => (
                      <div key={t.id} className="search-result-row">
                        <div className="search-result-info">
                          <span className="TrackName">{t.name}</span>
                          <span className="TrackArtists">{t.artists}</span>
                        </div>
                        <button className="add-btn" onClick={() => addTrackHandler(t.uri)}>+</button>
                      </div>
                    ))}
                  </div>
                )}
                {tracks.length > 0 && <TrackList tracks={tracks} />}
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}

export default InviteePage
