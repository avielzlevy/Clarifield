import axios from "axios"
export const sendAnalytics = async (name, type, amount) => {
    if(name.includes('^')){
        return
    }
    const analyticsResponse = await axios.post(`http://localhost:5000/api/analytic`, {
        name,
        type,
        amount
    })
    return analyticsResponse.data
}
export const getAnalytics = async () => {
    const analyticsResponse = await axios.get(`http://localhost:5000/api/analytics`)
    return analyticsResponse.data
}