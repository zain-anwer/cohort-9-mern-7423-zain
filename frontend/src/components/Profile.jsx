import useAuthStore from "../stores/authStore"

export const Profile = ({name,email,onClose}) => {
    const logout = useAuthStore((state) => state.logout)
    return (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full rounded-t-xl bg-white p-6 sm:w-[90%] sm:max-w-sm sm:rounded-xl">
                <div className="mb-4 flex justify-end">
                    <button onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><CircleX className="h-5 w-5"/></button>
                </div>
                <div className="mb-6 flex flex-col gap-2">
                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">Name: {name}</h3>
                    <h3 className="text-sm text-gray-500 sm:text-base">Email: {email}</h3>
                </div>
                <button onClick={logout} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:text-base">logout</button>
            </div>
        </div>
    )
}