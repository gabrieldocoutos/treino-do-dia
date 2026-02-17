import type { InviteAthlete, Login, RegisterCoach } from '@treino/shared';
import type { FastifyInstance } from 'fastify';
import { hashPassword, verifyPassword } from './password.service.js';
import { createExpiry, generateToken } from './token.service.js';

const REFRESH_TOKEN_EXPIRY_HOURS = 7 * 24; // 7 days
const INVITE_TOKEN_EXPIRY_HOURS = 7 * 24; // 7 days
const RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour

function createTokenPayload(user: { id: string; email: string; role: 'COACH' | 'ATHLETE' }) {
  return { id: user.id, email: user.email, role: user.role };
}

export async function registerCoach(app: FastifyInstance, data: RegisterCoach) {
  const passwordHash = await hashPassword(data.password);

  const userProfile = await app.prisma.userProfile.create({
    data: {
      email: data.email,
      passwordHash,
      role: 'COACH',
      isActive: true,
      coach: {
        create: {
          name: data.name,
        },
      },
    },
    include: { coach: true },
  });

  const payload = createTokenPayload(userProfile);
  const accessToken = app.jwt.sign(payload);
  const refreshToken = await createRefreshToken(app, userProfile.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      name: userProfile.coach!.name,
    },
  };
}

export async function login(app: FastifyInstance, data: Login) {
  const userProfile = await app.prisma.userProfile.findUnique({
    where: { email: data.email },
    include: { coach: true, athlete: true },
  });

  if (!userProfile || !userProfile.passwordHash) {
    throw app.httpErrors.unauthorized('Invalid email or password');
  }

  if (!userProfile.isActive) {
    throw app.httpErrors.unauthorized('Account is not active');
  }

  const valid = await verifyPassword(data.password, userProfile.passwordHash);
  if (!valid) {
    throw app.httpErrors.unauthorized('Invalid email or password');
  }

  const payload = createTokenPayload(userProfile);
  const accessToken = app.jwt.sign(payload);
  const refreshToken = await createRefreshToken(app, userProfile.id);

  const name = userProfile.role === 'COACH' ? userProfile.coach!.name : userProfile.athlete!.name;

  return {
    accessToken,
    refreshToken,
    user: {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      name,
    },
  };
}

export async function inviteAthlete(
  app: FastifyInstance,
  coachUserId: string,
  data: InviteAthlete,
) {
  const coach = await app.prisma.coach.findUnique({
    where: { userProfileId: coachUserId },
  });

  if (!coach) {
    throw app.httpErrors.notFound('Coach not found');
  }

  const token = generateToken();

  const userProfile = await app.prisma.userProfile.create({
    data: {
      email: data.email,
      role: 'ATHLETE',
      isActive: false,
      athlete: {
        create: {
          coachId: coach.id,
          name: data.name,
          notes: data.notes,
        },
      },
      inviteToken: {
        create: {
          token,
          expiresAt: createExpiry(INVITE_TOKEN_EXPIRY_HOURS),
        },
      },
    },
  });

  return {
    inviteToken: token,
    athleteEmail: userProfile.email,
  };
}

export async function activateAthlete(app: FastifyInstance, token: string, password: string) {
  const invite = await app.prisma.inviteToken.findUnique({
    where: { token },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    throw app.httpErrors.badRequest('Invalid or expired invite token');
  }

  const passwordHash = await hashPassword(password);

  await app.prisma.$transaction([
    app.prisma.userProfile.update({
      where: { id: invite.userProfileId },
      data: { passwordHash, isActive: true },
    }),
    app.prisma.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export async function requestPasswordReset(app: FastifyInstance, email: string) {
  const userProfile = await app.prisma.userProfile.findUnique({
    where: { email },
  });

  // Always return success to avoid leaking email existence
  if (!userProfile || !userProfile.isActive) {
    return;
  }

  const token = generateToken();

  // Delete any existing reset token, then create a new one
  await app.prisma.$transaction([
    app.prisma.passwordResetToken.deleteMany({
      where: { userProfileId: userProfile.id },
    }),
    app.prisma.passwordResetToken.create({
      data: {
        token,
        userProfileId: userProfile.id,
        expiresAt: createExpiry(RESET_TOKEN_EXPIRY_HOURS),
      },
    }),
  ]);

  // In a real app, send the token via email here
  return { resetToken: token };
}

export async function resetPassword(app: FastifyInstance, token: string, password: string) {
  const resetToken = await app.prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw app.httpErrors.badRequest('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(password);

  await app.prisma.$transaction([
    app.prisma.userProfile.update({
      where: { id: resetToken.userProfileId },
      data: { passwordHash },
    }),
    app.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all refresh tokens to force re-login
    app.prisma.refreshToken.deleteMany({
      where: { userProfileId: resetToken.userProfileId },
    }),
  ]);
}

export async function refreshAccessToken(app: FastifyInstance, token: string) {
  const stored = await app.prisma.refreshToken.findUnique({
    where: { token },
    include: { userProfile: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw app.httpErrors.unauthorized('Invalid or expired refresh token');
  }

  const payload = createTokenPayload(stored.userProfile);
  const accessToken = app.jwt.sign(payload);

  return { accessToken };
}

export async function logout(app: FastifyInstance, token: string) {
  await app.prisma.refreshToken.deleteMany({
    where: { token },
  });
}

export async function getMe(app: FastifyInstance, userId: string) {
  const userProfile = await app.prisma.userProfile.findUnique({
    where: { id: userId },
    include: { coach: true, athlete: true },
  });

  if (!userProfile) {
    throw app.httpErrors.notFound('User not found');
  }

  const name = userProfile.role === 'COACH' ? userProfile.coach!.name : userProfile.athlete!.name;

  return {
    id: userProfile.id,
    email: userProfile.email,
    role: userProfile.role,
    name,
  };
}

async function createRefreshToken(app: FastifyInstance, userProfileId: string): Promise<string> {
  const token = generateToken();

  await app.prisma.refreshToken.create({
    data: {
      token,
      userProfileId,
      expiresAt: createExpiry(REFRESH_TOKEN_EXPIRY_HOURS),
    },
  });

  return token;
}
