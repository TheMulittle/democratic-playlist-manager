import './Cover.css'

const cover = (props) => {
  return (
    <div className="Cover">
      <img src={props.img} width={props.width} alt={props.imgDescription} />
    </div>
  )
}

export default cover
