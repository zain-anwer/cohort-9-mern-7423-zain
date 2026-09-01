import { create } from "zustand"
import { profileFetchService, profileNameChangeService,
    profilePasswordChangeService,
    profilePictureUpdateService, profilePictureDeleteService
} from "../services/profileService.js"
import { getSocket } from "../utils/socket"

const useProfileStore = create((set,get) => ({

    user: null,

    initSocketListeners: () => {
        let socket = getSocket()
        if (!socket)
            return

        socket.off('name:updation')
        socket.off('picture:updation')
        socket.off('picture:deletion')

        socket.on('name:updation', (new_name, updated_at) => {
            if (!get().user)
                return
            set({user: {...get().user, name: new_name}})
        })

        socket.on('picture:updation', (new_image, updated_at) => {
            if (!get().user)
                return
            set({user: {...get().user, profile_picture: new_image}})
        })

        socket.on('picture:deletion', (updated_at) => {
            if (!get().user)
                return
            set({user: {...get().user, profile_picture: null}})
        })
    },

    cleanSocketListeners: () => {
        let socket = getSocket()
        if (!socket)
            return
        socket.off('name:updation')
        socket.off('picture:updation')
        socket.off('picture:deletion')
    },

    fetchUser: async () => {
        const res = await profileFetchService()
        set({user:res.data.user})
    },

    changeName: async (new_name) => {
        await profileNameChangeService(new_name)
        set({user: {...get().user,name:new_name}})
    },

    changePassword: async (old_password,new_password) => {
        await profilePasswordChangeService(old_password,new_password)
    },

    updateProfilePicture: async (image) => {
        const res = await profilePictureUpdateService(image)
        set({user: {...get().user,profile_picture:res.data.profile_picture}})
    },

    deleteProfilePicture: async () => {
        await profilePictureDeleteService()
        set({user: {...get().user,profile_picture:null}})
    },

    clearUser: () => {
        set({user: null})
    }

}))

export default useProfileStore