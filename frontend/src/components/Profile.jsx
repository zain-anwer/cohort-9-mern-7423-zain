import toast from "react-hot-toast"
import useAuthStore from "../stores/authStore"
import useProfileStore from "../stores/profileStore"
import { CircleX } from "lucide-react"

export const Profile = ({onClose}) => {
    
    const user = useProfileStore((state) => state.user)
    const initSocketListeners = useProfileStore((state) => state.initSocketListeners)
    const cleanSocketListeners = useProfileStore((state) => state.cleanSocketListeners)
    const changeName = useProfileStore((state) => state.changeName)
    const changePassword = useProfileStore((state) => state.changePassword)
    const deleteAccount = useProfileStore((state) => state.deleteAccount)
    const updateProfilePicture = useProfileStore((state) => state.updateProfilePicture)
    const deleteProfilePicture = useProfileStore((state) => state.deleteProfilePicture)
    
    useEffect(() => {
        const initialize = async () => {
            await fetchUser()
            initSocketListeners()
        }

        initialize()

        return () => {
            cleanSocketListeners()
        }
    }, [])

    const logout = useAuthStore((state) => state.logout)

    const handleLogout = async() => {
        try {
            await logout()
            toast.success('Logged Out Successfully!')
        }
        catch(error) {
            toast.error(error.response?.data?.message || "something went wrong")
        }
    }

    return (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full rounded-t-xl bg-white p-6 sm:w-[90%] sm:max-w-sm sm:rounded-xl">

                <div className="mb-4 flex justify-end">
                    <button type='button' onClick={onClose} aria-label="Close" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                        <CircleX className="h-5 w-5"/>
                    </button>
                </div>

                <img
                    src="/profile-placeholder.png"
                    alt="Profile"
                    className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
                />

                <div className="mb-6 flex flex-col gap-2">
                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">Name: {user.name}</h3>
                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">Email: {user.email}</h3>
                </div>

                <button type='button' onClick={handleLogout} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:text-base">
                    logout
                </button>

            </div>
        </div>
    )
}