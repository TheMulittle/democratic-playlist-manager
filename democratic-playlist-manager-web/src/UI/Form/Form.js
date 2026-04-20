import React, { useState } from 'react'
import axios from '../../axios'

import './Form.css'
import SpotifyButton from '../SpotifyButton/SpotifyButton'

const Form = (props) => {
  const [playlistId, setPlaylistId] = useState('')
  const [message, setMessage] = useState(null)

  const playlistChangedHandler = (event) => {
    setPlaylistId(event.target.value)
  }

  const playlistClickedHandler = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE_URL}/playlist`,
        { playlistId: playlistId },
        { withCredentials: true },
      )
      .then((response) => setMessage(response.data.message))
      .catch((err) => setMessage(err.response.data.message))
  }

  const messageDiv = message ? <div>{message}</div> : null

  return (
    <div className="Form">
      <input
        onChange={playlistChangedHandler}
        value={playlistId}
        id="playlistId"
        placeholder="Spotify Playlist Id"
      />
      <SpotifyButton clicked={playlistClickedHandler}>Add playlist to be managed</SpotifyButton>
      {messageDiv}
    </div>
  )
}

export default Form
