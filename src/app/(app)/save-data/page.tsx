export default async function page() {
  return (
    <div className="min-h-[70vh] flex justify-center items-center">
      <video autoPlay loop playsInline>
        <source src="save.webm" type="video/webm" />
      </video>
    </div>
  )
}
