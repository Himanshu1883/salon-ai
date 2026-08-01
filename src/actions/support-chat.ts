"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireSuperAdmin } from "@/lib/auth";

const MESSAGE_MAX_LENGTH = 4000;
const MESSAGE_FETCH_LIMIT = 200;

export type SupportMessageSender = "SALON" | "ADMIN";
export type SupportConversationStatus = "OPEN" | "WAITING" | "CLOSED";
export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type SupportMessageDTO = {
  id: string;
  senderType: SupportMessageSender;
  senderName: string;
  body: string;
  createdAt: string;
};

export type SupportConversationMetadata = {
  currentPage?: string;
  userName?: string;
  browser?: string;
  os?: string;
  userAgent?: string;
};

export type SupportConversationSummary = {
  id: string;
  salonId: string;
  salonName: string;
  salonSlug: string;
  ticketNumber: string | null;
  subject: string | null;
  status: SupportConversationStatus;
  priority: SupportTicketPriority;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: string;
};

export type SupportConversationDetail = {
  conversationId: string;
  salonId: string;
  salonName: string;
  salonSlug: string;
  ticketNumber: string | null;
  subject: string | null;
  status: SupportConversationStatus;
  priority: SupportTicketPriority;
  metadata: SupportConversationMetadata | null;
  createdAt: string;
  agentJoinedAt: string | null;
  statusChangedAt: string | null;
  messages: SupportMessageDTO[];
};

export type SupportStatusCounts = {
  all: number;
  open: number;
  waiting: number;
  closed: number;
};

function serializeMessage(message: {
  id: string;
  senderType: SupportMessageSender;
  senderName: string;
  body: string;
  createdAt: Date;
}): SupportMessageDTO {
  return {
    id: message.id,
    senderType: message.senderType,
    senderName: message.senderName,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}

function parseMetadata(value: unknown): SupportConversationMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as SupportConversationMetadata;
}

function validateMessageBody(body: string) {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    throw new Error(`Message must be at most ${MESSAGE_MAX_LENGTH} characters`);
  }
  return trimmed;
}

async function generateTicketNumber() {
  const count = await prisma.supportConversation.count({
    where: { ticketNumber: { not: null } },
  });
  return `GD-${String(count + 1).padStart(4, "0")}`;
}

async function getOrCreateConversation(salonId: string) {
  const existing = await prisma.supportConversation.findUnique({
    where: { salonId },
  });

  if (existing) return existing;

  const ticketNumber = await generateTicketNumber();
  return prisma.supportConversation.create({
    data: {
      salonId,
      ticketNumber,
      statusChangedAt: new Date(),
    },
  });
}

async function countUnreadForAdmin(conversationId: string, adminLastReadAt: Date | null) {
  return prisma.supportMessage.count({
    where: {
      conversationId,
      senderType: "SALON",
      ...(adminLastReadAt ? { createdAt: { gt: adminLastReadAt } } : {}),
    },
  });
}

async function countUnreadForSalon(conversationId: string, salonLastReadAt: Date | null) {
  return prisma.supportMessage.count({
    where: {
      conversationId,
      senderType: "ADMIN",
      ...(salonLastReadAt ? { createdAt: { gt: salonLastReadAt } } : {}),
    },
  });
}

function deriveSubjectFromMessage(body: string) {
  const line = body.split("\n")[0]?.trim() ?? "";
  if (!line) return "Support request";
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

function serializeConversationSummary(
  conversation: {
    id: string;
    salonId: string;
    ticketNumber: string | null;
    subject: string | null;
    status: SupportConversationStatus;
    priority: SupportTicketPriority;
    lastMessageAt: Date;
    createdAt: Date;
    adminLastReadAt: Date | null;
    salon: { name: string; slug: string };
    messages: { body: string }[];
  },
  unreadCount: number
): SupportConversationSummary {
  return {
    id: conversation.id,
    salonId: conversation.salonId,
    salonName: conversation.salon.name,
    salonSlug: conversation.salon.slug,
    ticketNumber: conversation.ticketNumber,
    subject: conversation.subject,
    status: conversation.status,
    priority: conversation.priority,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    lastMessagePreview: conversation.messages[0]?.body ?? null,
    unreadCount,
    createdAt: conversation.createdAt.toISOString(),
  };
}

function serializeConversationDetail(
  conversation: {
    id: string;
    salonId: string;
    ticketNumber: string | null;
    subject: string | null;
    status: SupportConversationStatus;
    priority: SupportTicketPriority;
    metadata: unknown;
    createdAt: Date;
    agentJoinedAt: Date | null;
    statusChangedAt: Date | null;
    salon: { name: string; slug: string };
  },
  messages: SupportMessageDTO[]
): Omit<SupportConversationDetail, "messages"> {
  return {
    conversationId: conversation.id,
    salonId: conversation.salonId,
    salonName: conversation.salon.name,
    salonSlug: conversation.salon.slug,
    ticketNumber: conversation.ticketNumber,
    subject: conversation.subject,
    status: conversation.status,
    priority: conversation.priority,
    metadata: parseMetadata(conversation.metadata),
    createdAt: conversation.createdAt.toISOString(),
    agentJoinedAt: conversation.agentJoinedAt?.toISOString() ?? null,
    statusChangedAt: conversation.statusChangedAt?.toISOString() ?? null,
  };
}

export async function updateSalonSupportContext(metadata: SupportConversationMetadata) {
  const session = await requireSession();
  const conversation = await getOrCreateConversation(session.user.salonId);

  const merged: SupportConversationMetadata = {
    ...parseMetadata(conversation.metadata),
    ...metadata,
    userName: metadata.userName ?? session.user.name ?? undefined,
  };

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: { metadata: merged },
  });
}

export async function getSalonSupportThread() {
  const session = await requireSession();
  const conversation = await getOrCreateConversation(session.user.salonId);

  const messages = await prisma.supportMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: MESSAGE_FETCH_LIMIT,
  });

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: { salonLastReadAt: new Date() },
  });

  return {
    conversationId: conversation.id,
    messages: messages.map(serializeMessage),
  };
}

export async function sendSalonSupportMessage(body: string) {
  const session = await requireSession();
  const trimmed = validateMessageBody(body);
  const conversation = await getOrCreateConversation(session.user.salonId);
  const now = new Date();

  const messageCount = await prisma.supportMessage.count({
    where: { conversationId: conversation.id },
  });

  const updateData: {
    lastMessageAt: Date;
    status?: SupportConversationStatus;
    statusChangedAt?: Date;
    subject?: string;
  } = { lastMessageAt: now };

  if (conversation.status === "CLOSED") {
    updateData.status = "OPEN";
    updateData.statusChangedAt = now;
  }

  if (!conversation.subject && messageCount === 0) {
    updateData.subject = deriveSubjectFromMessage(trimmed);
  }

  const message = await prisma.supportMessage.create({
    data: {
      conversationId: conversation.id,
      senderType: "SALON",
      senderUserId: session.user.id,
      senderName: session.user.name ?? "Salon user",
      body: trimmed,
    },
  });

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: updateData,
  });

  revalidatePath("/admin/support");
  return serializeMessage(message);
}

export async function getSalonSupportUnreadCount() {
  const session = await requireSession();
  const conversation = await prisma.supportConversation.findUnique({
    where: { salonId: session.user.salonId },
    select: { id: true, salonLastReadAt: true },
  });

  if (!conversation) return 0;
  return countUnreadForSalon(conversation.id, conversation.salonLastReadAt);
}

export async function getAdminSupportStatusCounts(): Promise<SupportStatusCounts> {
  await requireSuperAdmin();

  const [all, open, waiting, closed] = await Promise.all([
    prisma.supportConversation.count(),
    prisma.supportConversation.count({ where: { status: "OPEN" } }),
    prisma.supportConversation.count({ where: { status: "WAITING" } }),
    prisma.supportConversation.count({ where: { status: "CLOSED" } }),
  ]);

  return { all, open, waiting, closed };
}

export async function getAdminSupportConversations(
  statusFilter?: SupportConversationStatus | "ALL"
) {
  await requireSuperAdmin();

  const conversations = await prisma.supportConversation.findMany({
    where:
      statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter }
        : undefined,
    orderBy: { lastMessageAt: "desc" },
    include: {
      salon: { select: { id: true, name: true, slug: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  const summaries = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await countUnreadForAdmin(
        conversation.id,
        conversation.adminLastReadAt
      );
      return serializeConversationSummary(conversation, unreadCount);
    })
  );

  return summaries;
}

export async function getAdminSupportMessages(conversationId: string) {
  await requireSuperAdmin();

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    include: {
      salon: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await prisma.supportMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: MESSAGE_FETCH_LIMIT,
  });

  const now = new Date();
  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: {
      adminLastReadAt: now,
      agentJoinedAt: conversation.agentJoinedAt ?? now,
    },
  });

  return {
    ...serializeConversationDetail(conversation, messages.map(serializeMessage)),
    messages: messages.map(serializeMessage),
  } satisfies SupportConversationDetail;
}

export async function sendAdminSupportMessage(conversationId: string, body: string) {
  const session = await requireSuperAdmin();
  const trimmed = validateMessageBody(body);

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    select: { id: true, status: true, agentJoinedAt: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const now = new Date();
  const message = await prisma.supportMessage.create({
    data: {
      conversationId,
      senderType: "ADMIN",
      senderUserId: session.user.id,
      senderName: session.user.name ?? "Support",
      body: trimmed,
    },
  });

  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: now,
      agentJoinedAt: conversation.agentJoinedAt ?? now,
      ...(conversation.status === "WAITING"
        ? { status: "OPEN" as const, statusChangedAt: now }
        : {}),
    },
  });

  revalidatePath("/admin/support");
  return serializeMessage(message);
}

export async function updateAdminSupportConversationStatus(
  conversationId: string,
  status: SupportConversationStatus
) {
  await requireSuperAdmin();

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const now = new Date();
  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: { status, statusChangedAt: now },
  });

  revalidatePath("/admin/support");
  return { status, statusChangedAt: now.toISOString() };
}

export async function updateAdminSupportConversationPriority(
  conversationId: string,
  priority: SupportTicketPriority
) {
  await requireSuperAdmin();

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: { priority },
  });

  revalidatePath("/admin/support");
  return { priority };
}

export async function getAdminSupportUnreadCount() {
  await requireSuperAdmin();

  const conversations = await prisma.supportConversation.findMany({
    select: { id: true, adminLastReadAt: true },
  });

  let total = 0;
  for (const conversation of conversations) {
    total += await countUnreadForAdmin(
      conversation.id,
      conversation.adminLastReadAt
    );
  }

  return total;
}
