import { UploadClient } from '@uploadcare/upload-client'

export const uploadToUploadCare = async (href: string): Promise<string> => {
  try {
    const file = await new UploadClient({ publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '' })
      .uploadFile(href)
    return file.cdnUrl || file.s3Url || href
  } catch (e) {
    console.error("Upload was failed. e: ", e);
    return href
  }
}
