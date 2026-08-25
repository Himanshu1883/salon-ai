"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  buildPasswordResetEmail,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";
import {
  formatBusinessAddress,
  STARTER_SERVICES,
} from "@/lib/onboarding";
import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { getSalonPublicUrl } from "@/lib/salon-paths";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "@/lib/stock-categories";
import {
  forgotPasswordSchema,
  onboardingSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import { createTrialSubscription } from "@/actions/subscription";
import { generateUniqueSalonSlug } from "@/lib/salon-slug";

const PASSWORD_RESET_SUCCESS_MESSAGE =
  "If an account exists for that email at this salon, we sent password reset instructions.";

export async function requestPasswordResetAction(data: unknown) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email, salonSlug } = parsed.data;

  const salon = await prisma.salon.findUnique({
    where: { slug: salonSlug },
    select: { id: true, name: true, slug: true },
  });

  if (!salon) {
    return { success: true, message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      salonId: true,
      salon: { select: { slug: true } },
    },
  });

  if (
    !user ||
    user.isSuperAdmin ||
    !user.salonId ||
    user.salon?.slug !== salonSlug
  ) {
    return { success: true, message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = getPasswordResetExpiry();
  const resetUrl = getSalonPublicUrl(
    salonSlug,
    `/reset-password?token=${encodeURIComponent(rawToken)}`
  );

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        salonId: salon.id,
        usedAt: null,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        salonId: salon.id,
        expiresAt,
      },
    });
  });

  const emailContent = buildPasswordResetEmail({
    recipientName: user.name,
    salonName: salon.name,
    resetUrl,
  });

  const emailResult = await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!emailResult.success && !emailResult.demoMode) {
    console.error("[password-reset] failed to send email:", emailResult.error);
    return {
      error:
        "We could not send the reset email. Please try again in a few minutes.",
    };
  }

  if (emailResult.demoMode) {
    console.log("[password-reset] reset link (dev/demo):", resetUrl);
  }

  return {
    success: true,
    message: isEmailConfigured()
      ? PASSWORD_RESET_SUCCESS_MESSAGE
      : `${PASSWORD_RESET_SUCCESS_MESSAGE} Email is not configured in this environment — check server logs for the reset link.`,
  };
}

export async function resetPasswordAction(data: unknown) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { token, salonSlug, password } = parsed.data;
  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, isSuperAdmin: true } },
      salon: { select: { slug: true } },
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date() ||
    resetToken.salon.slug !== salonSlug ||
    resetToken.user.isSuperAdmin
  ) {
    return {
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
    });
  });

  return { success: true };
}

export async function onboardingSignupAction(data: unknown) {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    return { error: "Email already registered" };
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const fullAddress = formatBusinessAddress({
    addressLine1: input.addressLine1,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
  });

  const selectedServices = input.skipServices
    ? []
    : STARTER_SERVICES.filter((service) =>
        input.selectedServiceIds.includes(service.id)
      );

  const slug = await generateUniqueSalonSlug(input.salonName, prisma);

  const salon = await prisma.$transaction(async (tx) => {
    const createdSalon = await tx.salon.create({
      data: {
        name: input.salonName,
        slug,
        phone: input.businessPhone,
        address: fullAddress,
        businessType: input.businessType,
        gstin: input.gstin || null,
        addressLine1: input.addressLine1,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        businessPhone: input.businessPhone,
        businessEmail: input.businessEmail || null,
        openingHours: JSON.stringify(input.openingHours),
        currency: input.currency,
        expectedTeamSize: input.expectedTeamSize,
        onboardingCompleted: true,
        totalSeats: input.totalSeats,
        users: {
          create: {
            email: input.email,
            password: hashed,
            name: input.ownerName,
            phone: input.ownerPhone,
            role: "owner",
          },
        },
        seats: {
          create: Array.from({ length: input.totalSeats }, (_, i) => ({
            number: i + 1,
            status: "available",
          })),
        },
      },
    });

    if (selectedServices.length > 0) {
      const category = await tx.serviceCategory.create({
        data: {
          salonId: createdSalon.id,
          name: "Hair & styling",
          sortOrder: 0,
        },
      });

      await tx.service.createMany({
        data: selectedServices.map((service, index) => ({
          salonId: createdSalon.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
          categoryId: category.id,
          sortOrder: index,
        })),
      });
    }

    await tx.stockCategory.createMany({
      data: DEFAULT_STOCK_CATEGORY_NAMES.map((name, sortOrder) => ({
        salonId: createdSalon.id,
        name,
        sortOrder,
      })),
    });

    return createdSalon;
  });

  try {
    await createTrialSubscription(salon.id);
  } catch (error) {
    console.error("[signup] trial subscription setup failed:", error);
  }

  const owner = await prisma.user.findFirst({
    where: { salonId: salon.id, role: "owner" },
    select: { id: true },
  });

  if (owner) {
    const { assignUserSalonRoleFromLegacy, ensureSalonSystemRoles } =
      await import("@/lib/permissions/seed");
    await ensureSalonSystemRoles(prisma, salon.id);
    await assignUserSalonRoleFromLegacy(prisma, owner.id, salon.id, "owner");
  }

  return {
    success: true,
    salonId: salon.id,
    salonName: salon.name,
    salonSlug: salon.slug,
  };
}

/** @deprecated Use onboardingSignupAction */
export async function signupAction(formData: FormData) {
  const raw = {
    salonName: formData.get("salonName") as string,
    ownerName: formData.get("ownerName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
  };

  const { signupSchema } = await import("@/lib/validations");
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email already registered" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const slug = await generateUniqueSalonSlug(parsed.data.salonName, prisma);

  const salon = await prisma.salon.create({
    data: {
      name: parsed.data.salonName,
      slug,
      phone: parsed.data.phone,
      address: parsed.data.address,
      totalSeats: 4,
      users: {
        create: {
          email: parsed.data.email,
          password: hashed,
          name: parsed.data.ownerName,
          role: "owner",
        },
      },
      seats: {
        create: Array.from({ length: 4 }, (_, i) => ({
          number: i + 1,
          status: "available",
        })),
      },
      stockCategories: {
        create: DEFAULT_STOCK_CATEGORY_NAMES.map((name, sortOrder) => ({
          name,
          sortOrder,
        })),
      },
    },
  });

  return { success: true, salonId: salon.id, salonSlug: salon.slug };
}
