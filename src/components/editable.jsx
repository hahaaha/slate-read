import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useChildren } from "../hooks/use-children"
import { DecorateContext } from "../hooks/use-decorate"
import { ReadOnlyContext } from "../hooks/use-read-only"
import { useSlate } from "../hooks/use-slate"
import { ReactEditor } from "../plugin/react-editor"
import { getDefaultView, isDOMNode } from "../utils/dom"
import { NODE_TO_ELEMENT, ELEMENT_TO_NODE, EDITOR_TO_ELEMENT, IS_FOCUSED, EDITOR_TO_WINDOW, IS_READ_ONLY } from "../utils/weak-maps"
import throttle from 'lodash/throttle'
import { Range, Transforms } from "../slate"
import { Editor } from "../slate/interfaces/editor"

const defaultDecorate = () => [] // Range[]

export const Editable = (props) => {
    const {
        readOnly = false,
        autoFocus,
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

    console.log(editor)
    IS_READ_ONLY.set(editor, readOnly)

    const state = useMemo(
        () => ({
            isComposing: false,
            isUpdatingSelection: false,
            isDraggingInternally: false,
            latestElement: null
        }),
        []
    )


    useLayoutEffect(() => {
        let window
        if (ref.current && (window = getDefaultView(ref.current))) {
            EDITOR_TO_WINDOW.set(editor, window)
            EDITOR_TO_ELEMENT.set(editor, ref.current)
            NODE_TO_ELEMENT.set(editor, ref.current)
            ELEMENT_TO_NODE.set(ref.current, editor)
        } else {
            NODE_TO_ELEMENT.delete(editor)
        }
    })

    // 当编辑器更新时， 确保 dom selection state 是同步的
    useLayoutEffect(() => {
        const { selection } = editor
        const root = ReactEditor.findDocumentOrShadowRoot(editor)
        const domSelection = root.getSelection()

        console.log(editor)
        console.log(selection)

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

        // 如果 Dom selection 在editor中且editor selection 已经完成，进行下操作
        if (hasDomSelection && hasDomSelectionInEditor && selection) {
            const slateRange = ReactEditor.toSlateRange(editor, domSelection, {
                exactMatch: true
            })
            if (slateRange && Range.equals(slateRange, selection)) {
                return
            }
        }



    })

    useEffect(() => {
        if(ref.current && autoFocus) {
            ref.current.focus()
        }
    }, [autoFocus])

    const onDOMBeforeInput = useCallback(
        (event) => {
            // if (!readOnly &&
            //     hasEditableTarget(editor, event.target) &&
            //     !isDOMEventHandled(event, propsOnDOMBeforeInput)
            // ) {
            //     const { selection } = editor
            //     console.log(selection)
            //     const { inputType: type } = event
            //     const data = event.dataTransfer || event.data || undefined
            //     console.log(type)

            //     // 这两个事件不做处理
            //     if (type === 'insertCompositionText' ||
            //         type === 'deleteCompositionText'
            //     ) {
            //         return
            //     }

            //     event.preventDefault()

            //     // 前面还会有一些特殊的处理暂时先不做，先只做insertText
            //     switch (type) {
            //         case 'insertText': {
            //             const window = ReactEditor.getWindow(editor)
            //             if (data instanceof window.DataTransfer) {
            //                 ReactEditor.insertData(editor, data)
            //             } else if (typeof data === 'string') {
            //                 Editor.insertText(editor, data)
            //             }

            //             break
            //         }
            //     }


            // }
        },
        [readOnly, propsOnDOMBeforeInput]
    )

    useLayoutEffect(() => {
        // 本来应该加beforeinput检测
        if (ref.current) {
            // @ts-ignore The `beforeinput` event isn't recognized.
            ref.current.addEventListener('beforeinput', onDOMBeforeInput)
        }

        return () => {

            // 本来应该加beforeinput检测
            if (ref.current) {
                // @ts-ignore The `beforeinput` event isn't recognized.
                ref.current.removeEventListener('beforeinput', onDOMBeforeInput)
            }
        }
    }, [onDOMBeforeInput])

    const onDOMSelectionChange = useCallback(
        throttle(() => {
            console.log('onDomselect')
            console.log(editor.selection)
            if (
                !readOnly &&
                !state.isComposing &&
                !state.isUpdatingSelection &&
                !state.isDraggingInternally
            ) {
                const root = ReactEditor.findDocumentOrShadowRoot(editor)
                const { activeElement } = root
                const el = ReactEditor.toDOMNode(editor, editor)
                const domSelection = root.getSelection()

                if (activeElement === el) {
                    state.latestElement = activeElement
                    IS_FOCUSED.set(editor, true)
                } else {
                    IS_FOCUSED.delete(editor)
                }


                if (!domSelection) {
                    return Transforms.deselect(editor)
                }

                const { anchorNode, focusNode } = domSelection

                const anchorNodeSelectable =
                    hasEditableTarget(editor, anchorNode) ||
                    isTargetInsideVoid(editor, anchorNode)

                const focusNodeSelectable =
                    hasEditableTarget(editor, focusNode) ||
                    isTargetInsideVoid(editor, focusNode)

                if (anchorNodeSelectable && focusNodeSelectable) {
                    const range = ReactEditor.toSlateRange(editor, domSelection, {
                        exactMatch: false
                    })
                    console.log("执行select")
                    console.log(editor.selection)
                    Transforms.select(editor, range)
                } else {
                    // Transforms.deselect(editor)
                }

            }
        }, 100), 
        [readOnly]
    )

    useLayoutEffect(() => {
        const window = ReactEditor.getWindow(editor)
        window.document.addEventListener('selectionchange', onDOMSelectionChange)

        return () => {
            window.document.removeEventListener(
                'selectionchange',
                onDOMSelectionChange
            )
        }
    }, [onDOMSelectionChange])

    return (
        <ReadOnlyContext.Provider value={readOnly}>
            {/* <DecorateContext.props value={decorate}> */}
            <Component
                contentEditable={readOnly ? undefined : true}
                data-slate-node="value"
                suppressContentEditableWarning
                data-slate-editor
                ref={ref}
                {...attributes}
            >
                {useChildren({
                    node: editor,
                    renderElement,
                    renderLeaf,
                    selection: editor.selection
                })}
            </Component>
            {/* </DecorateContext.props> */}
        </ReadOnlyContext.Provider>
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

// 检查target在编辑器中是否是可编辑的
const hasEditableTarget = (editor, target) => {
    return (
        isDOMNode(target) &&
        ReactEditor.hasDomNode(editor, target, { editable: true })
    )
}

// 检查一个target在编辑器中是否是内置的void
const isTargetInsideVoid = (editor, target) => {
    const slateNode =
        hasTarget(editor, target) && ReactEditor.toSlateNode(editor, target)
    return Editor.isVoid(editor, slateNode)
}

const hasTarget = (editor, target) => {
    return isDOMNode(target) && ReactEditor.hasDomNode(editor, target)
}