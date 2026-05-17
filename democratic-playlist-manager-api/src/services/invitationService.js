const { nanoid } = require("nanoid");
const invitations = require("../repositories/invitations");
const inviteeAssignments = require("../repositories/inviteeAssignments");
const managedPlaylists = require("../repositories/managedPlaylists");
const sessions = require("../repositories/sessions");
const ResourceDoesNotBelongToEntityError = require("../errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

async function createInvitation(playlistId, playlistName, sessionToken) {
  const managed = await managedPlaylists.getAllPlaylistIds(sessionToken);
  if (!managed.includes(playlistId)) {
    throw new ResourceDoesNotBelongToEntityError(playlistId, sessionToken);
  }
  const inviteToken = nanoid();
  await invitations.add(inviteToken, playlistId, playlistName);
  return { inviteToken, playlistId };
}

async function getInvitation(inviteToken, playlistId) {
  const invitation = await invitations.get(inviteToken);
  if (!invitation || invitation.playlistId !== playlistId) {
    throw new ResourceNotFoundError(`Invitation not found`);
  }
  return invitation;
}

async function acceptInvitation(inviteToken, playlistId, sessionToken) {
  const invitation = await getInvitation(inviteToken, playlistId);
  const { email } = await sessions.get(sessionToken);
  await inviteeAssignments.add(email, invitation.playlistId);
}

module.exports = { createInvitation, getInvitation, acceptInvitation };
