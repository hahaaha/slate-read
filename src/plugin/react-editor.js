import { Editor } from "../slate/interfaces/editor"
import { isDOMElement } from "../utils/dom"
import { Key } from "../utils/key"
import { NODE_TO_KEY, NODE_TO_PARENT, NODE_TO_INDEX, IS_FOCUSED, EDITOR_TO_ELEMENT } from "../utils/weak-maps"

export const ReactEditor = {

    // 找slate的node
    findKey(node) {
        let key = NODE_TO_KEY.get(node)

        if (!key) {
            key = new Key()
            NODE_TO_KEY.set(node, key)
        }

        return key
    },

    findPath(node) {
        const path = []
        let child = node

        while (true) {
            const parent = NODE_TO_PARENT.get(child)

            if (parent == null) {
                return path
            }

            const i = NODE_TO_INDEX.get(child)

            if (i == null) {
                break
            }

            path.unshift(i)
            child = parent

        }
    },

    isFocused(editor) {
        return !!IS_FOCUSED.get(editor)
    },

    findDocumentOrShadowRoot(editor) {
        const el = ReactEditor.toDOMNode(editor, editor)
        console.log(el)
        const root = el.getRootNode()

        if (el.ownerDocument !== document) return el.ownerDocument

        if (!(root instanceof Document || root instanceof ShadowRoot)) {
            throw new Error(
                `Unable to find DocumentOrShadowRoot for editor element: ${el}`
            )
        }

        if (root.getSelection === undefined && el.ownerDocument !== null) {
            return el.ownerDocument
        }

        return root
    },

    // 根据slate node获取native Dom
    toDOMNode(editor, node) {
        // const domNode = Editor.isEditor(node)
        const domNode = EDITOR_TO_ELEMENT.get(editor)

        if (!domNode) {
            throw new Error(
                `Cannot resolve a DOM node from Slate node: ${JSON.stringify(node)}`
            )
        }

        return domNode
    },

    hasDomNode(editor, target, options = {}) {
        const { editable = false } = options
        const editorEl = ReactEditor.toDOMNode(editor, editor)
        let targetEl

        try {
            targetEl = isDOMElement(target) ? target : target.parent.parentElement
        } catch (err) {
            if (
                !err.message.includes('Permission denied to access property "nodeType"')
            ) {
                throw err
            }
        }

        if (!targetEl) {
            return false
        }

        return (
            targetEl.closest('[data-slate-editor]') === editorEl &&
            (!editable || targetEl.isContentEditable || !!targetEl.getAttribute('data-slate-zero-width'))
        )
    },

    // 向编辑器中插入来自DataTransfer的数据
    insertData(editor, data) {
        editor.insertData(data)
    }
}