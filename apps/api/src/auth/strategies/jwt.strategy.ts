import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: httpOnly cookie
        (req: Request) =>
          (req?.cookies as Record<string, string> | undefined)?.access_token ??
          null,
        // Fallback: Authorization header (for dev tooling / tests)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      clinicianId: payload.clinicianId,
      clinicId: payload.clinicId,
      clinicRole: payload.clinicRole,
      trialEndsAt: payload.trialEndsAt,
    };
  }
}
