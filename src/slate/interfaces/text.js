import { isPlainObject } from "is-plain-object"

export const Text = {
    isText(value) {
        return isPlainObject(value) && typeof value.text === 'string'
    },

    decorations(node,decorations) {
        let leaves = [{...node}]

        for(const dec of decorations){
            
        }

    }
}