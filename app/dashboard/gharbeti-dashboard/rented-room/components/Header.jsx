// import AddEmergencyServices from "./AddEmergencyServices"
export default function Header(){
    return(
        <div>
            {/* header */}
            <header className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">Rented Rooms</h1>
                        <p className="text-muted-foreground">Manage your Rented Rooms</p>
                      </div>
                      {/* <AddEmergencyServices/> */}
                  
                    </div>
                  </header>
        </div>
    )
}