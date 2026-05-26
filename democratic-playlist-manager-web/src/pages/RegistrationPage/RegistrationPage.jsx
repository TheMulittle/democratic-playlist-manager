import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../axios'
import SpotifyButton from '../../UI/SpotifyButton/SpotifyButton'
import './RegistrationPage.css'

const ERROR_MESSAGES = {
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
      .post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, { email, password })
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
      <a href={`${import.meta.env.VITE_API_BASE_URL}/users/auth/spotify`} style={{ width: '100%' }}>
        <SpotifyButton>Continue with Spotify</SpotifyButton>
      </a>
      <div className="divider">or</div>
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
        onKeyDown={(e) => e.key === 'Enter' && submitHandler()}
      />
      <SpotifyButton clicked={submitHandler}>Register</SpotifyButton>
      {message && <p className={success ? 'success' : 'error'}>{message}</p>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  )
}

export default RegistrationPage
