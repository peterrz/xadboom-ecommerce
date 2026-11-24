import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hashPassword, verifyPassword, type Role } from "@xadboom/db";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.module";

export const SESSION_COOKIE = "xb_session";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// verified against when the email is unknown, so "no such user" costs the same time as "wrong password"
const DUMMY_HASH = hashPassword("not-a-real-password");

export type AuthUser = { id: string; email: string; name: string; role: Role };

export type ProfileInput = {
  name: string;
  phone?: string | null;
  studio?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
};

const PROFILE_SELECT = { name: true, email: true, phone: true, studio: true, shipCountry: true, shipCity: true, shipAddress: true } as const;
const toProfile = (u: { name: string; email: string; phone: string | null; studio: string | null; shipCountry: string | null; shipCity: string | null; shipAddress: string | null }) => ({
  name: u.name,
  email: u.email,
  phone: u.phone,
  studio: u.studio,
  country: u.shipCountry,
  city: u.shipCity,
  address: u.shipAddress,
});

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.db.user.findUnique({ where: { email } });
    const ok = await verifyPassword(password, user ? user.passwordHash : await DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException("Incorrect email or password.");
    await this.prisma.db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
    const token = await this.jwt.signAsync({ sub: user.id });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  /** Self-service collector sign-up. Staff accounts are only created by an administrator. */
  async register(name: string, email: string, password: string) {
    if (await this.prisma.db.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new ConflictException("An account with this email already exists. Please sign in.");
    }
    const user = await this.prisma.db.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: "COLLECTOR", lastActiveAt: new Date() },
      select: { id: true, email: true, name: true, role: true },
    });
    this.mail.welcome(user.email, user.name);
    return { token: await this.jwt.signAsync({ sub: user.id }), user };
  }

  /** The signed-in user's own details, including the saved delivery address. */
  async profile(userId: string) {
    return toProfile(await this.prisma.db.user.findUniqueOrThrow({ where: { id: userId }, select: PROFILE_SELECT }));
  }

  /** Self-service edit. Email, role and verification status are never changeable here. `undefined` leaves a field alone, `null` clears it. */
  async updateProfile(userId: string, input: ProfileInput) {
    const u = await this.prisma.db.user.update({
      where: { id: userId },
      data: { name: input.name, phone: input.phone, studio: input.studio, shipCountry: input.country, shipCity: input.city, shipAddress: input.address },
      select: PROFILE_SELECT,
    });
    return toProfile(u);
  }

  /**
   * The cookie only proves who logged in. Role and existence are re-read from the database on every
   * request, so a demoted or deleted user loses access immediately.
   */
  async userFromToken(token: string | undefined): Promise<AuthUser | null> {
    if (!token) return null;
    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: string }>(token, { algorithms: ["HS256"] }));
    } catch {
      return null;
    }
    return this.prisma.db.user.findUnique({
      where: { id: sub },
      select: { id: true, email: true, name: true, role: true },
    });
  }
}
