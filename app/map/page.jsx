import dynamic from "next/dynamic";

const EmergencyServiceMap = dynamic(
  () => import("./components/EmergencyServiceMap"),
  { ssr: false }
);

export default function EmergencyPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Setup Emergency Service</h1>
      <EmergencyServiceMap />
    </div>
  );
}
