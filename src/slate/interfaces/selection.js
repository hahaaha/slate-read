/**
 *  selection: {
 *          anchor: { path: [0,0],offset: 0}  <-- point
 *          focus: {path: [0,0], offset: 15}
 * }
 */
export const SelectionTransforms = {
    // 为一个值设置新的选取
    select(editor,target) {
        const { selection } = editor
        target = Editor.range()
    }
}