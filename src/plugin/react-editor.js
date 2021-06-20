import { Editor } from "../slate/interfaces/editor"
import { isDOMElement } from "../utils/dom"
import { Key } from "../utils/key"
import { NODE_TO_KEY, NODE_TO_PARENT, NODE_TO_INDEX, IS_FOCUSED, EDITOR_TO_ELEMENT, EDITOR_TO_WINDOW, ELEMENT_TO_NODE } from "../utils/weak-maps"
import { isDOMSelection, normalizeDOMPoint } from "../utils/dom"

export const ReactEditor = {
    /**
   * Return the host window of the current editor.
   */

    getWindow(editor) {
        const window = EDITOR_TO_WINDOW.get(editor)
        if (!window) {
            throw new Error('Unable to find a host window element for this editor')
        }
        return window
    },

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
        const root = el.getRootNode()

        console.log(el)

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
    // 寻找一个slate node 从 native Dom `element`
    toSlateNode(editor, domNode) {
        let domEl = isDOMElement(domNode) ? domNode : domNode.parentElement

        if (domEl && !domEl.hasAttribute['data-slate-node']) {
            domEl = domEl.closest(`[data-slate-node]`)
        }
        console.log(domEl)
        const node = domEl ? ELEMENT_TO_NODE.get(domEl) : null
        console.log(node)

        if (!node) {
            throw new Error(`Cannot resolve a Slate node from DOM node: ${domEl}`)
        }

        return node
    },
    hasDomNode(editor, target, options = {}) {
        const { editable = false } = options
        const editorEl = ReactEditor.toDOMNode(editor, editor)
        let targetEl

        try {
            targetEl = isDOMElement(target) ? target : target.parentElement
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
            (!editable || targetEl.isContentEditable ||
                !!targetEl.getAttribute('data-slate-zero-width'))
        )
    },

    // 向编辑器中插入来自DataTransfer的数据
    insertData(editor, data) {
        editor.insertData(data)
    },

    toSlateRange(editor, domRange, options) {
        const { exactMatch } = options

        console.log(domRange)
        console.log(isDOMSelection(domRange))
        const el = isDOMSelection(domRange)
            ? domRange.anchorNode
            : domRange.startContainer
        let anchorNode
        let anchorOffset
        let focusNode
        let focusOffset
        let isCollapsed

        console.log(el)

        if (el) {
            if (isDOMSelection(domRange)) {
                anchorNode = domRange.anchorNode
                anchorOffset = domRange.anchorOffset
                focusNode = domRange.focusNode
                focusOffset = domRange.focusOffset

                isCollapsed = domRange.isCollapsed
            } else {
                anchorNode = domRange.startContainer
                anchorOffset = domRange.startOffset
                focusNode = domRange.endContainer
                focusOffset = domRange.endOffset
                isCollapsed = domRange.collapsed
            }
        }

        if (
            anchorNode == null ||
            focusNode == null ||
            anchorOffset == null ||
            focusOffset == null
        ) {
            throw new Error(
                `Cannot resolve a Slate range from DOM range: ${domRange}`
            )
        }

        const anchor = ReactEditor.toSlatePoint(
            editor,
            [anchorNode, anchorOffset],
            exactMatch
        )

        if (!anchor) {
            return null
        }

        const focus = isCollapsed
            ? anchor
            : ReactEditor.toSlatePoint(editor, [focusNode, focusOffset], exactMatch)


        if (!focus) {
            return null
        }

        return { anchor, focus }

    },
    // 根据selection domNode 和 domOffset 寻找slate point
    toSlatePoint(editor, domPoint, extractMatch) {
        console.log(extractMatch)
        const [nearestNode, nearestOffset] = extractMatch
            ? domPoint
            : normalizeDOMPoint(domPoint)
        const parentNode = nearestNode.parentNode
        let textNode = null
        let offset = 0

        if (parentNode) {
            const voidNode = parentNode.closest('[data-slate-void="true"]')
            let leafNode = parentNode.closest('[data-slate-leaf]')
            let domNode = null

            // Calculate how far into the text node the `nearestNode` is, so that we
            // can determine what the offset relative to the text node is.
            if (leafNode) {
                textNode = leafNode.closest('[data-slate-node="text"]')
                const window = ReactEditor.getWindow(editor)
                const range = window.document.createRange()
                range.setStart(textNode, 0)
                range.setEnd(nearestNode, nearestOffset)
                const contents = range.cloneContents()
                const removals = [
                    ...Array.prototype.slice.call(
                        contents.querySelectorAll('[data-slate-zero-width]')
                    ),
                    ...Array.prototype.slice.call(
                        contents.querySelectorAll('[contenteditable=false]')
                    ),
                ]

                removals.forEach(el => {
                    el.parentNode.removeChild(el)
                })

                // COMPAT: Edge has a bug where Range.prototype.toString() will
                // convert \n into \r\n. The bug causes a loop when slate-react
                // attempts to reposition its cursor to match the native position. Use
                // textContent.length instead.
                // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10291116/
                offset = contents.textContent.length
                domNode = textNode
            } else if (voidNode) {
                // For void nodes, the element with the offset key will be a cousin, not an
                // ancestor, so find it by going down from the nearest void parent.
                leafNode = voidNode.querySelector('[data-slate-leaf]')

                // COMPAT: In read-only editors the leaf is not rendered.
                if (!leafNode) {
                    offset = 1
                } else {
                    textNode = leafNode.closest('[data-slate-node="text"]')
                    domNode = leafNode
                    offset = domNode.textContent.length
                    domNode.querySelectorAll('[data-slate-zero-width]').forEach(el => {
                        offset -= el.textContent.length
                    })
                }
            }

            // COMPAT: If the parent node is a Slate zero-width space, editor is
            // because the text node should have no characters. However, during IME
            // composition the ASCII characters will be prepended to the zero-width
            // space, so subtract 1 from the offset to account for the zero-width
            // space character.
            if (
                domNode &&
                offset === domNode.textContent.length &&
                parentNode.hasAttribute('data-slate-zero-width')
            ) {
                offset--
            }
        }

        if (!textNode) {
            if (extractMatch) {
                return null
            }
            throw new Error(
                `Cannot resolve a Slate point from DOM point: ${domPoint}`
            )
        }

        // COMPAT: If someone is clicking from one Slate editor into another,
        // the select event fires twice, once for the old editor's `element`
        // first, and then afterwards for the correct `element`. (2017/03/03)
        const slateNode = ReactEditor.toSlateNode(editor, textNode)
        const path = ReactEditor.findPath(editor, slateNode)
        return { path, offset }


    }
}