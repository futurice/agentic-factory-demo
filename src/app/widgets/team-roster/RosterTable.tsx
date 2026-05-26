"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EMPLOYEES, Employee } from "./employees";
import Avatar from "./Avatar";

function getManagerName(managerId: string | null): string {
  if (managerId === null) return "—";
  const manager = EMPLOYEES.find((e) => e.id === managerId);
  return manager ? manager.name : "—";
}

function getManager(managerId: string | null): Employee | null {
  if (managerId === null) return null;
  return EMPLOYEES.find((e) => e.id === managerId) ?? null;
}

export default function RosterTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-[16px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[24px]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th
              className="w-[240px] pb-[12px] text-left [font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF] uppercase"
              scope="col"
            >
              Name
            </th>
            <th
              className="w-[160px] pb-[12px] text-left [font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF] uppercase"
              scope="col"
            >
              Role
            </th>
            <th
              className="w-[160px] pb-[12px] text-left [font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF] uppercase"
              scope="col"
            >
              Department
            </th>
            <th
              className="w-[160px] pb-[12px] text-left [font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF] uppercase"
              scope="col"
            >
              Manager
            </th>
            <th className="w-[40px] pb-[12px]" scope="col">
              <span className="sr-only">Expand</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {EMPLOYEES.map((employee) => {
            const isExpanded = expandedId === employee.id;
            const detailId = `detail-${employee.id}`;
            const manager = getManager(employee.managerId);

            return (
              <Fragment key={employee.id}>
                <tr
                  className={`h-[56px] border-t border-[#1E2939] transition-colors ${
                    isExpanded
                      ? "bg-[#1E2939]"
                      : "cursor-pointer hover:bg-[#1E2939]"
                  }`}
                >
                  <td className="py-[8px] pr-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Avatar name={employee.name} size="sm" />
                      <span className="[font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#FFFFFF]">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-[8px] pr-[16px] [font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#99A1AF]">
                    {employee.role}
                  </td>
                  <td className="py-[8px] pr-[16px] [font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#99A1AF]">
                    {employee.department}
                  </td>
                  <td className="py-[8px] pr-[16px] [font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#99A1AF]">
                    {getManagerName(employee.managerId)}
                  </td>
                  <td className="py-[8px]">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`Expand ${employee.name}`}
                      aria-controls={detailId}
                      onClick={() => handleToggle(employee.id)}
                      className="flex items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none"
                    >
                      <ChevronDown
                        size={20}
                        strokeWidth={2}
                        className="text-[#3B82F6] transition-transform duration-[150ms] ease-[ease]"
                        style={{
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td
                      id={detailId}
                      colSpan={5}
                      className="bg-[#0F172A] px-[24px] py-[20px]"
                    >
                      <div className="flex items-start gap-[24px]">
                        <Avatar name={employee.name} size="lg" />
                        <div className="flex flex-col gap-[12px]">
                          <span className="[font-family:var(--font-space-grotesk)] text-[16px] leading-[24px] font-bold text-[#FFFFFF]">
                            {employee.name}
                          </span>
                          <div className="flex flex-col gap-[4px]">
                            <span className="[font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF]">
                              Role
                            </span>
                            <span className="[font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#FFFFFF]">
                              {employee.role}
                            </span>
                          </div>
                          <div className="flex flex-col gap-[4px]">
                            <span className="[font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF]">
                              Department
                            </span>
                            <span className="[font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#FFFFFF]">
                              {employee.department}
                            </span>
                          </div>
                        </div>
                        {manager !== null && (
                          <div className="flex flex-col gap-[12px]">
                            <span className="[font-family:var(--font-inter)] text-[12px] leading-[16px] font-normal text-[#99A1AF]">
                              Reports to
                            </span>
                            <div className="flex items-center gap-[8px] rounded-[8px] border border-[#1E2939] bg-[#101828] p-[12px]">
                              <Avatar name={manager.name} size="sm" />
                              <span className="[font-family:var(--font-inter)] text-[14px] leading-[20px] font-normal text-[#FFFFFF]">
                                {manager.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
