import { create } from "zustand"
import { profileFetchService, profileNameChangeService,
    profilePasswordChangeService, profileDeleteService,
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

        socket.on('name:updation',(name_obj) => {
            if (!get().user)
                return
            set({user: {...get().user,name:name_obj.new_name}})
        })

        socket.on('picture:updation',(picture_obj) => {
            if (!get().user)
                return
            set({user: {...get().user,profile_picture:picture_obj.new_image}})
        })

        socket.on('picture:deletion',(obj) => {
            if (!get().user)
                return
            set({user: {...get().user,profile_picture:null}})
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
        try {
            const res = await profileFetchService()
            set({user:res.data.user})
        }
        catch(error) {
            throw error
        }
    },

    changeName: async (new_name) => {
        try {
            await profileNameChangeService(new_name)
            set({user: {...get().user,name:new_name}})
        }
        catch(error) {
            throw error
        }
    },

    changePassword: async (old_password,new_password) => {
        try {
            await profilePasswordChangeService(old_password,new_password)
            /* call logout and redirect to signin */
            /* still thinking about whether to do it here or in the modal */
        }
        catch(error) {
            throw error
        }
    },

    deleteAccount: async () => {
        try {
            await profileDeleteService()
            /* should logout immediately or manually delete the token perhaps and then just redirect to auth page??? idk */
        }
        catch(error) {
            throw error
        }
    },

    updateProfilePicture: async (image) => {
        try {
            const res = await profilePictureUpdateService(image)
            set({user: {...get().user,profile_picture:res.data.profile_picture}})
        }
        catch(error) {
            throw error
        }
    },

    deleteProfilePicture: async () => {
        try {
            await profilePictureDeleteService()
            set({user: {...get().user,profile_picture:null}})
        }
        catch(error) {
            throw error
        }
    }

}))

export default useProfileStore