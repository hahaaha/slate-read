import String from './string'
const Leaf = (props) => {
    const {
        text,
        leaf,
        renderLeaf = (props) => <DefaultLeaf {...props} />
    } = props


    let children = (
        <String text={text.text} />
    )

    const attributes = {
        'data-slate-leaf': true
    }

    return renderLeaf({ attributes, text, leaf, children })

}

export const DefaultLeaf = (props) => {
    const { attributes, children } = props

    return <span {...attributes}>{children}</span>
}

export default Leaf