import { createContext, useContext } from "react";

export const SlateContext = createContext(null)

export const useSlate = () => {
    const context = useContext(SlateContext)
    if(!context) {
        throw new Error(
            `useSlate must inside slateContext.provide`
        )
    }


    const [editor] = context
    return editor
}