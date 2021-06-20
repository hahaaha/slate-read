import { Transforms } from '../slate'
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps'
import ReactDOM from 'react-dom'


export const withReact = (editor) => {
    const e = editor
    const { onChange, apply } = e

    e.apply = (op) => {
        const matches = []
        switch (op.type) {
            case 'insert_text':
            case 'remove_text':
        }

        apply(op)


    }

    // ReactDOM.unstable_batchedUpdates(() => {
    //     const onContextChange = EDITOR_TO_ON_CHANGE.get(e)

    //     if (onContextChange) {
    //       onContextChange()
    //     }

    //     onChange()
    //   })

    e.insertData = (data) => {
        // 基于fragment的先跳过
        // const fragment = data.getData('application/x-slate-fragment')

        // if(fragment) {
        //     const decoded = decodeURIComponent(window.atob(fragment))
        //     const parsed = JSON.parse(decoded)
        //     e.insertFr
        // }

        const text = data.getData('text/plain')

        if (text) {
            const lines = text.split(/\r\n|\r|\n/)
            let split = false

            for (const line of lines) {
                if (split) {
                    Transforms.splitNode(e, { always: true })
                }

                e.insertText(line)
                split = true
            }
        }
    }


    e.onChange = () => {
        ReactDOM.unstable_batchedUpdates(() => {
            const onContextChange = EDITOR_TO_ON_CHANGE.get(e)

            if (onContextChange) {
                onContextChange()
            }

            onChange()
        })
    }

    return e
}