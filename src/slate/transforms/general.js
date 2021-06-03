import { createDraft } from "immer"
import { Node, Point } from '..'

const applyToDraft = (editor, selection, op) => {
    switch (op.type) {
        case 'insert_node': {
            // const { path, node } = op
            // const parent = Node.parent(editor, path)
            // const index = path[path.length - 1]

            // if (index > parent.children.length) {
            //     throw new Error(
            //         `Cannot apply an "insert_node" operation at path [${path}] because the destination is past the end of the node.`
            //     )
            // }
        }

        case 'insert_text': {
            const { path, offset, text } = op
            if (text.length === 0) break

            const node = Node.leaf(editor, path)
            const before = node.text.slice(0, offset)
            const after = node.text.slice(offset)
            node.text = before + text + after

            if (selection) {
                for (const [point, key] of Range.points(selection)) {
                    selection[key] = Point.transform(point, op)
                }
            }

            break
        }
    }
}


export const GeneralTransforms = {
    transform(editor, op) {
        editor.children = createDraft(editor.children)
        let selection = editor.selection && createDraft(editor.selection)

        try {
            selection = applyToDraft(editor, selection, op)
        } finally {

        }
    }
}