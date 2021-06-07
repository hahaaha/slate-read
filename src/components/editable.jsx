import { useCallback, useLayoutEffect, useMemo, useRef } from "react"
import { useChildren } from "../hooks/use-children"
import { DecorateContext } from "../hooks/use-decorate"
import { ReadOnlyContext } from "../hooks/use-read-only"
import { useSlate } from "../hooks/use-slate"
import { ReactEditor } from "../plugin/react-editor"
import { getDefaultView, isDOMNode } from "../utils/dom"
import { NODE_TO_ELEMENT, ELEMENT_TO_NODE, EDITOR_TO_ELEMENT } from "../utils/weak-maps"

const defaultDecorate = () => [] // Range[]

export const Editable = (props) => {
    const {
        readOnly = false,
        // 对应源码中的as:component
        Component = 'div',
        renderElement,
        renderLeaf,
        onDOMBeforeInput: propsOnDOMBeforeInput,
        decorate = defaultDecorate,
        ...attributes
    } = props
    const editor = useSlate()
    const ref = useRef(null)
    console.log(ref)

    const state = useMemo(
        () => ({
            isComposing: true,
        })
    )


    useLayoutEffect(() => {
        let window
        if (ref.current && (window = getDefaultView(ref.current))) {
            console.log("set")
            EDITOR_TO_ELEMENT.set(editor, ref.current)
            NODE_TO_ELEMENT.set(editor, ref.current)
            ELEMENT_TO_NODE.set(ref.current, editor)
        } else {
            NODE_TO_ELEMENT.delete(editor)
        }
    })

    useLayoutEffect(() => {
        const { selection } = editor
        const root = ReactEditor.findDocumentOrShadowRoot(editor)
        const domSelection = root.getSelection()

        if (state.isComposing || !domSelection || !ReactEditor.isFocused(editor)) {
            return
        }

        const hasDomSelection = domSelection.type !== "None"

        //如果dom selection 没有正确的被设置
        if (!selection && !hasDomSelection) {
            return
        }

        // 验证dom selection 有没有在editor里面
        const editorElement = EDITOR_TO_ELEMENT.get(editor)
        let hasDomSelectionInEditor = false

        if (
            editorElement.contains(domSelection.anchorNode) &&
            editorElement.contains(domSelection.focusNode)
        ) {
            hasDomSelectionInEditor = true
        }


        if (hasDomSelection && hasDomSelectionInEditor && selection) {
            // const slateRange = ReactEditor.toSlateRange()
        }



    })

    const onDOMBeforeInput = useCallback(
        (event) => {
            if (!readOnly &&
                hasEditableTarget(editor, event.target) &&
                !isDOMEventHandled(event, propsOnDOMBeforeInput)
            ) {
                const { selection } = editor
                const { inputType: type } = event
                const data = event.dataTransfer || event.data || undefined

                // 这两个事件不做处理
                if (type === 'insertCompositionText' ||
                    type === 'deleteCompositionText'
                ) {
                    return
                }

                event.preventDefault()

                // 前面还会有一些特殊的处理暂时先不做，先只做insertText
                switch (type) {
                    case 'insertText': {
                        const window = ReactEditor.getWindow(editor)
                        if (data instanceof window.DataTransfer) {
                            ReactEditor.insertData(editor, data)

                        }
                    }
                }


            }
        },
        [readOnly, propsOnDOMBeforeInput]
    )

    return (
        <ReadOnlyContext.Provider value={readOnly}>
            {/* <DecorateContext.props value={decorate}> */}
            <Component
                contentEditable={readOnly ? undefined : true}
                data-slate-node="value"
                suppressContentEditableWarning
                ref={ref}
                {...attributes}
            >
                {useChildren({
                    node: editor,
                    renderElement,
                    renderLeaf
                })}
            </Component>
            {/* </DecorateContext.props> */}
        </ReadOnlyContext.Provider>
    )
}


const hasEditableTarget = (editor, target) => {
    return (
        isDOMNode(target) && ReactEditor.hasDomNode(editor, target, { editable: true })
    )
}

// 检查一个dom event 已经被 handler重写
const isDOMEventHandled = (
    event,
    handler
) => {
    if (!handler) {
        return false
    }

    handler(event)
    return event.defaultPrevented
}
