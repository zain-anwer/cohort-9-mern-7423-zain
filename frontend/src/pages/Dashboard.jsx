import { useState, useEffect } from "react"
import useAuthStore from "../stores/authStore"
import useNoteStore from "../stores/noteStore"
import { StickyNotePlus } from "lucide-react"

/* this helper function will remove html tags from rich text produced by quill */
const stripHtml = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
}


const NoteCard = ({title,content,onClick}) => {
    return (
        <div onClick={onClick}>
            <h2>{title}</h2>
            <p>{content}</p>
        </div>
    )
}
const Profile = ({name,email}) => {
    const logout = useAuthStore((state) => state.logout)
    return (
        <>
            <h3>Name: {name}</h3>
            <h3>Email: {email}</h3>
            <button onClick={logout}>logout</button>
        </>
    )
}
const NoteEditor = () => {}

export const Dashboard = () => {

    const user = useAuthStore((state) => state.user)
    const notes = useNoteStore((state) => state.notes)
    const getAllNotes = useNoteStore((state) => state.getAllNotes)
    const createNote = useNoteStore((state) => state.createNote)

    const [filteredNotes,setFilteredNotes] = useState(notes)
    const [query,setQuery] = useState("")
    const [selectedNote,setSelectedNote] = useState(null)
    /* this state will control the appearance of the editor modal */
    const [isEditorOpen,setIsEditorOpen] = useState(false)
    /* and this state will control the appearance of the profile modal */
    const [isProfileOpen,setIsProfileOpen] = useState(false)

    /* these are used to run certain functions at the time the component renders */
    /* it takes a function and a dependency array that reruns the hook if the value of something in it changes */
    useEffect(() => {
        getAllNotes()
    },[])

    /* this is to keep updating results even when note list changes */
    useEffect(() => {
        const trimmedQuery = query.trim()

        if (trimmedQuery) {
            const result = notes.filter((note) => {
                const normalized_title = stripHtml(note.title).toLowerCase()
                const normalized_content = stripHtml(note.content).toLowerCase()

                return (
                    normalized_content.includes(trimmedQuery.toLowerCase()) ||
                    normalized_title.includes(trimmedQuery.toLowerCase())
                )
            })

            setFilteredNotes(result)
        }
        else {
            setFilteredNotes(notes)
        }
    }, [notes])

    const handleNoteClick = (note) => {
        setIsEditorOpen(true)
        setSelectedNote(note)
    }

    const handleNoteCreation = () => {
        /* should open a modal where you could write a note with autosave */
    }

    const handleProfile = () => {
        /* should open a modal with user details probably an image and a logout button */
        setIsProfileOpen(true)
    }

    const handleQuery = (e) => {
        setQuery(e.target.value)
        /* react state changes are asynchronous hence use value directly */
        const trimmedQuery = e.target.value.trim()

        if (trimmedQuery) {
            const result = notes.filter((note) => {
                const normalized_title   = stripHtml(note.title).toLowerCase()
                const normalized_content = stripHtml(note.content).toLowerCase()
                return (
                    normalized_content.includes(trimmedQuery) || normalized_title.includes(trimmedQuery)
                )
            })
            setFilteredNotes(result)
        }
        else {
            setFilteredNotes(notes)
        }
    }

    return (
       <>
            <h1>Scribble Dashboard</h1>
            <button onClick={handleProfile}>profile</button>
            <input type="search" value={query} onChange={handleQuery}/>
            {
                filteredNotes.map((note) => 
                    <NoteCard onClick={() => handleNoteClick(note)} key={note._id} title={note.title} content={note.content}/>)
            }
            <button onClick={handleNoteCreation}>
                <StickyNotePlus/>
            </button>
       </>
    )
}
