import { put, del } from '@vercel/blob'

export async function uploadPhoto(file: File): Promise<string> {
  const filename = `photos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { url } = await put(filename, file, { access: 'public' })
  return url
}

export async function removeBlob(url: string): Promise<void> {
  await del(url)
}
