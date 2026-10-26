import { useEffect, useRef, useState } from "react"

export function useAvatarUpload() {
  const fileInput = useRef<HTMLInputElement>(null)
  const readerRef = useRef<FileReader | null>(null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [isReading, setIsReading] = useState(false)
  useEffect(() => () => readerRef.current?.abort(), [])

  const clearPhotoChanges = () => {
    readerRef.current?.abort()
    setAvatar(null); setPreview(null); setRemoveAvatar(false); setAvatarError(""); setIsReading(false)
    if (fileInput.current) fileInput.current.value = ""
  }
  const selectPhoto = (file: File | undefined) => {
    readerRef.current?.abort()
    setIsReading(false)
    if (!file) return
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type) || file.size > 800 * 1024) {
      setAvatarError("Chọn ảnh JPG, PNG hoặc GIF, dung lượng tối đa 800 KB.")
      if (fileInput.current) fileInput.current.value = ""
      return
    }
    const reader = new FileReader()
    readerRef.current = reader
    setIsReading(true)
    reader.onload = () => { setAvatar(file); setPreview(String(reader.result)); setRemoveAvatar(false); setAvatarError(""); setIsReading(false) }
    reader.onerror = () => { setAvatarError("Không thể đọc ảnh. Vui lòng chọn tệp khác."); setIsReading(false) }
    reader.readAsDataURL(file)
  }

  const resetPhoto = () => { clearPhotoChanges(); setRemoveAvatar(true) }
  return { fileInput, avatar, preview, removeAvatar, avatarError, isReading,
    clearPhotoChanges, selectPhoto, resetPhoto }
}
