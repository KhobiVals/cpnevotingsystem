import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.VOTER_SESSION_SECRET || 'desag-voter-session-secret-key-32chars!'
)

const COOKIE_NAME = 'desag_voter_session'

export interface VoterSessionPayload {
  voterId: string
  electionId: string
  studentId: string
  voterName: string
  hasVoted: boolean
}

export async function createVoterSession(payload: VoterSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

export async function getVoterSession(): Promise<VoterSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as VoterSessionPayload
  } catch (err) {
    return null
  }
}

export async function clearVoterSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
