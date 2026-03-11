import { Link } from "react-router-dom";
import { Atom } from "lucide-react";
import { CycleData } from "@/services/cycleService"; // switch to service type

interface CycleCardProps {
  cycle: CycleData;
}

const classLevelColor = {
  "9th": "bg-emerald/10 text-emerald border-emerald/20",
  "10th": "bg-accent/10 text-accent border-accent/20",
  "11th": "bg-destructive/10 text-destructive border-destructive/20",
  "12th": "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const CycleCard = ({ cycle }: CycleCardProps) => {
  const Icon = cycle.icon || Atom;

  return (
    <Link to={`/cycle/${cycle.slug}`} className="block group">
      <div className="glass-panel p-6 card-hover-glow h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center group-hover:glow-emerald transition-shadow">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classLevelColor[cycle.classLevel?.displayName || "9th"]}`}
          >
            {cycle.classLevel?.displayName || "9th"}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:gradient-text transition-all">
          {cycle.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
          {cycle.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {(cycle.tags || []).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default CycleCard;
