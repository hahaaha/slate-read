const String = (props) =>{
    const {text} = props
    
    return <TextString text={text}/>
}

const TextString = (props) => {
    const {text} = props
    return (
        <span data-slate-string>
            {text}
        </span>
    )
}

export default String