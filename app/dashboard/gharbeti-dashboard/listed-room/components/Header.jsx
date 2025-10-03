// import AddEmergencyServices from "./AddEmergencyServices"
import AddRoom from "./AddRoom"
export default function Header(){
    return(
        <div>
            {/* header */}
            <header className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">Listed Rooms</h1>
                        <p className="text-muted-foreground">Manage your Listed Rooms</p>
                      </div>
                    <AddRoom/>
                    </div>
                  </header>
        </div>
    )
}