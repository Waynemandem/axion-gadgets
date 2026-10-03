export default function SectionHeading({
  eyebrow,
  title,
  pill,
  hot,
}: {
  eyebrow: string;
  title: string;
  pill?: string;
  hot?: boolean;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h2>
      </div>
      {pill && <span className={hot ? "pill-hot" : "pill-soft"}>{pill}</span>}
    </div>
  );
}