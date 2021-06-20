
// 返回一个dom node的 host window
export const getDefaultView = (value) => {
    return (
        (value && value.ownerDocument && value.ownerDocument.defaultView) || null
    )
}

// 检查一个value是不是dom 节点
export const isDOMNode = (value) => {
    const window = getDefaultView(value)
    return !!window && value instanceof window.Node
}

export const isDOMElement = (value) => {
    return isDOMNode(value) && value.nodeType === 1
}

export const isDOMComment = (value) => {
    return isDOMNode(value) && value.nodeType === 1
}

export const isDOMSelection = (value) => {
    const window = value && value.anchorNode && getDefaultView(value.anchorNode)
    return !!window && value instanceof window.Selection
}

// 标准化dom point 让其总是引用text node
export const normalizeDOMPoint = (domPoint) => {
    let [node, offset] = domPoint

    // 如果node是一个Element node, 说明它的offset指向的是children中错误的节点
    // 所以要尝试找到正确的文字节点
    if (isDOMElement(node) && node.childNodes.length) {
        let isLast = offset === node.childNodes.length
        let index = isLast ? offset - 1 : offset
            ;[node, index] = getEditableChildAndIndex(
                node,
                index,
                isLast ? 'backward' : 'forward'
            )
        // If the editable child found is in front of input offset, we instead seek to its end
        isLast = index < offset

        // If the node has children, traverse until we have a leaf node. Leaf nodes
        // can be either text nodes, or other void DOM nodes.
        while (isDOMElement(node) && node.childNodes.length) {
            const i = isLast ? node.childNodes.length - 1 : 0
            node = getEditableChild(node, i, isLast ? 'backward' : 'forward')
        }

        // Determine the new offset inside the text node.
        offset = isLast && node.textContent != null ? node.textContent.length : 0
    }

    // Return the node and offset.
    return [node, offset]
}

export const getEditableChildAndIndex = (parent, index, direction) => {
    const { childNodes } = parent
    let child = childNodes[index]
    let i = index
    let triedForward = false
    let triedBackward = false

    while (
        isDOMComment(child) ||
        (isDOMElement(child) && child.childNodes.length === 0) ||
        (isDOMElement(child) && child.getAttribute('contenteditable') === 'false')
    ) {
        if (triedBackward && triedForward) {
            break
        }

        if (i >= childNodes.length) {
            triedForward = true
            i = index - 1
            direction = 'backward'
            continue
        }

        if (i < 0) {
            triedBackward = true
            i = index + 1
            direction = 'forward'
            continue
        }

        child = childNodes[i]
        index = i
        i += direction === 'forward' ? 1 : -1
    }

    return [child, index]
}

export const getEditableChild = (
    parent, index, direction
) => {
    const [child] = getEditableChildAndIndex(parent, index, direction)
    return child
}