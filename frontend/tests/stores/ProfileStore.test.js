import useProfileStore from "../../src/stores/profileStore.js"
import {
    profileFetchService,
    profileNameChangeService,
    profilePasswordChangeService,
    profilePictureUpdateService,
    profilePictureDeleteService
} from "../../src/services/profileService.js"
import { getSocket } from "../../src/utils/socket"

jest.mock("../../src/services/profileService.js", () => ({
    profileFetchService: jest.fn(),
    profileNameChangeService: jest.fn(),
    profilePasswordChangeService: jest.fn(),
    profilePictureUpdateService: jest.fn(),
    profilePictureDeleteService: jest.fn()
}))

jest.mock("../../src/utils/socket", () => ({
    getSocket: jest.fn()
}))

const createMockSocket = () => {
    const handlers = {}
    return {
        on: jest.fn((event, cb) => { handlers[event] = cb }),
        off: jest.fn((event) => { delete handlers[event] }),
        trigger: (event, ...args) => handlers[event] && handlers[event](...args)
    }
}

beforeEach(() => {
    jest.clearAllMocks()
    useProfileStore.setState({ user: null })
})

describe("initSocketListeners", () => {
    it("does nothing when there is no socket", () => {
        getSocket.mockReturnValue(null)
        expect(() => useProfileStore.getState().initSocketListeners()).not.toThrow()
    })

    it("clears existing listeners before registering new ones", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.getState().initSocketListeners()
        expect(socket.off).toHaveBeenCalledWith("name:updation")
        expect(socket.off).toHaveBeenCalledWith("picture:updation")
        expect(socket.off).toHaveBeenCalledWith("picture:deletion")
        expect(socket.on).toHaveBeenCalledWith("name:updation", expect.any(Function))
        expect(socket.on).toHaveBeenCalledWith("picture:updation", expect.any(Function))
        expect(socket.on).toHaveBeenCalledWith("picture:deletion", expect.any(Function))
    })

    it("updates name on name:updation event when user exists", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.setState({ user: { name: "Old", profile_picture: null } })
        useProfileStore.getState().initSocketListeners()
        socket.trigger("name:updation", "New", "2024-01-01")
        expect(useProfileStore.getState().user.name).toBe("New")
    })

    it("ignores name:updation event when user is null", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.getState().initSocketListeners()
        socket.trigger("name:updation", "New", "2024-01-01")
        expect(useProfileStore.getState().user).toBeNull()
    })

    it("updates profile_picture on picture:updation event when user exists", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        useProfileStore.getState().initSocketListeners()
        socket.trigger("picture:updation", "new.png", "2024-01-01")
        expect(useProfileStore.getState().user.profile_picture).toBe("new.png")
    })

    it("ignores picture:updation event when user is null", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.getState().initSocketListeners()
        socket.trigger("picture:updation", "new.png", "2024-01-01")
        expect(useProfileStore.getState().user).toBeNull()
    })

    it("clears profile_picture on picture:deletion event when user exists", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        useProfileStore.getState().initSocketListeners()
        socket.trigger("picture:deletion", "2024-01-01")
        expect(useProfileStore.getState().user.profile_picture).toBeNull()
    })

    it("ignores picture:deletion event when user is null", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.getState().initSocketListeners()
        expect(() => socket.trigger("picture:deletion", "2024-01-01")).not.toThrow()
        expect(useProfileStore.getState().user).toBeNull()
    })
})

describe("cleanSocketListeners", () => {
    it("does nothing when there is no socket", () => {
        getSocket.mockReturnValue(null)
        expect(() => useProfileStore.getState().cleanSocketListeners()).not.toThrow()
    })

    it("turns off all listeners", () => {
        const socket = createMockSocket()
        getSocket.mockReturnValue(socket)
        useProfileStore.getState().cleanSocketListeners()
        expect(socket.off).toHaveBeenCalledWith("name:updation")
        expect(socket.off).toHaveBeenCalledWith("picture:updation")
        expect(socket.off).toHaveBeenCalledWith("picture:deletion")
    })
})

describe("fetchUser", () => {
    it("sets user on success", async () => {
        const user = { name: "John", profile_picture: null }
        profileFetchService.mockResolvedValue({ data: { user } })
        await useProfileStore.getState().fetchUser()
        expect(useProfileStore.getState().user).toEqual(user)
    })

    it("throws and leaves state unchanged on failure", async () => {
        const error = new Error("fetch failed")
        profileFetchService.mockRejectedValue(error)
        await expect(useProfileStore.getState().fetchUser()).rejects.toThrow("fetch failed")
        expect(useProfileStore.getState().user).toBeNull()
    })
})

describe("changeName", () => {
    it("updates the name on success", async () => {
        useProfileStore.setState({ user: { name: "Old", profile_picture: null } })
        profileNameChangeService.mockResolvedValue({})
        await useProfileStore.getState().changeName("New")
        expect(useProfileStore.getState().user.name).toBe("New")
    })

    it("throws and leaves the name unchanged on failure", async () => {
        useProfileStore.setState({ user: { name: "Old", profile_picture: null } })
        const error = new Error("name change failed")
        profileNameChangeService.mockRejectedValue(error)
        await expect(useProfileStore.getState().changeName("New")).rejects.toThrow("name change failed")
        expect(useProfileStore.getState().user.name).toBe("Old")
    })
})

describe("changePassword", () => {
    it("resolves without changing state on success", async () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: null } })
        profilePasswordChangeService.mockResolvedValue({})
        await useProfileStore.getState().changePassword("old123", "new456")
        expect(profilePasswordChangeService).toHaveBeenCalledWith("old123", "new456")
        expect(useProfileStore.getState().user).toEqual({ name: "Name", profile_picture: null })
    })

    it("throws on failure", async () => {
        const error = new Error("password change failed")
        profilePasswordChangeService.mockRejectedValue(error)
        await expect(useProfileStore.getState().changePassword("old123", "new456")).rejects.toThrow("password change failed")
    })
})

describe("updateProfilePicture", () => {
    it("updates profile_picture on success", async () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: null } })
        profilePictureUpdateService.mockResolvedValue({ data: { profile_picture: "new.png" } })
        const image = new File(["content"], "avatar.png", { type: "image/png" })
        await useProfileStore.getState().updateProfilePicture(image)
        expect(useProfileStore.getState().user.profile_picture).toBe("new.png")
    })

    it("throws and leaves profile_picture unchanged on failure", async () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        const error = new Error("picture update failed")
        profilePictureUpdateService.mockRejectedValue(error)
        const image = new File(["content"], "avatar.png", { type: "image/png" })
        await expect(useProfileStore.getState().updateProfilePicture(image)).rejects.toThrow("picture update failed")
        expect(useProfileStore.getState().user.profile_picture).toBe("old.png")
    })
})

describe("deleteProfilePicture", () => {
    it("clears profile_picture on success", async () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        profilePictureDeleteService.mockResolvedValue({})
        await useProfileStore.getState().deleteProfilePicture()
        expect(useProfileStore.getState().user.profile_picture).toBeNull()
    })

    it("throws and leaves profile_picture unchanged on failure", async () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        const error = new Error("picture delete failed")
        profilePictureDeleteService.mockRejectedValue(error)
        await expect(useProfileStore.getState().deleteProfilePicture()).rejects.toThrow("picture delete failed")
        expect(useProfileStore.getState().user.profile_picture).toBe("old.png")
    })
})

describe("clearUser", () => {
    it("resets user to null", () => {
        useProfileStore.setState({ user: { name: "Name", profile_picture: "old.png" } })
        useProfileStore.getState().clearUser()
        expect(useProfileStore.getState().user).toBeNull()
    })

    it("is a no-op when user is already null", () => {
        useProfileStore.setState({ user: null })
        useProfileStore.getState().clearUser()
        expect(useProfileStore.getState().user).toBeNull()
    })
})