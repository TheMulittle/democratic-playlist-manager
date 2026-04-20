import './SpotifyButton.css'

const spotifyLoginButton = (props) => {
  return (
    <div className="SpotifyButton" onClick={props.clicked}>
      {props.children}
    </div>
  )
}

export default spotifyLoginButton
