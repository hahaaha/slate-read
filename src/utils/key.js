// 作为一个全局key
let n = 0

// 使用class是为了Key可以作为WeakMap的key
export class Key {
    id
    constructor() {
        this.id = `${n++}`
    }
}