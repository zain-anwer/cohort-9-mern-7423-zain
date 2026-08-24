import axiosInstance from "../utils/axios";

export const createNote = async(note) => { 
    const res = await axiosInstance.post('/notes/',note)
    return res
}

export const updateNote = async(note_id,note) => {
    const res = await axiosInstance.put(`/notes/${note_id}`,note)
    return res
}

export const deleteNote = async(note_id) => {
    const res = await axiosInstance.delete(`/notes/${note_id}`)
    return res
}

export const getNote = async(note_id) => {
    const res = await axiosInstance.get(`/notes/${note_id}`)
    return res
}

export const getAllNotes = async(note_id) => {
    const res = await axiosInstance.get('/notes/')
    return res
}

export const exportNote = async(note_id) => {
    const res = axios.get(`/notes/export/${note_id}`,{
        responseType: 'blob'
    })
    const disposition = response.headers['content-disposition'];
    const match = disposition?.match(/filename="?([^"]+)"?/);
    return { blob: response.data, filename: match ? match[1] : 'note.txt' };
}

export const importNote = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/notes/import', formData);
  return response.data;
}