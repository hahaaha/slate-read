import { createContext, useContext } from "react";

export const DecorateContext = createContext(() => [])

export const useDecorate = () => {
    return useContext(DecorateContext)
}