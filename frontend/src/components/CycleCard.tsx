import { Link } from "react-router-dom";
import { CycleData } from "@/data/cycles";

interface CycleCardProps {
  cycle: CycleData;
}

const difficultyColor = {
  Beginner: "bg-emerald/10 text-emerald border-emerald/20",
  Intermediate: "bg-accent/10 text-accent border-accent/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const CycleCard = ({ cycle }: CycleCardProps) => {
  const Icon = cycle.icon;

  return (
    <Link to={`/cycle/${cycle.slug}`} className="block group">
      <div className="glass-panel p-6 card-hover-glow h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center group-hover:glow-emerald transition-shadow">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColor[cycle.difficulty]}`}
          >
            {cycle.difficulty}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:gradient-text transition-all">
          {cycle.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
          {cycle.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {cycle.tags.map((tag) => (
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
