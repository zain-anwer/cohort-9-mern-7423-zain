export const NoteCard = ({title,content,onClick}) => {
    return (
        <div onClick={onClick} className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <h2 className="mb-1 truncate text-base font-medium text-gray-900 sm:text-lg">{title}</h2>
            <div className="line-clamp-3 text-sm text-gray-500 sm:line-clamp-4" dangerouslySetInnerHTML={{ __html: content}}/>
        </div>
    )
}