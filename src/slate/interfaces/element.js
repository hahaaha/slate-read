import { isPlainObject } from "is-plain-object"
import {Node} from './node'

export const Element = {
    isElement(value) {
        return (
            isPlainObject(value) &&
            Node.isNodeList(value.children)
        )
    }
}