//вроде в бэке есть для этого функцияю пусть будет для роута

export async function verifyJWT(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}