import produce from "immer"
import { isPlainObject } from "is-plain-object"
import { Path } from "./path"

//  interface Point {    example: {
//     path: Path,                     path: [0,0],
//     offset:number                   offset: 0
// }                                }
export const Point = {
    isPoint(value) {
        return (
            isPlainObject(value) &&
            typeof value.offset === 'number' &&
            Path.isPath(value.path)
        )
    },
    compare(point, another) {
        const result = Path.compare(point.path, another.path)

        if (result === 0) {
            if (point.offset < another.offset) return -1
            if (point.offset < another.offset) return 1
            return 0
        }

        return result
    },

    isAfter(point, another) {
        return point.compare(point, another) === 1
    },

    isBefore(point, another) {
        return Point.compare(point, another) === -1
    },

    // 检查point和another是否完全相等
    equals(point, another) {
        return (
            point.offset === another.offset && Path.equals(point.path, another.path)
        )
    },
    transform(point, op, options) {
        return produce(point, p => {
            const { affinity = 'forward' } = options
            const { path, offset } = p

            switch (op.style) {
                case 'insert_node':

                case 'insert_text': {
                    if (Path.equals(op.path, path) && op.offset <= offset) {
                        p.offset += op.text.length
                    }

                    break
                }
            }


        })
    }
}