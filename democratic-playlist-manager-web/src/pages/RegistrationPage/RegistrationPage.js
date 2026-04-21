import React, { useState } from 'react'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import './RegistrationPage.css'

const ERROR_MESSAGES = {
  already_registered: 'This Spotify account is already registered.',
  spotify_auth_failed: 'Spotify authentication failed. Please try again.',
  registration_failed: 'Registration failed. Please try again.',
}

const RegistrationPage = ({ location }) => {
  const params = new URLSearchParams(location?.search)
  const errorParam = params.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(errorParam ? ERROR_MESSAGES[errorParam] ?? 'An unexpected error occurred' : null)
  const [success, setSuccess] = useState(false)

  const submitHandler = () => {
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/register`, { email, password })
      .then((res) => {
        setSuccess(true)
        setMessage(`Registered successfully as ${res.data.email}`)
      })
      .catch((err) => {
        setSuccess(false)
        setMessage(err.response?.data?.errorMessage ?? 'An unexpected error occurred')
      })
  }

  return (
    <div className="RegistrationPage">
      <h2>Create an account</h2>
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
      <SpotifyButton clicked={submitHandler}>Register</SpotifyButton>
      <div className="divider">or</div>
      <a href={`${process.env.REACT_APP_API_BASE_URL}/users/register/spotify`}>
        <SpotifyButton>Register with Spotify</SpotifyButton>
      </a>
      {message && <p className={success ? 'success' : 'error'}>{message}</p>}
    </div>
  )
}

export default RegistrationPage
