import { GeneralTransforms } from './general'
import { TextTransforms } from './text'
import { SelectionTransforms } from './selection'

export const Transforms = {
    ...GeneralTransforms,
    ...TextTransforms,
    ...SelectionTransforms
}