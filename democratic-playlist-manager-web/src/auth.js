const TOKEN_KEY = 'DP_TOKEN'
const USER_TYPE_KEY = 'DP_USER_TYPE'

export const saveSession = (token, userType) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_TYPE_KEY, userType)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUserType = () => localStorage.getItem(USER_TYPE_KEY)

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_TYPE_KEY)
}

export const isAuthenticated = () => !!getToken()
