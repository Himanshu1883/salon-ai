"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireSuperAdmin } from "@/lib/auth";

const MESSAGE_MAX_LENGTH = 4000;
const MESSAGE_FETCH_LIMIT = 200;

export type SupportMessageSender = "SALON" | "ADMIN";

export type SupportMessageDTO = {
  id: string;
  senderType: SupportMessageSender;
  senderName: string;
  body: string;
  createdAt: string;
};

export type SupportConversationSummary = {
  id: string;
  salonId: string;
  salonName: string;
  salonSlug: string;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
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

async function getOrCreateConversation(salonId: string) {
  return prisma.supportConversation.upsert({
    where: { salonId },
    create: { salonId },
    update: {},
  });
}

async function countUnreadForAdmin(conversationId: string, adminLastReadAt: Date | null) {
  return prisma.supportMessage.count({
    where: {
      conversationId,
      senderType: "SALON",
      ...(adminLastReadAt
        ? { createdAt: { gt: adminLastReadAt } }
        : {}),
    },
  });
}

async function countUnreadForSalon(conversationId: string, salonLastReadAt: Date | null) {
  return prisma.supportMessage.count({
    where: {
      conversationId,
      senderType: "ADMIN",
      ...(salonLastReadAt
        ? { createdAt: { gt: salonLastReadAt } }
        : {}),
    },
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
    data: { lastMessageAt: now },
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

export async function getAdminSupportConversations() {
  await requireSuperAdmin();

  const conversations = await prisma.supportConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      salon: { select: { id: true, name: true, slug: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, senderType: true, createdAt: true },
      },
    },
  });

  const summaries = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await countUnreadForAdmin(
        conversation.id,
        conversation.adminLastReadAt
      );

      return {
        id: conversation.id,
        salonId: conversation.salonId,
        salonName: conversation.salon.name,
        salonSlug: conversation.salon.slug,
        lastMessageAt: conversation.lastMessageAt.toISOString(),
        lastMessagePreview: conversation.messages[0]?.body ?? null,
        unreadCount,
      } satisfies SupportConversationSummary;
    })
  );

  return summaries;
}

export async function getAdminSupportMessages(
  conversationId: string,
  options?: { revalidate?: boolean }
) {
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

  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: { adminLastReadAt: new Date() },
  });

  // revalidatePath must not run during RSC render (e.g. admin/support page SSR).
  if (options?.revalidate !== false) {
    revalidatePath("/admin/support");
  }

  return {
    conversationId: conversation.id,
    salonId: conversation.salonId,
    salonName: conversation.salon.name,
    salonSlug: conversation.salon.slug,
    messages: messages.map(serializeMessage),
  };
}

export async function sendAdminSupportMessage(conversationId: string, body: string) {
  const session = await requireSuperAdmin();
  const trimmed = validateMessageBody(body);

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
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
    data: { lastMessageAt: now },
  });

  revalidatePath("/admin/support");
  return serializeMessage(message);
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
