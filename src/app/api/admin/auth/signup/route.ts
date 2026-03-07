import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, inviteSecret } = await req.json();

    // Validate invite secret — only people you share this with can sign up
    const expected = process.env.ADMIN_SIGNUP_SECRET;
    if (!expected || inviteSecret !== expected) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 403 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Password strength: min 8 chars
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Check if an admin with this email already exists
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      if (existing.role === "admin") {
        return NextResponse.json({ error: "An admin account with this email already exists." }, { status: 409 });
      }
      // Upgrade existing regular user to admin and set password
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { role: "admin", passwordHash: hash, name: name || existing.name },
      });
      return NextResponse.json({ ok: true, message: "Admin account created." });
    }

    // Create new admin user
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: "admin",
        passwordHash: hash,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ ok: true, message: "Admin account created." });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
