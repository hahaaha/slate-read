import { useChildren } from "../hooks/use-children"
import { DecorateContext } from "../hooks/use-decorate"
import { ReadOnlyContext } from "../hooks/use-read-only"
import { useSlate } from "../hooks/use-slate"

const defaultDecorate = () => [] // Range[]

export const Editable = (props) => {
    const {
        readOnly = false,
        // 对应源码中的as:component
        Component = 'div',
        renderElement,
        renderLeaf,
        decorate = defaultDecorate

    } = props
    const editor = useSlate()

    return (
        <ReadOnlyContext.Provider value={readOnly}>
            {/* <DecorateContext.props value={decorate}> */}
                <Component
                    contentEditable={readOnly ? undefined : true}
                    data-slate-node="value"
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
