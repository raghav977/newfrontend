import AddEmergencyServices from "./AddEmergencyServices"
export default function EmergencyHeader(){
    return(
        <div>
            {/* header */}
            <header className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">Emergency Services</h1>
                        <p className="text-muted-foreground">Manage your Emergency services</p>
                      </div>
                      <AddEmergencyServices/>
                  
                    </div>
                  </header>
        </div>
    )
}