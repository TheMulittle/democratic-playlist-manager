import './PlaylistRow.css'

const PlaylistRow = ({ name, selected, onClick }) => (
  <div className={`PlaylistRow ${selected ? 'Selected' : ''}`} onClick={onClick}>
    <div className="PlaylistRow-icon">♪</div>
    <span className="PlaylistRow-name">{name}</span>
  </div>
)

export default PlaylistRow
