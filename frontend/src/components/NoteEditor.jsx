import { useState , useEffect } from 'react'
import { CircleX, Pencil, Trash2 } from 'lucide-react'
import ReactQuill from 'react-quill-new'

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['clean']
    ]
}

/* replacing the or operator with nullish ones cause this doesn't choose alternative on empty strings */
export const NoteEditor = ({note,onSave,onDelete,onClose,isReadOnly,setIsReadOnly}) => {

    const [title,setTitle] = useState(note?.title ?? "Untitled")
    const [content,setContent] = useState(note?.content ?? "")

    /* useEffects */

    useEffect(() => {
        setTitle(note?.title ?? "Untitled")
        setContent(note?.content ?? "")
    },[note._id])

    useEffect(() => {
        
        if (isReadOnly) 
            return
        if (title == note.title && content == note.content)
            return

        const timeout = setTimeout(() => {
            onSave(note._id,{...note,title:title,content:content})
        },1000)

        return () => clearTimeout(timeout)

    },[title,content,isReadOnly,note])

    /* handlers */
    const handleTitleChange = (e) => {
        setTitle(e.target.value)
    }
    const handleContentChange = (new_content) => {
        setContent(new_content)
    }
    const handleModeChange = () => {
        setIsReadOnly(false)
    }
    const handleDeletion = () => {
        onDelete(note._id)
    }
    const handleClose = () => {
        onClose()
    }

    return (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="flex h-full w-full flex-col bg-white p-4 sm:h-auto sm:max-h-[85vh] sm:w-[90%] sm:max-w-2xl sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <button onClick={handleClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><CircleX className="h-5 w-5"/></button>
                    <button onClick={handleDeletion} className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5"/></button>
                </div>
                <input type='text' value={title} onChange={handleTitleChange} className="mb-3 w-full border-b border-gray-200 pb-2 text-lg font-medium text-gray-900 focus:border-gray-900 focus:outline-none sm:text-xl"/>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ReactQuill
                        value={content}
                        onChange={handleContentChange}
                        theme="snow"
                        readOnly={isReadOnly}
                        modules= {isReadOnly ? {toolbar : false} : modules}
                    />
                </div>
                {
                    isReadOnly && (
                        <button onClick={handleModeChange} className="mt-3 self-end rounded-md bg-gray-900 p-2.5 text-white hover:bg-gray-800">
                            <Pencil className="h-4 w-4"/>
                        </button>
                    )
                }
            </div>
        </div>
    )
}