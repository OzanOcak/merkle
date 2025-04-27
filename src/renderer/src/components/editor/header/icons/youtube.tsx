export function YouTubeEmbed({
  id,
  width = '560',
  height = '315'
}: {
  id: string
  width?: string
  height?: string
}) {
  // Calculate aspect ratio percentage (for responsive scaling)
  const aspectRatio = (parseInt(height) / parseInt(width)) * 100

  return (
    <div
      className="relative my-4 mx-auto"
      style={{
        maxWidth: `${width}px`,
        width: '100%'
      }}
    >
      {/* Container that maintains aspect ratio */}
      <div
        className="relative w-full"
        style={{
          paddingBottom: `${aspectRatio}%`
        }}
      >
        {/* Actual iframe */}
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src={`https://www.youtube.com/embed/${id}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
