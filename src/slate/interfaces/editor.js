import { Path } from './path'
import { Range, Node, Element } from '..'
import { Point } from './point'

export const Editor = {
    // 获取location 的开始或者结束 point 
    // option -> edge option只有一个值edge edge 只能是start 或者 end
    point(editor, at, options) {
        const { edge = 'start' } = options
        if (Path.isPath(at)) {
            let path

            if (edge === 'end') {
                const [, lastPath] = Node.last(editor, at)
                path = lastPath
            } else {
                const [, firstPath] = Node.first(editor, at)
                path = firstPath
            }

            const node = Node.get(editor, path)

            if (!Text.isText(node)) {
                throw new Error(
                    `Cannot get the ${edge} point in the node at path [${at}] because it has no ${edge} text node.`
                )
            }

            return { path, offset: edge === 'end' ? node.text.length : 0 }
        }

        if (Range.isRange(at)) {
            const [start, end] = Range.edges(at)
            return edge === 'start' ? start : end
        }

        return at
    },

    // 获取location的开始 point
    start(editor, at) {
        return Editor.point()
    },
    range(editor, at, to) {
        if (Range.isRange(at) && !to) {
            return at
        }
    },

    // match 一个void节点在当前编辑器分支中
    void(editor, options) {
        return Editor.above(editor, {
            ...options,
            match: n => Editor.isVoid(editor, n)
        })
    },

    // 获取 location的 path
    // options 有depth 和 edge的值 都是可选的
    // at location
    path(editor, at, options) {
        const { depth, edge } = options

        if (Path.isPath(at)) {
            if (edge === 'start') {
                const [, firstPath] = Node.first(editor, at)
                at = firstPath
            } else if (edge === 'end') {
                const [, lastPath] = Node.last(editor, at)
                at = lastPath
            }
        }

        if (Range.isRange(at)) {
            if (edge === 'start') {
                at = Range.start(at)
            } else if (edge === 'end') {
                at = Range.end(at)
            } else {
                at = Path.common(at.anchor.path, at.focus.path)
            }
        }

        if (Point.isPoint(at)) {
            at = at.path
        }

        if (depth != null) {
            at = at.slice(0, depth)
        }

        return at
    },

    // 检查value是不是空的 Element对象
    isVoid(editor, value) {
        return Element.isElement(value) && editor.isVoid(value)
    },

    pathRef(editor, path, options) {
        const { affinity = 'forward' } = options

        const ref = { 
            current: path,
            affinity,
            unref() {
                const { current } = ref
            }
        }
    },

    // 获取文档中某个位置上的祖先node
    above(editor, options = {}) {
        const {
            voids = false,
            mode = 'lowest',
            at = editor.selection,
            match
        } = options

        if (!at) {
            return
        }

        const path = Editor.path(editor, at)
        const reverse = mode === 'lowest'

        for (const [n, p] of Editor.levels(editor, {
            at: path,
            voids,
            match,
            reverse
        })) {
            if (!Text.isText(n) && !Path.equals(path, p)) {
                return [n, p]
            }
        }
    },

    /**
   * Iterate through all of the levels at a location.
   */
    *levels(editor, options) {
        const { at = editor.selection, reverse = false, voids = false } = options
        let { match } = options

        if (match == null) {
            match = () => null
        }

        if (!at) {
            return
        }

        const levels = []
        const path = Editor.path(editor, at)

        for (const [n, p] of Node.levels(editor, path)) {
            if (!match(n, p)) {
                continue
            }

            levels.push([n, p])

            if (!voids && Editor.isVoid(editor, n)) {
                break
            }
        }

        if (reverse) {
            levels.reverse()
        }

        yield* levels
    },
    after() {
        
    }
}