export default function ServiceInfo({ title, description, price, currency }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="text-slate-600">{description}</p>
      <div>
        <span className="text-2xl font-bold text-green-600">
          {currency} {price}
        </span>
        <span className="text-sm text-slate-500"> (estimated price)</span>
      </div>
    </div>
  );
}
