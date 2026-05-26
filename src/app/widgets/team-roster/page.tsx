import RosterTable from "./RosterTable";

export default function TeamRosterPage() {
  return (
    <div className="flex flex-col gap-[20px]">
      <h1 className="bg-[linear-gradient(90deg,#51A2FF_0%,#AD46FF_100%)] bg-clip-text [font-family:var(--font-space-grotesk)] text-[28px] leading-[32px] font-bold text-transparent">
        Team Roster
      </h1>
      <RosterTable />
    </div>
  );
}
