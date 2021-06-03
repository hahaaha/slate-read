import { Range } from '..'
import { Editor } from '../interfaces/editor'

export const TextTransforms = {
    insertText(editor, text, options) {
        const { voids = false } = options
        let { at = editor.selection } = options

        if (!at) return

        if (path.isPath(at)) {
            at = Editor.range(editor, at)
        }

        if (Range.isRange(at)) {
            if (Range.isCollapsed(at)) {
                at = at.anchor
            } else {
                const end = Range.end(at)

                if (!voids && Editor.void(editor, { at: end })) {
                    return 
                }

                const pointRef = Editor.pointRef(editor. end)
            }
        }

        const {path, offset} = at
        
        if(text.length > 0) {
            editor.apply({type: 'insert_text' , path ,offset, text})
        }
    }
}