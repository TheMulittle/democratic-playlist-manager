import { Component } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import './App.css'
import Layout from './UI/Layout/Layout'
import LoginPage from './pages/LoginPage/LoginPage'
import SpotifyLoginCallback from './pages/LoginPage/SpotifyLoginCallback'
import RegistrationPage from './pages/RegistrationPage/RegistrationPage'
import SpotifyRegistrationCallback from './pages/RegistrationPage/SpotifyRegistrationCallback'
import HostPage from './pages/PlaylistManagementPage/PlaylistManagementPage'
import InviteePage from './pages/InviteePage/InviteePage'
import InvitePage from './pages/InvitePage/InvitePage'
import { isAuthenticated } from './auth'

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated() ? <Component {...props} /> : <Redirect to="/login" />
    }
  />
)

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Layout>
            <Switch>
              <Route path="/login/spotify/callback" component={SpotifyLoginCallback} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register/spotify/callback" component={SpotifyRegistrationCallback} />
              <Route path="/register" component={RegistrationPage} />
              <ProtectedRoute path="/host" component={HostPage} />
              <ProtectedRoute path="/invitee" component={InviteePage} />
              <Route path="/invite/:playlistId/:inviteToken" component={InvitePage} />
              <Redirect to="/login" />
            </Switch>
          </Layout>
        </BrowserRouter>
      </div>
    )
  }
}

export default App
