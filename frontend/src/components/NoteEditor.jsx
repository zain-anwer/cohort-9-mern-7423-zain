import { useState , useRef, useEffect } from 'react'
import { CircleX, Pencil, Trash2 } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import toast from 'react-hot-toast'

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['clean']
    ]
}

export const NoteEditor = ({note,onSave,onDelete,onClose,isReadOnly,setIsReadOnly}) => {

    const [title,setTitle] = useState(note?.title ?? "Untitled")
    const [content,setContent] = useState(note?.content ?? "")
    const [isSaving,setIsSaving] = useState("")

    /* use effect to change note title and content if some other note is selecteddd */
    useEffect(() => {
        setTitle(note?.title ?? "Untitled")
        setContent(note?.content ?? "")
    },[note._id])

    /* this is to make it auto save after user inactivity and mismatch for a full second */

    const saveIdRef = useRef(0)

    useEffect(() => {
        if (isReadOnly) 
            return
        if (title == note.title && content == note.content)
            return

        setIsSaving("saving...")
        const timeout = setTimeout(async() => {
            const thisSaveId = ++saveIdRef.current
            try {
                const updated = await onSave(note._id,{...note,title:title,content:content})
                if (thisSaveId === saveIdRef.current) {
                    setIsSaving("saved")
                }
            }
            catch(error) {
                if (thisSaveId === saveIdRef.current) {
                    toast.error(error.response?.data?.message || "something went wrong")
                }
            }
        },1000)

        return () => clearTimeout(timeout)

    },[title,content,isReadOnly,note])

    /* handlerss */

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
                    <div className="flex items-center gap-2">
                        <button onClick={handleClose} aria-label="Close" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><CircleX className="h-5 w-5"/></button>
                        <span className="text-xs text-gray-400">{isSaving}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {
                            isReadOnly && (
                                <button onClick={handleModeChange} aria-label="Edit note" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                                    <Pencil className="h-4 w-4"/>
                                </button>
                            )
                        }
                        <button onClick={handleDeletion} aria-label="Delete note" className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5"/></button>
                    </div>
                </div>
                <input type='text' value={title} readOnly={isReadOnly} onChange={handleTitleChange} className={`mb-3 w-full border-b border-gray-200 pb-2 text-lg font-medium text-gray-900 sm:text-xl ${isReadOnly ? '' : 'focus:border-gray-900 focus:outline-none'}`}/>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ReactQuill
                        value={content}
                        onChange={handleContentChange}
                        theme="snow"
                        readOnly={isReadOnly}
                        modules= {isReadOnly ? {toolbar : false} : modules}
                    />
                </div>
            </div>
        </div>
    )
}