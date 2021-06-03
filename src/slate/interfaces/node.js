import { Text } from "./text";
import { Element } from "./element";
import { Path } from "./path";
export const Node = {
  isNode(value) {
    return Text.isText(value) || Element.isElement(value)
  },

  /**
   * 获取后代节点根据指定的path，如果path是空数组，将会指向根节点
   */
  get(root, path) {
    let node = root

    for (let i = 0; i < path.length; i++) {
      const p = path[i]

      if (Text.isText(node) || !node.children[p]) {
        throw new Error(
          `Cannot find a descendant at path [${path}] in node: ${JSON.stringify(
            root
          )}`
        )
      }

      node = node.children[p]
    }
    return node
  },
  isNodeList(value) {
    if (!Array.isArray(value)) {
      return false;
    }

    const isNodeList = value.every((val) => Node.isNode(val));
    return isNodeList;
  },
  // 获取第一个node入口
  first(root, path) {
    const p = path.slice()
    let n = Node.get(root, p)

    while (n) {
      if (Text.isText(n) || n.children.length === 0) {
        break
      } else {
        n = n.children[0]
        p.push(0)
      }
    }
    return [n, p]
  },

  last(root, path) {
    const p = path.slice()
    let n = Node.get(root, p)

    while (n) {
      if (Text.isText(n) || n.children.length === 0) {
        break
      } else {
        const i = n.children.length - 1
        n = n.children[i]
        p.push(i)
      }
    }
    return [n, p]

  },

  *levels(root, path, options) {
    for (const p of Path.levels(path, options)) {
      const n = Node.get(root, p)
      yield [n, p]
    }
  },

  parent(root, path) {
    const parentPath = Path.parent(path)
    const p = Node.get(root, parentPath)

    if (Text.isText(p)) {
      throw new Error(
        `Cannot get the parent of path [${path}] because it does not exist in the root.`
      )
    }

    return p
  },

  // 获取指定路径的节点，确认它是不是leaf的文本node
  leaf(root, path) {
    const node = Node.get(root, path)

    if (!Text.isText(node)) {
      throw new Error(
        `Cannot get the leaf node at path [${path}] because it refers to a non-leaf node: ${node}`
      )
    }

    return node
  }
};
