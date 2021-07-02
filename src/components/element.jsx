import { useChildren } from "../hooks/use-children"

export const Element = (props) => {
    const {
        element,
        renderElement = (p) => <DefaultElement {...p} />,
        renderLeaf
    } = props

    // 生成对应的text
    let children = useChildren({
        node: element,
        renderElement,
        renderLeaf
    })

    const attributes = {
        'data-slate-node': 'element'
    }

    return (
        <div>
            {renderElement({ attributes,children,element })}
        </div>
    )

}


export const DefaultElement = (props) => {
    const { children, attributes } = props

    const Tag = 'div'
    return (

        <Tag {...attributes} >
            {children}
        </Tag>
    )
}

export default Element