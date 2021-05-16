import { Key } from "../utils/key"
import { NODE_TO_KEY, NODE_TO_PARENT,NODE_TO_INDEX } from "../utils/weak-maps"

export const ReactEditor = {

    // 找slate的node
    findKey(node) {
        let key = NODE_TO_KEY.get(node)

        if(!key) {
            key = new Key()
            NODE_TO_KEY.set(node,key)
        }

        return key
    },
    
    findPath(node) {
        const path = []
        let child = node

        while(true) {
            const parent = NODE_TO_PARENT.get(child)

            if(parent == null) {
                return path
            }

            const i = NODE_TO_INDEX.get(child)

            if(i == null) {
                break
            }

            path.unshift(i)
            child = parent

        }
    }
}