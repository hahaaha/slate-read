import { useMemo } from "react"
import { SlateContext } from "../hooks/use-slate"
import { EditorContext } from "../hooks/use-slate-static"

export const Slate = (props) => {

    const { editor, value, children } = props
    const context = useMemo(() => {
        // 富文本的内容都保存在children中
        editor.children = value

        return [editor]
    }, [value])


    return (
        <SlateContext.Provider value={context}>
            <EditorContext.Provider value={editor}>
                {children}
            </EditorContext.Provider>
        </SlateContext.Provider>
    )
}