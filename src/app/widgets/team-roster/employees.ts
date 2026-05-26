export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  managerId: string | null;
};

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Ada Lovelace",
    role: "Engineering Lead",
    department: "Engineering",
    managerId: null,
  },
  {
    id: "emp-2",
    name: "Grace Hopper",
    role: "Senior Engineer",
    department: "Engineering",
    managerId: "emp-1",
  },
  {
    id: "emp-3",
    name: "Alan Turing",
    role: "Staff Engineer",
    department: "Engineering",
    managerId: "emp-1",
  },
  {
    id: "emp-4",
    name: "Margaret Hamilton",
    role: "Product Manager",
    department: "Product",
    managerId: null,
  },
  {
    id: "emp-5",
    name: "Linus Torvalds",
    role: "Senior Engineer",
    department: "Infrastructure",
    managerId: "emp-3",
  },
  {
    id: "emp-6",
    name: "Barbara Liskov",
    role: "Engineering Manager",
    department: "Engineering",
    managerId: "emp-1",
  },
];

// Compile-time uniqueness check: if any id is duplicated the mapped type would
// produce `never` at the duplicate key, causing a TypeScript error.
type _UniqueIds<T extends readonly Employee[]> = {
  [E in T[number] as E["id"]]: E;
};
// Trigger the check by referencing the type against the concrete array.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Check = _UniqueIds<typeof EMPLOYEES>;
