import { createContext, useContext } from "react";

export const EditorContext = createContext(null)

export const useSlateStatic = () => {
    const editor = useContext(EditorContext)

    return editor
}