import { Transforms } from "."
import { Editor } from "../interfaces/editor"
import { Point } from "../interfaces/point"
import { Range } from ".."

export const SelectionTransforms = {

	// 给新值设定一个selection
	select(editor, target) {
		const { selection } = editor
		target = Editor.range(editor, target)

		if (selection) {
			Transforms.setSelection(editor, target)
			return
		}

		if(!Range.isRange(target)) {
			throw new Error(
				`When setting the selection and the current selection is \`null\` you must provide at least an \`anchor\` and \`focus\`, but you passed: ${JSON.stringify(
				  target
				)}`
			  )
		}

		editor.apply({
			type: 'set_selection',
			properties: selection,
			newProperties: target
		})
	},
	// 设置新的属性在selection里
	setSelection(editor, props) {
		const { selection } = editor
		const oldProps = {}
		const newProps = {}
		if (!selection) {
			return
		}

		for (const k in props) {
			if (
				(k === 'anchor' &&
					props.anchor != null &&
					!Point.equals(props.anchor, selection.anchor)) ||
				(k === 'focus' &&
					props.focus != null &&
					!Point.equals(props.focus, selection.focus))
					(k !== 'anchor' && k !== 'focus' && props[k] !== selection[k])
			) {
				oldProps[k] = selection[k]
				newProps[k] = props[k]
			}
		}

		console.log(Object.keys(oldProps))
		if(Object.keys(oldProps).length > 0) {
			editor.apply({
				type: 'set_selection',
				properties: oldProps,
				newProperties: newProps
			})
		}
	}

}