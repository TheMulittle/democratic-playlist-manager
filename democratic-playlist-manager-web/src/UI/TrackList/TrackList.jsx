import './TrackList.css'

const TrackList = ({ tracks }) => (
  <div className="TrackList">
    <div className="TrackList-header">
      <span>#</span>
      <span>Title</span>
    </div>
    {tracks.map((track, index) => (
      <div
        key={track.id}
        className={`Track ${track.isCurrent ? 'Current' : ''} ${!track.isOwn ? 'Faded' : ''}`}
      >
        <span className="TrackNumber">{index + 1}</span>
        <div className="TrackInfo">
          <span className="TrackName">{track.name}</span>
          <span className="TrackArtists">{track.artists}</span>
        </div>
      </div>
    ))}
  </div>
)

export default TrackList
