import RejectedDashboardStats from "./components/Dashboard"
import RejectedList from "./components/RejectedList"
export default function rejectKycs(){
    return(
        <div>
            {/* heading */}
            <div>
                <h1 className="border p-4 font-bold text-3xl">Rejected Kycs</h1>
            </div>
            {/* dash stats */}
            {/* < */}
            <RejectedDashboardStats/>
            <RejectedList/>
            
            

        </div>
    )
}