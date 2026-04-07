'use client'

export default function DriveImageTest() {
  const fileId = '1WnDNL7eM1vORWkGcyxXlBX_e1rh8zx35'

  const urls = [
    { label: 'lh3.googleusercontent.com (CDN trực tiếp)', url: `https://lh3.googleusercontent.com/d/${fileId}` },
    { label: 'Drive Thumbnail API', url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` },
    { label: 'Drive uc?export=view (cũ)', url: `https://drive.google.com/uc?export=view&id=${fileId}` },
    { label: 'drive.usercontent.google.com', url: `https://drive.usercontent.google.com/download?id=${fileId}&export=view` },
  ]

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🔬 Test Hiển Thị Ảnh Google Drive</h1>
      <p>File ID: <code>{fileId}</code></p>
      <p>Link gốc: <code>https://drive.google.com/file/d/{fileId}/view?usp=sharing</code></p>
      <hr />
      {urls.map((item, i) => (
        <div key={i} style={{ marginBottom: '40px', border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
          <h3>{i + 1}. {item.label}</h3>
          <p style={{ fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>{item.url}</p>
          <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '8px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={`Test ${i + 1}`}
              style={{ maxWidth: '100%', maxHeight: '300px' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color:red;font-weight:bold">❌ KHÔNG HIỂN THỊ ĐƯỢC</span>' }}
              onLoad={(e) => { e.target.style.border = '3px solid green' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
