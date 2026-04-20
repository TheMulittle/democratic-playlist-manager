import { useState, useEffect } from 'react'
import axios from '../../axios'

import SelectionList from '../../UI/SelectionList/SelectionList'
import SpotifyButton from "../../UI/SpotifyButton/SpotifyButton";

const PlaylistManagementPage = (props) => {
  const [collaborativePlaylists, setCollaborativePlaylists] = useState([])

  const defaultImage = ''

  useEffect(() => {
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/me/playlist?mine=true`, {
        withCredentials: true,
      }),
    ])
      .then(([myPlaylistsResponse]) => {
        const playlists = myPlaylistsResponse.data.playlists.map((playlist) => {
          return {
            id: playlist.id,
            name: playlist.name,
            img: playlist.images[0]?.url ?? defaultImage,
            selected: false,
          }
        })
        setCollaborativePlaylists(playlists)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  const playlistClickedHandler = (playlistId) => {
    const playlists = [...collaborativePlaylists]
    const playlist = playlists.find((playlist) => playlist.id === playlistId)
    let promiseReturn
    if(playlist.selected) {
      promiseReturn = axios
        .delete(
          `${process.env.REACT_APP_API_BASE_URL}/playlist/${playlistId}`
        )
    } else {
      promiseReturn = axios
        .post(
          `${process.env.REACT_APP_API_BASE_URL}/playlist/${playlistId}`,
          { withCredentials: true },
        )
    }
    promiseReturn.then((response) => {
        playlist.selected = !playlist.selected
        setCollaborativePlaylists(() => playlists)
      })
      .catch((err) => console.error('Something went wrong'))
  }

  const forceReorderClickHandler = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE_URL}/trigger-reorder`,
          {withCredentials: true}
      ).catch((err) => console.error('Error reordering' + err))
  }

  return (
    <div>
      <SpotifyButton children={'Reordenar'} clicked={forceReorderClickHandler}/>
      <SelectionList items={collaborativePlaylists} playlistClicked={playlistClickedHandler} />
    </div>
  )
}

export default PlaylistManagementPage
