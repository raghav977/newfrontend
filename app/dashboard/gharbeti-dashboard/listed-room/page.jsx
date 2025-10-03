import Header from "./components/Header"
import ListRoom from "./components/ListRoom"

export default function ListedRoom() {
  return (
    <div className="bg-gray-50 min-h-full p-6">
      <Header />
      <div className="mt-6 border-t border-[#005caf] pt-4">
        <ListRoom />
      </div>
    </div>
  )
}