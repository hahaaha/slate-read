import { useCallback, useMemo } from "react"
import { SlateContext } from "../hooks/use-slate"
import { EditorContext } from "../hooks/use-slate-static"
import { EDITOR_TO_ON_CHANGE } from "../utils/weak-maps"

export const Slate = (props) => {

    const { editor, value, children,onChange } = props
    const context = useMemo(() => {
        // 富文本的内容都保存在children中
        editor.children = value

        return [editor]
    }, [value])

    const onContextChange = useCallback(() => {
        onChange(editor.children)
    },[onChange])

    EDITOR_TO_ON_CHANGE.set(editor,onContextChange)

    return (
        <SlateContext.Provider value={context}>
            <EditorContext.Provider value={editor}>
                {children}
            </EditorContext.Provider>
        </SlateContext.Provider>
    )
}