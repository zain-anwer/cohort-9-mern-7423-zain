import { noteEvent } from "../../events/note.event.js";
import { getIO } from "../socket.js";

noteEvent.on('create:note',({user_id,created_note}) => {
    getIO().to(`user_id:${user_id}`).emit('note:creation',created_note)
})

noteEvent.on('update:note',({user_id,updated_note}) => {
    getIO().to(`user_id:${user_id}`).emit('note:updation',updated_note)
})

noteEvent.on('delete:note',({user_id,note_id}) => {
    getIO().to(`user_id:${user_id}`).emit('note:deletion',note_id)
})