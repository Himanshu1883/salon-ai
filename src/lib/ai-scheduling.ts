import { addMinutes, setHours, setMinutes, startOfDay, isBefore, isAfter } from "date-fns";

export type SlotSuggestion = {
  scheduledAt: Date;
  employeeId: string;
  employeeName: string;
  availableSeats: number;
  estimatedDuration: number;
  waitMinutes: number;
  score: number;
  explanation?: string;
};

type EmployeeWithServices = {
  id: string;
  name: string;
  services: { serviceId: string }[];
};

type ExistingAppointment = {
  employeeId: string | null;
  scheduledAt: Date;
  service: { duration: number };
};

type ServiceInfo = {
  id: string;
  duration: number;
  name: string;
};

const SALON_OPEN = 9;
const SALON_CLOSE = 19;
const SLOT_INTERVAL = 30;

export function findBestSlots(
  employees: EmployeeWithServices[],
  service: ServiceInfo,
  appointments: ExistingAppointment[],
  totalSeats: number,
  occupiedSeats: number,
  dateFrom: Date,
  dateTo: Date,
  preferredEmployeeId?: string
): SlotSuggestion[] {
  const eligible = employees.filter((emp) =>
    emp.services.some((s) => s.serviceId === service.id)
  );

  const candidates = preferredEmployeeId
    ? eligible.filter((e) => e.id === preferredEmployeeId)
    : eligible;

  if (candidates.length === 0) return [];

  const suggestions: SlotSuggestion[] = [];
  const availableSeats = Math.max(totalSeats - occupiedSeats, 0);

  let day = startOfDay(dateFrom);
  const endDay = startOfDay(dateTo);

  while (!isAfter(day, endDay)) {
    for (let hour = SALON_OPEN; hour < SALON_CLOSE; hour++) {
      for (const minute of [0, SLOT_INTERVAL]) {
        const slotStart = setMinutes(setHours(day, hour), minute);
        if (isBefore(slotStart, dateFrom) || isAfter(slotStart, dateTo)) continue;
        if (isBefore(slotStart, new Date())) continue;

        const slotEnd = addMinutes(slotStart, service.duration);

        for (const employee of candidates) {
          const conflict = appointments.some((apt) => {
            if (apt.employeeId !== employee.id) return false;
            const aptStart = new Date(apt.scheduledAt);
            const aptEnd = addMinutes(aptStart, apt.service.duration);
            return slotStart < aptEnd && slotEnd > aptStart;
          });

          if (conflict) continue;

          const waitMinutes = Math.max(
            0,
            Math.round((slotStart.getTime() - Date.now()) / 60000)
          );

          const score =
            1000 -
            waitMinutes -
            (preferredEmployeeId === employee.id ? 0 : 50) +
            availableSeats * 5;

          suggestions.push({
            scheduledAt: slotStart,
            employeeId: employee.id,
            employeeName: employee.name,
            availableSeats,
            estimatedDuration: service.duration,
            waitMinutes,
            score,
          });
        }
      }
    }
    day = addMinutes(day, 24 * 60);
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function enrichWithAiExplanation(
  slots: SlotSuggestion[],
  customerName: string,
  serviceName: string
): Promise<SlotSuggestion[]> {
  if (!process.env.OPENAI_API_KEY || slots.length === 0) {
    return slots.map((s) => ({
      ...s,
      explanation: `${s.employeeName} is available with ${s.availableSeats} seat(s) open. Estimated wait: ${s.waitMinutes} min.`,
    }));
  }

  try {
    const slotSummary = slots
      .map(
        (s, i) =>
          `${i + 1}. ${s.scheduledAt.toISOString()} with ${s.employeeName}, ${s.estimatedDuration}min, ${s.availableSeats} seats`
      )
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly salon scheduling assistant. For each slot, write one short sentence explaining why it's a good choice. Return JSON array of strings, one per slot.",
          },
          {
            role: "user",
            content: `Customer: ${customerName}, Service: ${serviceName}\nSlots:\n${slotSummary}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error("OpenAI request failed");

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const explanations: string[] = content.explanations ?? content.slots ?? [];

    return slots.map((s, i) => ({
      ...s,
      explanation:
        explanations[i] ??
        `${s.employeeName} is available with ${s.availableSeats} seat(s) open.`,
    }));
  } catch {
    return slots.map((s) => ({
      ...s,
      explanation: `${s.employeeName} is available with ${s.availableSeats} seat(s) open.`,
    }));
  }
}
