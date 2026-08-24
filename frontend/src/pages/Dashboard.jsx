/* practices implemented :) */
/* will replace edit with restore in bin editor and permanent delete option */
/* archive will function just as is so nothing to change */
/* pin will just cause reordering in the dashboard view */


import { useState, useEffect, useMemo } from "react"
import { CircleUserRound , StickyNotePlus, Search, Files, Pin, Archive, Trash2 } from "lucide-react"
import { NoteEditor } from "../components/NoteEditor"
import { NoteCard } from "../components/NoteCard"
import { Profile } from "../components/Profile"
import toast from "react-hot-toast"

import useAuthStore from "../stores/authStore"
import useNoteStore from "../stores/noteStore"
import _default from "dompurify"

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
    const initSocketListeners = useNoteStore((state) => state.initSocketListeners)
    const cleanSocketListeners = useNoteStore((state) => state.cleanSocketListeners)

    const [query,setQuery] = useState("")
    const [selectedNote,setSelectedNote] = useState(null)

    /* states to manage the note editor modal and view */

    const [isEditorOpen,setIsEditorOpen] = useState(false)
    const [isProfileOpen,setIsProfileOpen] = useState(false)
    const [isReadOnly,setIsReadOnly] = useState(false)
    const [view,setView] = useState('all')                      // all, binned, archived, pinned
    
    const filteredNotes = useMemo(() => {
        
        /* applying view */
        let results = notes.filter((note) => {
            switch(view) {
                case 'binned':    return note.is_binned && !note.is_archived && !note.is_pinned
                case 'archived':  return note.is_archived && !note.is_binned && !note.is_pinned
                case 'pinned':    return note.is_pinned && !note.is_binned && !note.is_archived
                default:          return !note.is_archived && !note.is_binned
            }
        })

        /* applying query (stripping, lowercasing, searching blah blah) */
        results = results.filter((note) => {
            const normalized_content = stripHtml(note.content.trim().toLowerCase())
            const normalized_title   = stripHtml(note.title.trim().toLowerCase())
            const normalized_query   = query.trim().toLowerCase()
            return(normalized_content.includes(normalized_query) || normalized_title.includes(normalized_query))
        })

        results = results.sort((a,b) => {
            switch(view) {
                case 'binned':   return new Date(a.binned_at) - new Date(b.binned_at)
                case 'archived': return new Date(a.archived_at) - new Date(b.archived_at)
                case 'pinned':   return new Date(a.pinned_at) - new Date(b.pinned_at)
                default: 
                    if (a.is_pinned !== b.is_pinned) 
                        return b.is_pinned - a.is_pinned

                    if (a.is_pinned) 
                        return new Date(b.pinned_at) - new Date(a.pinned_at)
            
                    return new Date(b.updatedAt) - new Date(a.updatedAt)   
            }
        })
        return results

    },[notes,view,query])

    
    /* runs on every rerender --- useful cause notes will be [] when component mounts */
    useEffect(() => {
        const loadNotes = async () => {
            try {
                await getAllNotes()
            }
            catch(error) {
                toast.error(error.response?.data?.message || 'failed to load notes')
            }
        }
        loadNotes()
        initSocketListeners()

        return () => cleanSocketListeners()
    },[])    

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
            throw error
        } 
    }

    const togglePin = async(note) => {
        try {
            await updateNote(note._id,{...note,is_pinned:!note.is_pinned})
            setIsEditorOpen(false)
        }
        catch(error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        }
    }

    const archiveNote = async(note) => {
        try {
            await updateNote(note._id,{...note,is_archived:true,is_pinned:false})
            toast.success('Note archived')
        }
        catch(error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        }
    }

    const restoreNote = async(note) => {
        try {
            const patch = view === 'archived' ? {is_archived:false} : {is_binned:false}
            await updateNote(note._id,{...note,...patch})
            setIsEditorOpen(false)
            toast.success('Note restored')
        }
        catch(error) {
            toast.error(error.response?.data?.message || 'something went wrong')
        }
    }

    const handleNoteDeletion = async(note) => {
        try {
            if (view === 'binned') {
                await deleteNote(note._id)
            }
            else {
                await updateNote(note._id,{...note,is_binned:true,is_pinned:false})
            }
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
    }

    return (
       <>
            <div className="flex min-h-screen">
                <nav className="sticky top-0 flex h-screen w-16 flex-col items-center gap-2 border-r border-gray-100 bg-white py-4 sm:w-20">
                    <button onClick={() => setView('all')} aria-label="All notes" className={`rounded-md p-2 ${view === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Files className="h-5 w-5"/>
                    </button>
                    <button onClick={() => setView('pinned')} aria-label="Pinned notes" className={`rounded-md p-2 ${view === 'pinned' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Pin className="h-5 w-5"/>
                    </button>
                    <button onClick={() => setView('archived')} aria-label="Archived notes" className={`rounded-md p-2 ${view === 'archived' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Archive className="h-5 w-5"/>
                    </button>
                    <button onClick={() => setView('binned')} aria-label="Binned notes" className={`rounded-md p-2 ${view === 'binned' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Trash2 className="h-5 w-5"/>
                    </button>
                </nav>
                <div
                    className="min-h-screen flex-1 bg-gray-50 pb-24 sm:pb-8"
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
                                <NoteCard
                                    onClick={() => handleNoteClick(note)}
                                    key={note._id}
                                    title={note.title}
                                    content={note.content}
                                    isPinned={note.is_pinned}
                                    onPin={() => togglePin(note)}
                                    onArchive={view === 'all' ? () => archiveNote(note) : undefined}
                                    onRestore={view !== 'all' ? () => restoreNote(note) : undefined}
                                    onDelete={() => handleNoteDeletion(note)}
                                    isPermanentDelete={view === 'binned'}
                                />)
                        }
                    </div>
                    <button onClick={handleNoteCreation} aria-label="Create note" className="fixed bottom-6 right-6 rounded-full bg-gray-900 p-4 text-white shadow-lg hover:bg-gray-800 sm:bottom-8 sm:right-8">
                        <StickyNotePlus className="h-5 w-5"/>
                    </button>
                </div>
            </div>
            {
                isEditorOpen && 
                (
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleNoteUpdate}
                        onDelete={handleNoteDeletion}
                        onPin={() => togglePin(selectedNote)}
                        onArchive={view === 'all' ? () => archiveNote(selectedNote) : undefined}
                        onRestore={view !== 'all' ? () => restoreNote(selectedNote) : undefined}
                        isPermanentDelete={view === 'binned'}
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