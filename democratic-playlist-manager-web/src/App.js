import { Component } from 'react'

import './App.css'
import Layout from './UI/Layout/Layout'
import LoginPage from './pages/LoginPage/LoginPage'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import PlaylistManagementPage from './pages/PlaylistManagementPage/PlaylistManagementPage'

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Layout>
            <Switch>
              <Route from="/playlist" component={PlaylistManagementPage} />
              <Route from="/login" component={LoginPage} />
              <Redirect to="/login" />
            </Switch>
          </Layout>
        </BrowserRouter>
      </div>
    )
  }
}

export default App
