import {Text} from "./text";
import {Element} from "./element";
export const Node = {
  isNode(value) {
    return Text.isText(value) || Element.isElement(value) 
  },
  isNodeList(value) {
    if (!Array.isArray(value)) {
      return false;
    }

    const isNodeList = value.every((val) => Node.isNode(val));
    return isNodeList;
  },
};
