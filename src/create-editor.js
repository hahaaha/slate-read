import { Range, Transforms } from './slate/index'
import { Editor } from './slate/interfaces/editor'
export const createEditor = () => {
    const editor = {
        children: [],
        operations: [],
        Selection: null,
        marks: null,
        isInline: () => false,
        isVoid: () => false,
        onChange: () => { },
        insertText: (text) => {
            const { selection, marks } = editor
            console.log("insertText")
            if (selection) {
                if (Range.isCollapsed) {
                    const inline = Editor.above(editor, {
                        match: n => Editor.isInline(editor, n),
                        mode: 'highest'
                    })

                    if (inline) {
                        const [, inlinePath] = inline

                        // if (Editor.isEnd(editor, selection.anchor, inlinePath)) {
                        //   const point = Editor.after(editor, inlinePath)
                        //   Transforms.setSelection(editor, {
                        //     anchor: point,
                        //     focus: point,
                        //   })
                        // }
                    }
                }

                if (marks) {
                    // const node = { text, ...marks }
                    // Transforms.insertNodes(editor, node)
                } else {
                    Transforms.insertText(editor, text)
                }
            }
        },

        apply: (op) => {
            const set = new Set()

        }
    }


    return editor
}