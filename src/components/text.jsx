import { ReactEditor } from "../plugin/react-editor"
import Leaf from "./leaf"

export const Text = (props) => {
    const { element, text,renderLeaf } = props

    const children = []
    const key = ReactEditor.findKey(text)
    const leaf = text


    children.push(
        <Leaf 
            leaf={leaf}
            text={text}
            key={`${key}`}

            renderLeaf={renderLeaf}
        />
    )

    return (
        <span data-slate-node="text">
            {children}
        </span>
    )
}

export default Text