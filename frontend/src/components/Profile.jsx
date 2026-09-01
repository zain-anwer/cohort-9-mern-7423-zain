import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import useAuthStore from "../stores/authStore"
import useProfileStore from "../stores/profileStore"
import { CircleX, Pencil, LockKeyhole, Camera, Trash2, UserRound, Mail} from "lucide-react"

export const Profile = ({onClose}) => {

    const user = useProfileStore((state) => state.user)
    const fetchUser = useProfileStore((state) => state.fetchUser)
    const initSocketListeners = useProfileStore((state) => state.initSocketListeners)
    const cleanSocketListeners = useProfileStore((state) => state.cleanSocketListeners)
    const changeName = useProfileStore((state) => state.changeName)
    const changePassword = useProfileStore((state) => state.changePassword)
    const updateProfilePicture = useProfileStore((state) => state.updateProfilePicture)
    const deleteProfilePicture = useProfileStore((state) => state.deleteProfilePicture)

    const logout = useAuthStore((state) => state.logout)

    const fileInputRef = useRef(null)

    const [editMode, setEditMode] = useState(null)
    const [newName, setNewName] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    useEffect(() => {
        const initialize = async () => {
            try {
                await fetchUser()
                initSocketListeners()
            }
            catch(error) {
                toast.error(error.response?.data?.message || "Something went wrong")
            }
        }

        initialize()

        return () => {
            cleanSocketListeners()
        }
    }, [])

    if (!user) {
        return null
    }

    const handleLogout = async() => {
        try {
            await logout()
            toast.success("Logged Out Successfully!")
        }
        catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }

    const handleNameChange = async() => {
        try {
            await changeName(newName)
            toast.success("Name Changed Successfully!")
            setEditMode(null)
        }
        catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }

    const handlePasswordChange = async() => {
        try {
            await changePassword(oldPassword,newPassword)
            await logout()
            toast.success("Password Changed Successfully!")
        }
        catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }

    const handleProfilePictureChange = async(event) => {
        const image = event.target.files?.[0]

        if (!image)
            return

        try {
            await updateProfilePicture(image)
            toast.success("Profile Picture Updated Successfully!")
        }
        catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }

        event.target.value = ""
    }

    const handleProfilePictureDelete = async() => {
        try {
            await deleteProfilePicture()
            toast.success("Profile Picture Removed Successfully!")
        }
        catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }

    const openNameEdit = () => {
        setNewName(user.name)
        setEditMode("name")
    }

    const openPasswordEdit = () => {
        setOldPassword("")
        setNewPassword("")
        setEditMode("password")
    }

    return (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full rounded-t-xl bg-white p-6 sm:w-[90%] sm:max-w-sm sm:rounded-xl">

                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <CircleX className="h-5 w-5"/>
                    </button>
                </div>

                {editMode === null && (
                    <>
                        <div className="mb-7 flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={user.profile_picture || "/profile-placeholder.png"}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Change profile picture"
                                    className="absolute bottom-0 right-0 rounded-full bg-gray-900 p-2 text-white hover:bg-gray-800"
                                >
                                    <Camera className="h-4 w-4"/>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                />
                            </div>

                            {user.profile_picture && (
                                <button
                                    type="button"
                                    onClick={handleProfilePictureDelete}
                                    aria-label="Remove profile picture"
                                    title="Remove profile picture"
                                    className="mt-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </button>
                            )}
                        </div>

                        <div className="mb-7 space-y-3">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
                                <UserRound className="h-4 w-4 shrink-0 text-gray-400"/>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Name
                                    </p>
                                    <p className="truncate text-sm font-medium text-gray-800 sm:text-base">
                                        {user.name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openNameEdit}
                                    aria-label="Change name"
                                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <Pencil className="h-4 w-4"/>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
                                <Mail className="h-4 w-4 shrink-0 text-gray-400"/>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Email
                                    </p>
                                    <p className="truncate text-sm text-gray-600 sm:text-base">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openPasswordEdit}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                            >
                                <LockKeyhole className="h-4 w-4"/>
                                Change Password
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}

                {editMode === "name" && (
                    <>
                        <div className="mb-6 flex items-center gap-2">
                            <UserRound className="h-5 w-5 text-gray-700"/>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Change Name
                            </h2>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="new-name" className="mb-2 block text-sm font-medium text-gray-700">
                                New Name
                            </label>

                            <input
                                id="new-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEditMode(null)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleNameChange}
                                className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Save
                            </button>
                        </div>
                    </>
                )}

                {editMode === "password" && (
                    <>
                        <div className="mb-6 flex items-center gap-2">
                            <LockKeyhole className="h-5 w-5 text-gray-700"/>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Change Password
                            </h2>
                        </div>

                        <div className="mb-6 flex flex-col gap-4">
                            <div>
                                <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>

                                <input
                                    id="current-password"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">
                                    New Password
                                </label>

                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEditMode(null)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handlePasswordChange}
                                className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Save
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}