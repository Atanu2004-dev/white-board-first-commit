import axios from 'axios'

const api = axios.create({
    baseURL:'http://localhost:3000',
    withCredentials: true
})

export async function sendInvite(boardId, email) {
    try{
        const response = await api.post(`/api/invites/board/${boardId}`,{
            email
        })

        return response.data
        
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function getPendingInvites() {
    try{
        const response = await api.get('/api/invites/pending')

        return response.data
        
    }catch(err){
        console.log(err)
    }
}

export async function respondToInvite (inviteId, action) {
    try{
        const response = await api.post(`/api/invites/${inviteId}/respond`,{
            action
        })

        return response.data
        
    }catch(err){
        console.log(err)
    }
}
