
// 返回一个dom node的 host window
export const getDefaultView = (value) => {
    return (
        (value && value.ownerDocument && value.ownerDocument.defaultView) || null
    )
}

// 检查一个值是不是dom selection
export const isDOMNode = (value) => {
    const window = getDefaultView(value)
    return !!window && value instanceof window.Node
}

export const isDOMElement = (value) => {
    return isDOMNode(value) && value.nodeType === 1
}