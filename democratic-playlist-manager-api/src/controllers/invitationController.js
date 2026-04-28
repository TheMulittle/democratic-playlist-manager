const invitationService = require("../services/invitationService");

function createInvitation(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const { playlistId, playlistName } = req.body;
  const { inviteToken } = invitationService.createInvitation(playlistId, playlistName, token);
  const inviteLink = `${process.env.WEB_APP_BASE_URL}/invite/${playlistId}/${inviteToken}`;
  res.status(201).json({ inviteLink });
}

function getInvitation(req, res) {
  const { inviteToken, playlistId } = req.params;
  const invitation = invitationService.getInvitation(inviteToken, playlistId);
  res.status(200).json({ playlistId: invitation.playlistId, playlistName: invitation.playlistName });
}

function acceptInvitation(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const { inviteToken, playlistId } = req.params;
  invitationService.acceptInvitation(inviteToken, playlistId, token);
  res.status(200).json({ playlistId });
}

module.exports = { createInvitation, getInvitation, acceptInvitation };
