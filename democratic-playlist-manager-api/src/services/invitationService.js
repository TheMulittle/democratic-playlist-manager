const { nanoid } = require("nanoid");
const invitations = require("../repositories/invitations");
const inviteeAssignments = require("../repositories/inviteeAssignments");
const managedPlaylists = require("../repositories/managedPlaylists");
const sessions = require("../repositories/sessions");
const ResourceDoesNotBelongToEntityError = require("../errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

function createInvitation(playlistId, playlistName, sessionToken) {
  const managed = managedPlaylists.getAllPlaylistIds(sessionToken);
  if (!managed.includes(playlistId)) {
    throw new ResourceDoesNotBelongToEntityError(playlistId, sessionToken);
  }
  const inviteToken = nanoid();
  invitations.add(inviteToken, playlistId, playlistName);
  return { inviteToken, playlistId };
}

function getInvitation(inviteToken, playlistId) {
  const invitation = invitations.get(inviteToken);
  if (!invitation || invitation.playlistId !== playlistId) {
    throw new ResourceNotFoundError(`Invitation not found`);
  }
  return invitation;
}

function acceptInvitation(inviteToken, playlistId, sessionToken) {
  const invitation = getInvitation(inviteToken, playlistId);
  const { email } = sessions.get(sessionToken);
  inviteeAssignments.add(email, invitation.playlistId);
}

module.exports = { createInvitation, getInvitation, acceptInvitation };
