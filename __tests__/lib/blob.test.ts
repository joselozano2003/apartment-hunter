import { uploadPhoto, removeBlob } from '@/lib/blob'

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
}))

import { put, del } from '@vercel/blob'
const mockPut = put as jest.MockedFunction<typeof put>
const mockDel = del as jest.MockedFunction<typeof del>

beforeEach(() => {
  mockPut.mockReset()
  mockDel.mockReset()
})

describe('uploadPhoto', () => {
  it('calls put with the file and returns the url', async () => {
    mockPut.mockResolvedValueOnce({ url: 'https://blob.vercel.com/photo.jpg' } as any)
    const fakeFile = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const url = await uploadPhoto(fakeFile)
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringMatching(/^photos\//),
      fakeFile,
      { access: 'public' }
    )
    expect(url).toBe('https://blob.vercel.com/photo.jpg')
  })
})

describe('removeBlob', () => {
  it('calls del with the provided url', async () => {
    mockDel.mockResolvedValueOnce(undefined as any)
    await removeBlob('https://blob.vercel.com/photo.jpg')
    expect(mockDel).toHaveBeenCalledWith('https://blob.vercel.com/photo.jpg')
  })
})
