function generatePlaylistSnapshotId(snapshotId) {
  return { body: { snapshot_id: snapshotId } };
}

module.exports.generatePlaylistSnapshotId = generatePlaylistSnapshotId;
