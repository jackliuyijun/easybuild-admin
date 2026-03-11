import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'EasyBuild Admin'
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 18,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00FF9D',
          borderRadius: '24%',
          fontWeight: 900,
          letterSpacing: '-1px'
        }}
      >
        EB
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
