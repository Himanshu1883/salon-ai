"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  formatBusinessAddress,
  STARTER_SERVICES,
} from "@/lib/onboarding";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "@/lib/stock-categories";
import { onboardingSchema } from "@/lib/validations";
import { createTrialSubscription, generateMonthlyInvoice } from "@/actions/subscription";
import { generateUniqueSalonSlug } from "@/lib/salon-slug";

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

  await createTrialSubscription(salon.id);
  await generateMonthlyInvoice(salon.id);

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
