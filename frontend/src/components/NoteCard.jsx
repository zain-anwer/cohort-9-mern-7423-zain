import DOMPurify from 'dompurify'

export const NoteCard = ({title,content,onClick}) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <h2 className="mb-1 truncate text-base font-medium text-gray-900 sm:text-lg">{title}</h2>
            <div
                className="line-clamp-3 text-sm text-gray-500 sm:line-clamp-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    )
}