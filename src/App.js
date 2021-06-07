import { Slate } from './components/slate';
import { Editable } from './components/editable';
import { createEditor } from './create-editor';
import { useCallback, useState } from 'react';
import { withReact } from './plugin/with-react';

function App() {
  const [value, setValue] = useState(initialValue)
  const editor = withReact(createEditor())
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props =><Leaf {...props} />, [])
  const changeEvent = value => {
    setValue(value)
    console.log(value)
  }

  return (
    <div className="App">
      <Slate editor={editor} value={value} onChange={changeEvent}>
        <Editable
          renderElement={renderElement}
          onKeyDown={event => {
            if (event.key === "&") {
              console.log("test insert")
              // Prevent the ampersand character from being inserted.
              event.preventDefault()
              // Execute the `insertText` method when the event occurs.
              editor.insertText('and')

            }
          }}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  );
}


const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    default:
      return <p {...attributes}>{children}</p>
  }
}


const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  return <span {...attributes}>{children}</span>
}


const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true, italic: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ]
  }
]

export default App;
