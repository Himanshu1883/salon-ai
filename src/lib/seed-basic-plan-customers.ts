import type { PrismaClient } from "@/generated/prisma/client";

const TEST_USER_EMAIL = "test@abc.com";
const DEMO_PHONE_PREFIX = "+9199000100";
const TARGET_COUNT = 50;
const DEMO_NOTES = "basic-plan-demo";

type DemoCustomer = {
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  visitCount?: number;
};

const DEMO_CUSTOMERS: DemoCustomer[] = [
  { name: "Priya Sharma", phone: `${DEMO_PHONE_PREFIX}01`, email: "priya.sharma@gmail.com", loyaltyPoints: 420, visitCount: 8 },
  { name: "Ananya Reddy", phone: `${DEMO_PHONE_PREFIX}02`, email: "ananya.reddy@gmail.com", loyaltyPoints: 310, visitCount: 5 },
  { name: "Kavya Iyer", phone: `${DEMO_PHONE_PREFIX}03`, email: "kavya.iyer@yahoo.in" },
  { name: "Meera Nair", phone: `${DEMO_PHONE_PREFIX}04`, loyaltyPoints: 150, visitCount: 3 },
  { name: "Divya Patel", phone: `${DEMO_PHONE_PREFIX}05`, email: "divya.patel@gmail.com" },
  { name: "Sneha Gupta", phone: `${DEMO_PHONE_PREFIX}06`, email: "sneha.gupta@outlook.com", loyaltyPoints: 280, visitCount: 6 },
  { name: "Riya Kapoor", phone: `${DEMO_PHONE_PREFIX}07` },
  { name: "Aisha Khan", phone: `${DEMO_PHONE_PREFIX}08`, email: "aisha.khan@gmail.com" },
  { name: "Neha Verma", phone: `${DEMO_PHONE_PREFIX}09`, email: "neha.verma@gmail.com", loyaltyPoints: 95, visitCount: 2 },
  { name: "Pooja Singh", phone: `${DEMO_PHONE_PREFIX}10`, email: "pooja.singh@gmail.com" },
  { name: "Shreya Joshi", phone: `${DEMO_PHONE_PREFIX}11`, loyaltyPoints: 500, visitCount: 10 },
  { name: "Tanvi Desai", phone: `${DEMO_PHONE_PREFIX}12`, email: "tanvi.desai@gmail.com" },
  { name: "Isha Malhotra", phone: `${DEMO_PHONE_PREFIX}13`, email: "isha.malhotra@yahoo.in" },
  { name: "Aditi Rao", phone: `${DEMO_PHONE_PREFIX}14`, loyaltyPoints: 220, visitCount: 4 },
  { name: "Nisha Agarwal", phone: `${DEMO_PHONE_PREFIX}15`, email: "nisha.agarwal@gmail.com" },
  { name: "Swati Mehta", phone: `${DEMO_PHONE_PREFIX}16` },
  { name: "Deepika Chawla", phone: `${DEMO_PHONE_PREFIX}17`, email: "deepika.chawla@gmail.com", loyaltyPoints: 180, visitCount: 3 },
  { name: "Kritika Bansal", phone: `${DEMO_PHONE_PREFIX}18`, email: "kritika.bansal@gmail.com" },
  { name: "Harshita Saxena", phone: `${DEMO_PHONE_PREFIX}19`, loyaltyPoints: 340, visitCount: 7 },
  { name: "Simran Kaur", phone: `${DEMO_PHONE_PREFIX}20`, email: "simran.kaur@gmail.com" },
  { name: "Arjun Mehta", phone: `${DEMO_PHONE_PREFIX}21`, email: "arjun.mehta@gmail.com" },
  { name: "Rahul Kapoor", phone: `${DEMO_PHONE_PREFIX}22`, loyaltyPoints: 120, visitCount: 2 },
  { name: "Vikram Singh", phone: `${DEMO_PHONE_PREFIX}23`, email: "vikram.singh@outlook.com" },
  { name: "Rohan Desai", phone: `${DEMO_PHONE_PREFIX}24` },
  { name: "Amit Patel", phone: `${DEMO_PHONE_PREFIX}25`, email: "amit.patel@gmail.com", loyaltyPoints: 260, visitCount: 5 },
  { name: "Karan Malhotra", phone: `${DEMO_PHONE_PREFIX}26`, email: "karan.malhotra@gmail.com" },
  { name: "Siddharth Rao", phone: `${DEMO_PHONE_PREFIX}27` },
  { name: "Aditya Sharma", phone: `${DEMO_PHONE_PREFIX}28`, email: "aditya.sharma@gmail.com", loyaltyPoints: 400, visitCount: 9 },
  { name: "Nikhil Gupta", phone: `${DEMO_PHONE_PREFIX}29`, email: "nikhil.gupta@yahoo.in" },
  { name: "Varun Iyer", phone: `${DEMO_PHONE_PREFIX}30`, loyaltyPoints: 75, visitCount: 1 },
  { name: "Sanjay Reddy", phone: `${DEMO_PHONE_PREFIX}31`, email: "sanjay.reddy@gmail.com" },
  { name: "Manish Kumar", phone: `${DEMO_PHONE_PREFIX}32` },
  { name: "Rajesh Nair", phone: `${DEMO_PHONE_PREFIX}33`, email: "rajesh.nair@gmail.com", loyaltyPoints: 190, visitCount: 4 },
  { name: "Suresh Pillai", phone: `${DEMO_PHONE_PREFIX}34`, email: "suresh.pillai@outlook.com" },
  { name: "Gaurav Joshi", phone: `${DEMO_PHONE_PREFIX}35`, loyaltyPoints: 450, visitCount: 8 },
  { name: "Hemant Verma", phone: `${DEMO_PHONE_PREFIX}36`, email: "hemant.verma@gmail.com" },
  { name: "Pradeep Singh", phone: `${DEMO_PHONE_PREFIX}37` },
  { name: "Ashok Agarwal", phone: `${DEMO_PHONE_PREFIX}38`, email: "ashok.agarwal@gmail.com" },
  { name: "Vivek Chawla", phone: `${DEMO_PHONE_PREFIX}39`, email: "vivek.chawla@gmail.com", loyaltyPoints: 130, visitCount: 2 },
  { name: "Anil Bansal", phone: `${DEMO_PHONE_PREFIX}40` },
  { name: "Lakshmi Menon", phone: `${DEMO_PHONE_PREFIX}41`, email: "lakshmi.menon@gmail.com", loyaltyPoints: 360, visitCount: 6 },
  { name: "Sunita Devi", phone: `${DEMO_PHONE_PREFIX}42`, email: "sunita.devi@yahoo.in" },
  { name: "Geeta Kumari", phone: `${DEMO_PHONE_PREFIX}43` },
  { name: "Radha Krishnan", phone: `${DEMO_PHONE_PREFIX}44`, email: "radha.krishnan@gmail.com", loyaltyPoints: 210, visitCount: 4 },
  { name: "Parvati Das", phone: `${DEMO_PHONE_PREFIX}45`, email: "parvati.das@gmail.com" },
  { name: "Saraswati Rao", phone: `${DEMO_PHONE_PREFIX}46`, loyaltyPoints: 170, visitCount: 3 },
  { name: "Madhuri Dixit", phone: `${DEMO_PHONE_PREFIX}47`, email: "madhuri.dixit@gmail.com" },
  { name: "Rekha Bachchan", phone: `${DEMO_PHONE_PREFIX}48`, email: "rekha.b@outlook.com", loyaltyPoints: 290, visitCount: 5 },
  { name: "Jaya Prakash", phone: `${DEMO_PHONE_PREFIX}49` },
  { name: "Vidya Balan", phone: `${DEMO_PHONE_PREFIX}50`, email: "vidya.balan@gmail.com", loyaltyPoints: 480, visitCount: 9 },
];

export async function seedBasicPlanCustomers(prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    include: { salon: true },
  });

  if (!user?.salonId) {
    console.log(`seedBasicPlanCustomers: ${TEST_USER_EMAIL} not found, skipping.`);
    return { salonId: null, salonName: null, created: 0, total: 0 };
  }

  const salonId = user.salonId;
  const salonName = user.salon?.name ?? "Unknown";

  const existingDemoCount = await prisma.customer.count({
    where: { salonId, notes: DEMO_NOTES },
  });

  if (existingDemoCount >= TARGET_COUNT) {
    const total = await prisma.customer.count({ where: { salonId } });
    console.log(
      `seedBasicPlanCustomers: ${existingDemoCount} demo customers already exist for ${salonName} (${salonId}). Total: ${total}`
    );
    return { salonId, salonName, created: 0, total };
  }

  let created = 0;

  for (const demo of DEMO_CUSTOMERS) {
    const exists = await prisma.customer.findFirst({
      where: { salonId, phone: demo.phone },
    });
    if (exists) continue;

    const customer = await prisma.customer.create({
      data: {
        salonId,
        name: demo.name,
        phone: demo.phone,
        email: demo.email,
        notes: DEMO_NOTES,
        loyaltyPoints: demo.loyaltyPoints ?? 0,
      },
    });
    created++;

    if (demo.visitCount && demo.visitCount > 0) {
      const amounts = [400, 600, 800, 1200, 1500];
      for (let i = 0; i < demo.visitCount; i++) {
        const subtotal = amounts[i % amounts.length]!;
        const tax = Math.round(subtotal * 0.18 * 100) / 100;
        const paidAt = new Date();
        paidAt.setDate(paidAt.getDate() - (demo.visitCount - i) * 14);

        await prisma.invoice.create({
          data: {
            salonId,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            status: "paid",
            subtotal,
            tax,
            total: subtotal + tax,
            paidAt,
            paymentMethod: i % 2 === 0 ? "upi" : "card",
            lineItems: {
              create: [{
                description: "Salon service",
                quantity: 1,
                unitPrice: subtotal,
                total: subtotal,
              }],
            },
          },
        });
      }
    }
  }

  const total = await prisma.customer.count({ where: { salonId } });
  console.log(
    `seedBasicPlanCustomers: created ${created} customers for ${salonName} (${salonId}). Total: ${total}`
  );

  return { salonId, salonName, created, total };
}
