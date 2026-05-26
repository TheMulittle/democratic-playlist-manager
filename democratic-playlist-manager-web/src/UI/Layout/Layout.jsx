import Header from '../Header/Header'

const layout = (props) => (
  <div>
    <Header />
    {props.children}
  </div>
)

export default layout
