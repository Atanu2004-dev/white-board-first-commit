import axios from 'axios'

const api = axios.create({
    baseURL:'http://localhost:3000',
    withCredentials: true
})

export async function createBoard(title) {
    try{
        const response = await api.post('/api/board/CreateBoard',{ title})

        return response.data
        
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function getBoards() {
    try{
        const response = await api.get('/api/board/getBoards')

        return response.data
        
    }catch(err){
        console.log(err)
        throw err
    }
}
export async function getBoard(boardId) {
    try{
        const response = await api.get(`/api/board/${boardId}`)

        return response.data
        
    }catch(err){
        console.log(err)
        throw err
    }
}
export async function saveStrokes(boardId, strokes) {
    try {
        const response = await api.put(`/api/board/${boardId}/strokes`, { strokes })
 
        return response.data
 
    } catch (err) {
        console.log(err)
        throw err
    }
}
export async function deleteBoard(boardId) {
    try{
        const response = await api.delete(`/api/board/${boardId}`)

        return response.data
        
    }catch(err){
        console.log(err)
        throw err
    }
}
export async function addCollaborator(boardId, email) {
  try {
    const response = await api.post(`/api/board/${boardId}/collaborators`, { email })
    return response.data
  } catch (err) {
    console.log(err)
    throw err
  }
}





