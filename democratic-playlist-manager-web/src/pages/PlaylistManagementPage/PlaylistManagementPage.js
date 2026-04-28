import { useState, useEffect } from 'react'
import axios from '../../axios'
import { clearSession } from '../../auth'

import SelectionList from '../../UI/SelectionList/SelectionList'
import SpotifyButton from "../../UI/SpotifyButton/SpotifyButton";

const PlaylistManagementPage = (props) => {
  const [collaborativePlaylists, setCollaborativePlaylists] = useState([])
  const [inviteLink, setInviteLink] = useState(null)

  const defaultImage = ''

  const logoutHandler = () => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/logout`)
      .finally(() => {
        clearSession()
        props.history.push('/login')
      })
  }

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/me/playlist?mine=true`)
      .then((res) => {
        const playlists = res.data.playlists.map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
          img: playlist.images?.[0]?.url ?? defaultImage,
          selected: false,
        }))
        setCollaborativePlaylists(playlists)
      })
      .catch((err) => console.error(err))
  }, [])

  const playlistClickedHandler = (playlistId) => {
    const playlists = [...collaborativePlaylists]
    const playlist = playlists.find((p) => p.id === playlistId)
    const request = playlist.selected
      ? axios.delete(`${process.env.REACT_APP_API_BASE_URL}/playlist/${playlistId}`)
      : axios.post(`${process.env.REACT_APP_API_BASE_URL}/playlist/${playlistId}`)

    request
      .then(() => {
        playlist.selected = !playlist.selected
        setCollaborativePlaylists([...playlists])
        setInviteLink(null)
      })
      .catch((err) => console.error('Something went wrong', err))
  }

  const shareClickHandler = (playlistId, playlistName) => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/invitations`, { playlistId, playlistName })
      .then((res) => setInviteLink(res.data.inviteLink))
      .catch((err) => console.error('Error generating invite link', err))
  }

  const forceReorderClickHandler = () => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/trigger-reorder`)
      .catch((err) => console.error('Error reordering', err))
  }

  const selectedPlaylist = collaborativePlaylists.find((p) => p.selected)

  return (
    <div>
      <SpotifyButton clicked={forceReorderClickHandler}>Reordenar</SpotifyButton>
      <SpotifyButton clicked={logoutHandler}>Logout</SpotifyButton>
      {selectedPlaylist && (
        <div>
          <SpotifyButton clicked={() => shareClickHandler(selectedPlaylist.id, selectedPlaylist.name)}>Share</SpotifyButton>
          {inviteLink && <p>Invite link: <a href={inviteLink}>{inviteLink}</a></p>}
        </div>
      )}
      <SelectionList items={collaborativePlaylists} playlistClicked={playlistClickedHandler} />
    </div>
  )
}

export default PlaylistManagementPage
