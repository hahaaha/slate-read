import { Slate } from './components/slate';
import { Editable } from './components/editable';
import { createEditor } from './create-editor';

function App() {
  const editor = createEditor()
  const renderElement = props => <Element {...props} />
  const renderLeaf = props => <Leaf {...props} />

  return (
    <div className="App">
      <Slate editor={editor} value={initialValue}>
        <Editable 
          renderElement={renderElement}
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


const Leaf = ({attributes,children,leaf}) => {
  if(leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  return <span {...attributes}>{ children}</span>
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
      { text: 'rich', bold: true,italic:true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ]
  }
]

export default App;
