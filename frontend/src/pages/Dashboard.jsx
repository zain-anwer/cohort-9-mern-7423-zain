import { useState, useEffect } from "react"
import { CircleUserRound , StickyNotePlus, Search } from "lucide-react"
import { NoteEditor } from "../components/NoteEditor"
import { NoteCard } from "../components/NoteCard"
import { Profile } from "../components/Profile"
import toast from "react-hot-toast"

import useAuthStore from "../stores/authStore"
import useNoteStore from "../stores/noteStore"

/* this helper function will remove html tags from rich text produced by quill */
const stripHtml = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
}

export const Dashboard = () => {

    const user = useAuthStore((state) => state.user)
    const notes = useNoteStore((state) => state.notes)
    const getAllNotes = useNoteStore((state) => state.getAllNotes)
    const createNote = useNoteStore((state) => state.createNote)
    const updateNote = useNoteStore((state) => state.updateNote)
    const deleteNote = useNoteStore((state) => state.deleteNote)

    const [filteredNotes,setFilteredNotes] = useState(notes)
    const [query,setQuery] = useState("")
    const [selectedNote,setSelectedNote] = useState(null)

    /* states to manage the note editor modall */

    const [isEditorOpen,setIsEditorOpen] = useState(false)
    const [isProfileOpen,setIsProfileOpen] = useState(false)
    const [isReadOnly,setIsReadOnly] = useState(false)

    /* runs on every rerender --- useful cause notes will be [] when component mounts */
    useEffect(() => {
        getAllNotes()
    },[])

    /* this is to keep updating results even when note list changes */
    useEffect(() => {
        
        const trimmedQuery = query.trim().toLowerCase()

        if (trimmedQuery) {
            const result = notes.filter((note) => {
                const normalized_title = stripHtml(note.title).toLowerCase()
                const normalized_content = stripHtml(note.content).toLowerCase()

                return (
                    normalized_content.includes(trimmedQuery) ||
                    normalized_title.includes(trimmedQuery)
                )
            })

            setFilteredNotes(result)
        }
        /* trimmed query is empty string so just set it to all notes */
        else {
            setFilteredNotes(notes)
        }
    }, [notes,query])

    /* should open modal in read mode by default but can be switched to write mode */
    const handleNoteClick = (note) => {
        setIsEditorOpen(true)
        setSelectedNote(note)
        setIsReadOnly(true)
    }

    /* should create an empty note and open modal in write mode regularly updating value */
    const handleNoteCreation = async() => {
        try {
            const created_note = await createNote({title:"Untitled",content:""})
            toast.success('created and opened a new note successfully')
            
            setIsReadOnly(false)
            setSelectedNote(created_note)
            setIsEditorOpen(true)
        }
        catch(error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        }
    }

    /* auto save handler that is called after a successful 1 second timeoutt */
    const handleNoteUpdate = async(note_id,note) => {
        try {
            const updated_note = await updateNote(note_id,note)
            setSelectedNote(updated_note)
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        } 
    }

    const handleNoteDeletion = async(note_id) => {
        try {
            await deleteNote(note_id)
            setIsEditorOpen(false)
            setSelectedNote(null)
            toast.success('Note Deletion Successful')
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        }
    } 

    /* profile handler -- when someone clicks on profile button */
    const handleProfile = () => {
        /* should open a modal with user details probably an image and a logout button */
        setIsProfileOpen(true)
    }

    /* search handler -- fires when search bar record an event */
    const handleQuery = (e) => {
        setQuery(e.target.value)
        /* react state changes are asynchronous hence use value directly */
        const trimmedQuery = e.target.value.trim().toLowerCase()

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
            <div
                className="min-h-screen bg-gray-50 pb-24 sm:pb-8"
                style={{
                    backgroundImage: "url('/dashboard-bg.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "900px auto",
                }}
            >
                <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                    <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Scribble Dashboard</h1>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="relative w-48 sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="search"
                                value={query}
                                onChange={handleQuery}
                                placeholder="Search notes"
                                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 sm:text-base"
                            />
                        </div>
                        <button onClick={handleProfile} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">profile<CircleUserRound className="h-5 w-5"/></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:p-8 xl:grid-cols-4">
                    {
                        filteredNotes.map((note) => 
                            <NoteCard onClick={() => handleNoteClick(note)} key={note._id} title={note.title} content={note.content}/>)
                    }
                </div>
                <button onClick={handleNoteCreation} aria-label="Create note" className="fixed bottom-6 right-6 rounded-full bg-gray-900 p-4 text-white shadow-lg hover:bg-gray-800 sm:bottom-8 sm:right-8">
                    <StickyNotePlus className="h-5 w-5"/>
                </button>
            </div>
            {
                isEditorOpen && 
                (
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleNoteUpdate}
                        onDelete={handleNoteDeletion}
                        onClose= {() => 
                        {
                            setIsEditorOpen(false)
                            setSelectedNote(null)
                        }}
                        isReadOnly={isReadOnly}
                        setIsReadOnly={setIsReadOnly}
                    />
                ) 
            }
            {
                isProfileOpen && <Profile 
                                    name={user.name} 
                                    email={user.email} 
                                    onClose={() => {setIsProfileOpen(false)}}/>
            }
       </>
    )
}