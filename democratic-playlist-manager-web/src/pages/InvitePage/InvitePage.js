import { useEffect } from 'react'
import { isAuthenticated } from '../../auth'

const InvitePage = ({ match, history }) => {
  const { playlistId, inviteToken } = match.params

  useEffect(() => {
    if (isAuthenticated()) {
      history.replace(`/invitee?playlistId=${playlistId}&inviteToken=${inviteToken}`)
    } else {
      history.replace(`/login?redirect=/invite/${playlistId}/${inviteToken}`)
    }
  }, [history, playlistId, inviteToken])

  return null
}

export default InvitePage
