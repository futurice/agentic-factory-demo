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
