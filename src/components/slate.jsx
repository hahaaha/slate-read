import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { SlateContext } from "../hooks/use-slate"
import { EditorContext } from "../hooks/use-slate-static"
import { ReactEditor } from "../plugin/react-editor"
import { EDITOR_TO_ON_CHANGE } from "../utils/weak-maps"

export const Slate = (props) => {
    const { editor, value, children, onChange, ...rest } = props
    const [key, setKey] = useState(0)
    const context = useMemo(() => {
        // 富文本的内容都保存在children中
        editor.children = value
        Object.assign(editor, rest)
        return [editor]
    }, [key, value, ...Object.values(rest)])

    const onContextChange = useCallback(() => {
        console.log("onchange")
        onChange(editor.children)
        setKey(key + 1)
    }, [key, onChange])

    EDITOR_TO_ON_CHANGE.set(editor, onContextChange)


    useEffect(() => {
        return () => {
            EDITOR_TO_ON_CHANGE.set(editor, () => { })
        }
    }, [])

    const [isFocused, setIsFocused] = useState(ReactEditor.isFocused(editor))

    useEffect(() => {
        setIsFocused(ReactEditor.isFocused(editor))
    })

    useLayoutEffect(() => {
        const fn = () => setIsFocused(ReactEditor.isFocused(editor))
        document.addEventListener('focus', fn, true)
        return () => document.removeEventListener('focus', fn, true)
    }, [])

    useLayoutEffect(() => {
        const fn = () => setIsFocused(ReactEditor.isFocused(editor))
        document.addEventListener('blur', fn, true)
        return () => document.removeEventListener('blur', fn, true)
    }, [])



    return (
        <SlateContext.Provider value={context}>
            <EditorContext.Provider value={editor}>
                {children}
            </EditorContext.Provider>
        </SlateContext.Provider>
    )
}