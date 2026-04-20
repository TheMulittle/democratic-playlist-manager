import React from 'react'
import { Link } from 'react-router-dom'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'

const loginPage = (props) => (
  <React.Fragment>
    <p>You are not logged in. Please login with one of the below services</p>
    <a href={`${process.env.REACT_APP_API_BASE_URL}/secret-login`}>
      <SpotifyButton> Login with Spotify </SpotifyButton>
    </a>
    <p>Don't have an account? <Link to="/register">Register here</Link></p>
  </React.Fragment>
)

export default loginPage
