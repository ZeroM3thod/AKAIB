export default function Breadcrumb7() {
  const crumbs = ["Home", "Products", "Details"];
  return (
    <div className="flex items-center gap-2 text-xs text-white/50">
      {crumbs.map((c, i) => (
        <span key={c} className="flex items-center gap-2">
          <span className={i === crumbs.length - 1 ? "text-primary font-medium" : "hover:text-white cursor-pointer"}>
            {c}
          </span>
          {i < crumbs.length - 1 && <span className="text-white/20">/</span>}
        </span>
      ))}
    </div>
  );
}
