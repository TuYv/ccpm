import { NavLink } from "react-router-dom";

interface Tab {
  to: string;
  label: string;
  end?: boolean;
}

export function SegmentedTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="flex gap-0.5 bg-app-bg rounded-full p-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-4 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
              isActive
                ? "bg-app-accent text-white font-medium"
                : "text-app-secondary hover:text-app-text"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
