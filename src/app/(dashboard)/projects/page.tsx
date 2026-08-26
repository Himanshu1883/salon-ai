import { getProjects } from "@/actions/projects";
import { getEmployeeOptions } from "@/actions/employees";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const [projects, employees] = await Promise.all([
    getProjects(),
    getEmployeeOptions(),
  ]);

  return (
    <ProjectsClient
      projects={projects}
      employees={employees.map((e) => ({
        id: e.id,
        name: e.name,
        avatarUrl: e.avatarUrl,
      }))}
    />
  );
}
