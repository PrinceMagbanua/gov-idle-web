import { ItemCard } from './ItemCard';
import { calculateProjectCost } from '../utils/calculations';

export function ProjectList({ projects, money, costScaleMultiplier, globalMultiplier, onBuyProject }) {
  // Filter projects shown based on prerequisites
  const visibleProjects = projects.filter(project => {
    if (!project.prerequisite) return true;
    const prerequisiteProject = projects.find(p => p.id === project.prerequisite);
    return prerequisiteProject && prerequisiteProject.owned > 0;
  });

  if (visibleProjects.length === 0) {
    return (
      <div className="bg-slate-900 border-r border-slate-700 p-4 py-6 text-slate-400 text-center text-sm">
        No projects available
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Projects</h2>
      </div>

      {/* Projects list - all visible at once */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleProjects.map(project => {
          const cost = calculateProjectCost(project.baseCost, project.owned, costScaleMultiplier);
          return (
            <ItemCard
              key={project.id}
              item={project}
              isProject={true}
              money={money}
              costScaleMultiplier={costScaleMultiplier}
              globalMultiplier={globalMultiplier}
              onBuy={onBuyProject}
              canAfford={money >= cost}
            />
          );
        })}
      </div>
    </div>
  );
}
