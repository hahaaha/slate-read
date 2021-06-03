import { EDITOR_TO_ON_CHANGE} from '../utils/weak-maps'

export const withReact = (editor) => {
    const e = editor
    const { onChange } = e

    // ReactDOM.unstable_batchedUpdates(() => {
    //     const onContextChange = EDITOR_TO_ON_CHANGE.get(e)
  
    //     if (onContextChange) {
    //       onContextChange()
    //     }

    //     onChange()
    //   })
    e.onChange = () => {
        onChange()
    }

    return e

}