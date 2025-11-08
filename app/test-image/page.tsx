export default function TestImagePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Image Test Page</h1>
      
      <h2>PNG Version:</h2>
      <img src="/Earnify-Logo.png" alt="Earnify PNG" style={{ height: '100px', border: '1px solid red' }} />
      
      <h2>SVG Version:</h2>
      <img src="/Earnify-Logo.svg" alt="Earnify SVG" style={{ height: '100px', border: '1px solid blue' }} />
      
      <h2>Direct Links:</h2>
      <p><a href="/Earnify-Logo.png" target="_blank">Open PNG</a></p>
      <p><a href="/Earnify-Logo.svg" target="_blank">Open SVG</a></p>
    </div>
  )
}

