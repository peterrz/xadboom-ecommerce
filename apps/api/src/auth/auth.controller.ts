import { Body, Controller, Get, HttpCode, Patch, Post, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { z } from "zod";
import { ZodPipe } from "../common/zod.pipe";
import { Auth, CurrentUser } from "./auth.guard";
import { AuthService, SESSION_COOKIE, SESSION_MAX_AGE_MS, type AuthUser } from "./auth.service";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});
type LoginBody = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});
type RegisterBody = z.infer<typeof registerSchema>;

// "" clears a field, a missing field leaves it unchanged
const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullish();
const profileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  phone: optText(40),
  studio: optText(160),
  country: optText(80),
  city: optText(80),
  address: optText(500),
});
type ProfileBody = z.infer<typeof profileSchema>;

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
  path: "/",
});

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // 5 attempts / 5 min per client IP
  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 5 * 60 * 1000 } })
  async login(@Body(new ZodPipe(loginSchema)) body: LoginBody, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(body.email, body.password);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_MS });
    return { user };
  }

  // 5 sign-ups / hour per client IP
  @Post("register")
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  async register(@Body(new ZodPipe(registerSchema)) body: RegisterBody, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.register(body.name, body.email, body.password);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_MS });
    return { user };
  }

  @Post("logout")
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, cookieOptions());
  }

  @Get("me")
  @Auth()
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Get("profile")
  @Auth()
  profile(@CurrentUser() user: AuthUser) {
    return this.auth.profile(user.id);
  }

  @Patch("profile")
  @Auth()
  @HttpCode(200)
  updateProfile(@CurrentUser() user: AuthUser, @Body(new ZodPipe(profileSchema)) body: ProfileBody) {
    return this.auth.updateProfile(user.id, body);
  }
}
