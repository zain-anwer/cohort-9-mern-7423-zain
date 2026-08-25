import DOMPurify from 'dompurify'
import { Pin, PinOff, Archive, ArchiveRestore, Trash2 } from 'lucide-react'

export const NoteCard = ({title,content,onClick,isPinned,onPin,onArchive,onRestore,onDelete,isPermanentDelete}) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget)
                    return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <div className="mb-2 flex items-center justify-end gap-1">
                {
                    onPin && (
                        <button onClick={(e) => { e.stopPropagation(); onPin() }} aria-label={isPinned ? "Unpin note" : "Pin note"} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                            {isPinned ? <PinOff className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}
                        </button>
                    )
                }
                {
                    onArchive && (
                        <button onClick={(e) => { e.stopPropagation(); onArchive() }} aria-label="Archive note" className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                            <Archive className="h-4 w-4"/>
                        </button>
                    )
                }
                {
                    onRestore && (
                        <button onClick={(e) => { e.stopPropagation(); onRestore() }} aria-label="Restore note" className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                            <ArchiveRestore className="h-4 w-4"/>
                        </button>
                    )
                }
                {
                    onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete() }} aria-label={isPermanentDelete ? "Delete note permanently" : "Move note to bin"} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4"/>
                        </button>
                    )
                }
            </div>
            <h2 className="mb-1 truncate text-base font-medium text-gray-900 sm:text-lg">{title}</h2>
            <div
                className="line-clamp-3 text-sm text-gray-500 sm:line-clamp-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    )
}