import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../lib/email.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { RegisterFromInvitationDto } from './dto/register-from-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ClinicRole, ClinicianType, Prisma, UserRole } from '#generated/prisma';
import { computeTrialEnd, isTrialExpired } from '../lib/trial';
import {
  isGrantableClinicRole,
  OWNER_NOT_GRANTABLE_MESSAGE,
} from './clinic-roles';

/**
 * Vida útil del enlace de invitación, en horas.
 *
 * Eran 7 días, y eso se decidió cuando el enlace solo servía para que alguien
 * que YA tenía cuenta se uniera a la clínica: lo peor que podía pasar era que
 * un desconocido entrara como MEMBER. Ahora el mismo enlace FIJA UNA
 * CREDENCIAL (crea el usuario y su contraseña), así que vale tanto como un
 * enlace de restablecimiento — y esos viven 1 hora (`auth.service.ts`).
 *
 * No se copia esa hora porque los dos casos no se parecen en lo operativo: el
 * reset lo pide el propio dueño y lo abre a los pocos segundos, mientras que
 * una invitación de clínica es asíncrona y el colega puede no mirar el correo
 * hasta el día siguiente. 48 h cubre "lo abro mañana por la mañana" sin dejar
 * un token en claro dormido una semana en una bandeja de entrada.
 */
const INVITATION_TTL_HOURS = 48;

/** Mismo texto para el pre-chequeo y para el P2002 que se le escapa por la carrera. */
const EMAIL_ALREADY_REGISTERED_MESSAGE =
  'Ya existe una cuenta con este correo. Inicia sesión y acepta la invitación desde ahí.';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createClinic(clinicianId: string, dto: CreateClinicDto) {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { id: clinicianId },
      select: { plan: true, trialEndsAt: true },
    });

    // Antes esto era `plan !== 'CLINIC'` a secas, y como el plan se elegía en el
    // onboarding y no se podía cambiar, quien marcó "individual" en su primer
    // minuto de uso se quedaba sin clínicas para siempre: 403 y un mensaje de
    // "contacta a soporte". Durante la prueba se puede montar una clínica y
    // verla funcionar; después manda el plan contratado.
    const duringTrial = !isTrialExpired(profile?.trialEndsAt);
    if (!duringTrial && profile?.plan !== 'CLINIC') {
      throw new ForbiddenException(
        'Tu prueba terminó. Elige un plan para crear una clínica.',
      );
    }

    const existing = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (existing) {
      throw new ConflictException('Ya perteneces a una clínica');
    }

    return this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({ data: { name: dto.name } });
      await tx.clinicMember.create({
        data: { clinicId: clinic.id, clinicianId, role: ClinicRole.OWNER },
      });
      return clinic;
    });
  }

  async getMyClinic(clinicianId: string) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
      include: {
        clinic: {
          include: {
            members: {
              include: {
                clinician: {
                  select: { id: true, user: { select: { email: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('No perteneces a ninguna clínica');
    }

    return membership.clinic;
  }

  async updateClinic(clinicId: string, dto: UpdateClinicDto) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: { name: dto.name },
    });
  }

  async deleteClinic(clinicId: string) {
    await this.prisma.clinic.delete({ where: { id: clinicId } });
  }

  async createInvitation(
    clinicId: string,
    createdById: string,
    dto: InviteMemberDto,
  ) {
    // El DTO ya lo rechaza con un 400; esto es la misma regla en la capa que
    // manda, para que no dependa de qué DTO se use ni de que el `ValidationPipe`
    // siga configurado como hoy. Ver `clinic-roles.ts`.
    if (!isGrantableClinicRole(dto.role)) {
      throw new ForbiddenException(OWNER_NOT_GRANTABLE_MESSAGE);
    }

    const token = randomUUID();
    const expiresAt = new Date(
      Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000,
    );
    // Normalizado igual que en `users.email`: el canje compara `invitedEmail`
    // contra la tabla de usuarios, y "Ana@X.com" vs "ana@x.com" haría que el
    // mismo correo pareciera dos personas distintas.
    const invitedEmail = dto.email.toLowerCase().trim();

    const invitation = await this.prisma.clinicInvitation.create({
      data: {
        clinicId,
        invitedEmail,
        invitedRole: dto.role,
        token,
        expiresAt,
        createdById,
      },
      include: { clinic: { select: { name: true } } },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const link = `${frontendUrl}/join/${token}`;

    // El correo es un extra, no el camino principal: el admin sigue recibiendo
    // el link para copiarlo a mano. Por eso un fallo de envío no puede tumbar
    // la invitación ya creada — se registra y se informa con `emailSent`.
    const emailSent = await this.emailService
      .sendClinicInvitationEmail({
        to: invitedEmail,
        clinicName: invitation.clinic.name,
        invitedRole: invitation.invitedRole,
        joinUrl: link,
        expiresInHours: INVITATION_TTL_HOURS,
      })
      // El `catch` es cinturón sobre tirantes: el propio EmailService ya se
      // traga sus fallos, pero esta invitación YA está en la base de datos y
      // ninguna excepción de correo puede convertirla en un 500.
      .catch(() => false);

    if (!emailSent) {
      this.logger.warn(
        `Invitación ${invitation.id} creada pero no se pudo enviar el correo a ${invitedEmail}; el enlace se devuelve al administrador.`,
      );
    }

    return { token, link, expiresAt, emailSent };
  }

  /**
   * Invitaciones pendientes de la clínica.
   *
   * `select` explícito en vez de la fila entera: lo que se devuelva aquí sale
   * hacia un cliente, y sin `select` cualquier columna futura de
   * `clinic_invitations` se publica sola.
   *
   * `token` SIGUE en la lista, y no es un descuido. `ClinicPage.tsx` reconstruye
   * el enlace de cada invitación pendiente con él (`/join/${inv.token}`) para el
   * botón "Copiar enlace", así que quitarlo rompe hoy esa pantalla. Y quitarlo
   * tampoco cerraría el agujero que parece cerrar: `createInvitation()` ya le
   * devuelve `{ token, link }` al administrador que la emite, que es de donde
   * sale el enlace la primera vez. Mientras el enlace sea un artefacto que el
   * admin copia a mano —decisión de producto declarada en `createInvitation`—,
   * un admin puede canjear la invitación de su colega y elegirle la contraseña.
   * Cerrarlo de verdad exige las dos mitades a la vez: guardar solo un
   * `tokenHash` (migración) y que el enlace viaje únicamente por correo. Está
   * anotado como necesidad entre carriles; no se puede hacer aquí sin dejar la
   * pantalla de clínica sin enlace que copiar.
   */
  async listInvitations(clinicId: string) {
    return this.prisma.clinicInvitation.findMany({
      where: { clinicId, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        clinicId: true,
        invitedEmail: true,
        invitedRole: true,
        token: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvitation(clinicId: string, invitationId: string) {
    const invitation = await this.prisma.clinicInvitation.findFirst({
      where: { id: invitationId, clinicId },
    });
    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }
    await this.prisma.clinicInvitation.delete({ where: { id: invitationId } });
  }

  /**
   * Qué hay detrás de un token, antes de pedirle nada al invitado.
   *
   * Devuelve `hasAccount` para que la pantalla de `/join/:token` sepa cuál de
   * los dos canjes ofrecer: iniciar sesión y aceptar (`POST /clinics/join`) o
   * crear la cuenta ahí mismo (`POST /clinics/join/register`). Enseñar el
   * `invitedEmail` no filtra nada: el token es un secreto que solo llegó a esa
   * dirección, y el invitado necesita ver con qué correo va a entrar.
   */
  async validateInvitationToken(token: string) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token },
      include: { clinic: { select: { name: true } } },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación no válida o expirada');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.invitedEmail },
      select: { id: true },
    });

    return {
      clinicName: invitation.clinic.name,
      invitedRole: invitation.invitedRole,
      invitedEmail: invitation.invitedEmail,
      hasAccount: Boolean(existingUser),
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Una invitación con `invitedRole: OWNER` no se honra al canjearla.
   *
   * Rechazar al emitir no basta: las filas de `clinic_invitations` que ya
   * estuvieran guardadas con OWNER siguen ahí, con hasta 48 h de vida y su token
   * en el correo de alguien. El canje es el único punto por el que un
   * `ClinicMember` nace de una invitación, así que la comprobación se repite
   * aquí y esas filas caducan sin poder cobrarse.
   */
  private assertInvitedRoleIsGrantable(role: ClinicRole) {
    if (!isGrantableClinicRole(role)) {
      throw new ForbiddenException(OWNER_NOT_GRANTABLE_MESSAGE);
    }
  }

  /** Canje para quien YA tiene cuenta y perfil clínico. */
  async acceptInvitation(clinicianId: string, token: string) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación no válida o expirada');
    }

    this.assertInvitedRoleIsGrantable(invitation.invitedRole);

    const existing = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (existing) {
      throw new ConflictException('Ya perteneces a una clínica');
    }

    return this.prisma.$transaction(async (tx) => {
      // Canje atómico: antes era `findUnique` + `update` por id, y entre las
      // dos consultas cabe otra petición con el mismo token, así que una
      // invitación se podía cobrar dos veces. Con `acceptedAt: null` en el
      // WHERE, solo una de las dos afecta filas; la otra ve count 0 y aborta.
      const claimed = await tx.clinicInvitation.updateMany({
        where: { id: invitation.id, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });

      if (claimed.count !== 1) {
        throw new ConflictException('Esta invitación ya fue usada');
      }

      await tx.clinicMember.create({
        data: {
          clinicId: invitation.clinicId,
          clinicianId,
          role: invitation.invitedRole,
        },
      });
    });
  }

  /**
   * Canje para quien NO tiene cuenta: crea `User` + `ClinicianProfile` +
   * `ClinicMember` de una vez, con el correo de la propia invitación.
   *
   * Es público (`POST /clinics/join/register`). Lo único que autoriza el alta
   * es el token, así que todo lo demás lo decide la invitación y no el cuerpo
   * de la petición: el correo es `invitedEmail` y el rol es `invitedRole`. El
   * invitado solo aporta su nombre y su contraseña — que nadie más llega a
   * conocer, a diferencia del endpoint que esto sustituye.
   */
  async registerFromInvitation(dto: RegisterFromInvitationDto) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token: dto.token },
      include: { clinic: { select: { id: true, name: true } } },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación no válida o expirada');
    }

    this.assertInvitedRoleIsGrantable(invitation.invitedRole);

    const email = invitation.invitedEmail.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      await this.runInvitationRegistration({
        invitationId: invitation.id,
        clinicId: invitation.clinicId,
        invitedRole: invitation.invitedRole,
        email,
        fullName: dto.fullName.trim(),
        passwordHash,
      });
    } catch (err) {
      // El pre-chequeo de `user.findUnique` vive fuera de la transacción, así
      // que entre él y el `create` cabe otra alta con el mismo correo: un
      // `POST /auth/signup`, o dos invitaciones distintas a la misma dirección
      // canjeándose a la vez. La unique de `users.email` lo para —la
      // transacción revierte y el token no se quema—, pero sin traducir el
      // P2002 el cliente recibía un 500 en lugar del 409 que el contrato
      // promete y que la pantalla de /join sabe interpretar.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      throw err;
    }

    // Sin tokens ni cookies: el alta no inicia sesión. El front llama después
    // a `POST /auth/login` con este correo y la contraseña que el invitado
    // acaba de elegir; emitir la sesión aquí obligaría a duplicar la
    // configuración de cookies de `auth.controller.ts` en un segundo sitio.
    return {
      email,
      clinicId: invitation.clinicId,
      clinicName: invitation.clinic.name,
      role: invitation.invitedRole,
    };
  }

  /** Canje + alta de cuenta en una sola transacción. */
  private async runInvitationRegistration(params: {
    invitationId: string;
    clinicId: string;
    invitedRole: ClinicRole;
    email: string;
    fullName: string;
    passwordHash: string;
  }) {
    const {
      invitationId,
      clinicId,
      invitedRole,
      email,
      fullName,
      passwordHash,
    } = params;

    await this.prisma.$transaction(async (tx) => {
      // El canje va PRIMERO y con `acceptedAt: null` en el WHERE, igual que el
      // de `BetaInvitation`: si dos peticiones traen el mismo token, solo una
      // afecta filas y la otra aborta antes de crear ningún usuario. Dentro de
      // la transacción para que un fallo al crear la cuenta devuelva el token
      // a su sitio en vez de quemarlo sin cuenta detrás.
      const claimed = await tx.clinicInvitation.updateMany({
        where: { id: invitationId, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });

      if (claimed.count !== 1) {
        throw new ConflictException('Esta invitación ya fue usada');
      }

      const user = await tx.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: UserRole.CLINICIAN,
        },
      });

      const profile = await tx.clinicianProfile.create({
        data: {
          userId: user.id,
          type: ClinicianType.PSYCHOLOGIST,
          // El endpoint viejo no fijaba esto y el perfil nacía con
          // `trialEndsAt` null, que en `lib/trial.ts` significa "sin límite":
          // el colega dado de alta por su clínica se quedaba con una prueba
          // infinita mientras quien se registraba por su cuenta tenía 15 días.
          trialEndsAt: computeTrialEnd(),
        },
      });

      await tx.clinicMember.create({
        data: {
          clinicId,
          clinicianId: profile.id,
          role: invitedRole,
        },
      });
    });
  }

  async removeMember(clinicId: string, targetClinicianId: string) {
    const member = await this.prisma.clinicMember.findFirst({
      where: { clinicId, clinicianId: targetClinicianId },
    });
    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }
    if (member.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'No se puede remover al propietario de la clínica',
      );
    }
    await this.prisma.clinicMember.delete({ where: { id: member.id } });
  }

  async updateMemberRole(
    clinicId: string,
    targetClinicianId: string,
    dto: UpdateMemberRoleDto,
  ) {
    // Promover a OWNER no transfiere la propiedad: la duplica, y el segundo
    // OWNER es irrevocable (`removeMember` y `updateMemberRole` se niegan a
    // tocarlo, `leaveClinic` se niega a sacarlo) y puede borrar la clínica.
    // La transferencia real va por su propio endpoint. Ver `clinic-roles.ts`.
    if (!isGrantableClinicRole(dto.role)) {
      throw new ForbiddenException(OWNER_NOT_GRANTABLE_MESSAGE);
    }

    const member = await this.prisma.clinicMember.findFirst({
      where: { clinicId, clinicianId: targetClinicianId },
    });
    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }
    if (member.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'No se puede cambiar el rol del propietario',
      );
    }
    return this.prisma.clinicMember.update({
      where: { id: member.id },
      data: { role: dto.role },
    });
  }

  async getClinicPatients(clinicId: string) {
    const members = await this.prisma.clinicMember.findMany({
      where: { clinicId },
      select: { clinicianId: true },
    });
    const clinicianIds = members.map((m) => m.clinicianId);

    const patients = await this.prisma.patient.findMany({
      where: { clinicianId: { in: clinicianIds } },
      select: {
        id: true,
        fullName: true,
        status: true,
        createdAt: true,
        clinicianId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return patients;
  }

  async getClinicFinanceSummary(clinicId: string, month: number, year: number) {
    const members = await this.prisma.clinicMember.findMany({
      where: { clinicId },
      include: {
        clinician: { select: { id: true, user: { select: { email: true } } } },
      },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const results = await Promise.all(
      members.map(async (member) => {
        const transactions = await this.prisma.financeTransaction.findMany({
          where: {
            clinicianId: member.clinicianId,
            date: { gte: startDate, lt: endDate },
          },
          select: { type: true, amount: true },
        });

        const income = transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          clinicianId: member.clinicianId,
          email: member.clinician.user.email,
          role: member.role,
          income,
          expense,
        };
      }),
    );

    return results;
  }

  /** Asistencia por miembro en el mes: completadas, no-shows y tasa. */
  async getClinicAttendance(clinicId: string, month: number, year: number) {
    const members = await this.prisma.clinicMember.findMany({
      where: { clinicId },
      include: {
        clinician: { select: { id: true, user: { select: { email: true } } } },
      },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return Promise.all(
      members.map(async (member) => {
        const byStatus = await this.prisma.appointment.groupBy({
          by: ['status'],
          where: {
            clinicianId: member.clinicianId,
            startTime: { gte: startDate, lt: endDate },
          },
          _count: { _all: true },
        });

        const count = (status: string) =>
          byStatus.find((g) => g.status === status)?._count._all ?? 0;
        const completed = count('COMPLETED');
        const noShow = count('NO_SHOW');

        return {
          clinicianId: member.clinicianId,
          email: member.clinician.user.email,
          role: member.role,
          completed,
          noShow,
          cancelled: count('CANCELLED'),
          scheduled: count('SCHEDULED'),
          attendanceRate:
            completed + noShow > 0 ? completed / (completed + noShow) : null,
        };
      }),
    );
  }

  async leaveClinic(clinicianId: string) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (!membership) {
      throw new NotFoundException('No perteneces a ninguna clínica');
    }
    if (membership.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'El propietario no puede abandonar la clínica. Elimínala o transfiere la propiedad primero.',
      );
    }
    await this.prisma.clinicMember.delete({ where: { id: membership.id } });
  }
}
