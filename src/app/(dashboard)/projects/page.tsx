import { getProjects } from "@/actions/projects";
import { getEmployees } from "@/actions/employees";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const [projects, employees] = await Promise.all([
    getProjects(),
    getEmployees(),
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
