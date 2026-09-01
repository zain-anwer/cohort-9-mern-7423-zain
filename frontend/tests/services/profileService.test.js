import axiosInstance from "../../src/utils/axios.js"
import {
    profileFetchService,
    profileNameChangeService,
    profilePasswordChangeService,
    profilePictureUpdateService,
    profilePictureDeleteService
} from "../../src/services/profileService.js"

jest.mock("../../src/utils/axios.js", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}))

beforeEach(() => {
    jest.clearAllMocks()
})

describe("profileFetchService", () => {
    it("calls GET /profile/ and returns response", async () => {
        const mockRes = { data: { user: { name: "John" } } }
        axiosInstance.get.mockResolvedValue(mockRes)
        const res = await profileFetchService()
        expect(axiosInstance.get).toHaveBeenCalledWith("/profile/")
        expect(res).toBe(mockRes)
    })

    it("throws when axios rejects", async () => {
        const error = new Error("network error")
        axiosInstance.get.mockRejectedValue(error)
        await expect(profileFetchService()).rejects.toThrow("network error")
    })
})

describe("profileNameChangeService", () => {
    it("calls PUT /profile/name/ with new_name", async () => {
        const mockRes = { data: {} }
        axiosInstance.put.mockResolvedValue(mockRes)
        const res = await profileNameChangeService("Jane")
        expect(axiosInstance.put).toHaveBeenCalledWith("/profile/name/", { new_name: "Jane" })
        expect(res).toBe(mockRes)
    })

    it("throws when axios rejects", async () => {
        const error = new Error("failed")
        axiosInstance.put.mockRejectedValue(error)
        await expect(profileNameChangeService("Jane")).rejects.toThrow("failed")
    })
})

describe("profilePasswordChangeService", () => {
    it("calls PUT /profile/password/ with old and new password", async () => {
        const mockRes = { data: {} }
        axiosInstance.put.mockResolvedValue(mockRes)
        const res = await profilePasswordChangeService("old123", "new456")
        expect(axiosInstance.put).toHaveBeenCalledWith("/profile/password/", {
            old_password: "old123",
            new_password: "new456"
        })
        expect(res).toBe(mockRes)
    })

    it("throws when axios rejects", async () => {
        const error = new Error("failed")
        axiosInstance.put.mockRejectedValue(error)
        await expect(profilePasswordChangeService("old123", "new456")).rejects.toThrow("failed")
    })
})

describe("profilePictureUpdateService", () => {
    it("calls PUT /profile/picture/ with form data containing the file", async () => {
        const mockRes = { data: { profile_picture: "url.png" } }
        axiosInstance.put.mockResolvedValue(mockRes)
        const image = new File(["content"], "avatar.png", { type: "image/png" })
        const res = await profilePictureUpdateService(image)
        expect(axiosInstance.put).toHaveBeenCalledWith("/profile/picture/", expect.any(FormData))
        const formDataArg = axiosInstance.put.mock.calls[0][1]
        expect(formDataArg.get("file")).toBe(image)
        expect(res).toBe(mockRes)
    })

    it("throws when axios rejects", async () => {
        const error = new Error("failed")
        axiosInstance.put.mockRejectedValue(error)
        const image = new File(["content"], "avatar.png", { type: "image/png" })
        await expect(profilePictureUpdateService(image)).rejects.toThrow("failed")
    })
})

describe("profilePictureDeleteService", () => {
    it("calls DELETE /profile/picture/", async () => {
        const mockRes = { data: {} }
        axiosInstance.delete.mockResolvedValue(mockRes)
        const res = await profilePictureDeleteService()
        expect(axiosInstance.delete).toHaveBeenCalledWith("/profile/picture/")
        expect(res).toBe(mockRes)
    })

    it("throws when axios rejects", async () => {
        const error = new Error("failed")
        axiosInstance.delete.mockRejectedValue(error)
        await expect(profilePictureDeleteService()).rejects.toThrow("failed")
    })
})