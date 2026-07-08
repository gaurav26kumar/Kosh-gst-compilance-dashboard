import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          borderRadius: 36,
          color: '#e0b25c',
          fontSize: 108,
          fontWeight: 700,
        }}
      >
        K
      </div>
    ),
    { ...size }
  )
}
