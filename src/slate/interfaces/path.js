// Path: number[]
// example: [0,0]
export const Path = {
    isPath(value) {
        return (
            Array.isArray(value) &&
            (value.length === 0 || typeof value[0] === 'number')
        )
    },

    compare(path, another) {
        const min = Math.min(path.length, another.length)

        for (let i = 0; i < min; i++) {
            if (path[i] < another[i]) return -1
            if (path[i] > another[i]) return 1
        }
        return 0
    },

    // 获取两个paths的共同祖先path
    common(path, another) {
        const common = []

        for (let i = 0; i < path.length && i < another.length; i++) {
            const av = path[i]
            const bv = another[i]

            if (av !== bv) {
                break
            }

            common.push(av)
        }
        return common
    },

    // 获取父path
    parent(path) {
        if (path.length === 0) {
            throw new Error(`Cannot get the parent path of the root path [${path}].`)
        }

        return path.slice(0, -1)
    },
    // 检查path的路径和another的路径是不是完全一致的
    equals(path,another) {
        return (
            path.length === another.length && path.every((n,i) => n === another[i])
        )
    }
}