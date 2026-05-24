import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import { saveSession } from '../../auth'
import './LoginPage.css'

const ERROR_MESSAGES = {
  spotify_auth_failed: 'Spotify authentication failed. Please try again.',
  login_failed: 'Login failed. Please try again.',
}

const LoginPage = ({ location, history }) => {
  const params = new URLSearchParams(location?.search)
  const errorParam = params.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(errorParam ? ERROR_MESSAGES[errorParam] ?? 'An unexpected error occurred' : null)

  const submitHandler = () => {
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/login`, { email, password })
      .then((res) => {
        saveSession(res.data.token, res.data.userType)
        const redirect = params.get('redirect')
        history.push(redirect ?? (res.data.userType === 'host' ? '/host' : '/invitee'))
      })
      .catch((err) => {
        setMessage(err.response?.data?.errorMessage ?? 'An unexpected error occurred')
      })
  }

  return (
    <div className="LoginPage">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <SpotifyButton clicked={submitHandler}>Login</SpotifyButton>
      <div className="divider">or</div>
      <a href={`${process.env.REACT_APP_API_BASE_URL}/users/login/spotify`}>
        <SpotifyButton>Login with Spotify</SpotifyButton>
      </a>
      {message && <p className="error">{message}</p>}
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  )
}

export default LoginPage
