import Link from "next/link";

export default function PastWorks({ works }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">My Past Works</h2>
      <div className="space-y-4">
        {works.map((work) => (
          <Link href={work.link} key={work.id}>
            <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="w-24 h-16 rounded-md overflow-hidden bg-slate-200">
                <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{work.title}</h3>
                <p className="text-sm text-slate-600">{work.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
