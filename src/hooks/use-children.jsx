import { Element } from '../slate'
import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { useDecorate } from './use-decorate'
import { useSlateStatic } from './use-slate-static'
import { ReactEditor } from '../plugin/react-editor'


/**
 * 处理子节点,在各处重复使用 
 * @param {} props 
 */
export const useChildren = (props) => {
    const {
        node,
        decorations,
        renderElement,
        renderLeaf
    } = props

    const decorate = useDecorate()
    const editor = useSlateStatic()

    const children = []
    
    console.log(node)

    for (let i = 0; i < node.children.length; i++) {
        const n = node.children[i]
        
        /**
         * 为每一个node对应一个key
         * slate中node的结构为
         * {
         *  type:'xxx',
         *  children: [
         *      {
         *      text: 'xxxx'
         *        ...
         *   }
         *  ]
         * }
         */
        const key = ReactEditor.findKey(n)
        const path = ReactEditor.findPath()

        if (Element.isElement(n)) {
            children.push(
                <ElementComponent
                    element={n}
                    key={key.id}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                />
            )
        } else {
            children.push(
                <TextComponent
                    text={n}
                    key={key.id}
                    renderLeaf={renderLeaf}
                />
            )
        }

    }


    return children
}