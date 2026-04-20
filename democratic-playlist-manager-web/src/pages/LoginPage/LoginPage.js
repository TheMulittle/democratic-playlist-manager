import React from 'react'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'

const loginPage = (props) => (
  <React.Fragment>
    <p>You are not logged in. Please login with one of the below services</p>
    {/* TODO: make the baseUrl configurable*/}
    <a href={`${process.env.REACT_APP_API_BASE_URL}/secret-login`}>
      <SpotifyButton> Login with Spotify </SpotifyButton>
    </a>
  </React.Fragment>
)

export default loginPage
