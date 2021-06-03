import { isPlainObject } from "is-plain-object"
import { Point } from "./point"

// Range {
//     anchor: Point, start
//     focus: Point end
// }
// 拖蓝位置
export const Range = {
    // 检查传入的值是不是 Range
    isRange(value) {
        return (
            isPlainObject(value) &&
            Point.isPoint(value.anchor) &&
            Point.isPoint(value.focus)
        )
    },

    edges(range, options) {
        const { reverse = false } = options
        const { anchor, focus } = range
        return Range.isBackward(range) === reverse ? [anchor, focus] : [focus, anchor]
    },
    //  检查range是不是向后的，就是说 anchor 在 focus 后面
    isBackward(range) {
        const { anchor, focus } = range
        return Point.isAfter(anchor, focus)
    },
    isCollapsed(range) {
        const { anchor, focus } = range
        return Point.equals(anchor, focus)
    },
    start(range) {
        const [start] = Range.edges(range)
        return start
    },
    end(range) {
        const [,end] = Range.edges(range)
        return end
    }
    
}