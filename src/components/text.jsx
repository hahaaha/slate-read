import { useLayoutEffect, useRef } from "react"
import { ReactEditor } from "../plugin/react-editor"
import { ELEMENT_TO_NODE, NODE_TO_ELEMENT } from "../utils/weak-maps"
import Leaf from "./leaf"

export const Text = (props) => {
    const { element, text, renderLeaf } = props

    const children = []
    const key = ReactEditor.findKey(text)
    const leaf = text
    const ref = useRef(null)


    children.push(
        <Leaf
            leaf={leaf}
            text={text}
            key={`${key}`}

            renderLeaf={renderLeaf}
        />
    )

    useLayoutEffect(() => {
        if (ref.current) {
            NODE_TO_ELEMENT.set(text, ref.current)
            ELEMENT_TO_NODE.set(ref.current, text)
        } else {
            NODE_TO_ELEMENT.delete(text)
        }
    })

    return (
        <span data-slate-node="text" ref={ref}>
            {children}
        </span>
    )
}

export default Text