import { Range, Transforms } from './slate/index'
import { Editor } from './slate/interfaces/editor'
import { FLUSHING } from './utils/weak-maps'
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
            console.log(selection)
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
            console.log(op)
            const set = new Set()
            const dirtyPaths = []

            const add = (path) => {
                if (path) {
                    const key = path.join(",")

                    if (!set.has(key)) {
                        set.add(key)
                        dirtyPaths.push(key)
                    }
                }
            }
            
            if(!FLUSHING.get(editor)) {
                FLUSHING.set(editor, true)

                Promise.resolve().then(() => {
                    FLUSHING.set(editor, false)
                    editor.onChange()
                    editor.operations = []
                })
            }
            
        }
    }


    return editor
}