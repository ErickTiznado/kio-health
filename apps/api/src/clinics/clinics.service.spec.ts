import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { createPrismaMock } from '../test/prisma-mock';
import { makeClinic, makeClinicianProfile } from '../test/factories';
import { ClinicRole, Prisma } from '#generated/prisma';
import type { GrantableClinicRole } from './clinic-roles';

/**
 * OWNER dejó de ser un rol concedible, así que el tipo ya no lo admite: el
 * casting es justo lo que estas pruebas necesitan, porque comprueban qué pasa
 * cuando llega de todos modos (un DTO viejo, un cliente que no valida, o una
 * fila de `clinic_invitations` guardada antes de la regla).
 */
const OWNER_AS_GRANTABLE = ClinicRole.OWNER as unknown as GrantableClinicRole;

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

describe('ClinicsService', () => {
  let service: ClinicsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let email: { sendClinicInvitationEmail: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    email = { sendClinicInvitationEmail: jest.fn().mockResolvedValue(true) };
    service = new ClinicsService(prisma as any, email as any);
    jest.clearAllMocks();
  });

  // ── createClinic ───────────────────────────────────────────────────────────

  describe('createClinic()', () => {
    it('crea la clínica y asigna al creador como OWNER', async () => {
      const profile = makeClinicianProfile();
      const clinic = makeClinic();

      prisma.clinicianProfile.findUnique.mockResolvedValue({
        ...profile,
        plan: 'CLINIC',
      });
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation((cb: any) => {
        prisma.clinic.create.mockResolvedValue(clinic);
        prisma.clinicMember.create.mockResolvedValue({});
        return cb(prisma);
      });

      const result = await service.createClinic(profile.id, {
        name: 'Mi Clínica',
      });
      expect(result).toMatchObject({ id: clinic.id, name: clinic.name });
      expect(prisma.clinicMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: ClinicRole.OWNER }),
        }),
      );
    });

    // La regla vieja era `plan !== 'CLINIC'` a secas, y como el plan se elegía
    // en el onboarding sin poder cambiarlo, dejaba a todo INDIVIDUAL sin
    // clínicas de por vida. Ahora la prueba manda mientras dura.
    it('permite crear clínica durante la prueba aunque el plan sea INDIVIDUAL', async () => {
      const profile = makeClinicianProfile();
      const clinic = makeClinic();
      const enUnaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      prisma.clinicianProfile.findUnique.mockResolvedValue({
        ...profile,
        plan: 'INDIVIDUAL',
        trialEndsAt: enUnaSemana,
      });
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation((cb: any) => {
        prisma.clinic.create.mockResolvedValue(clinic);
        prisma.clinicMember.create.mockResolvedValue({});
        return cb(prisma);
      });

      await expect(
        service.createClinic(profile.id, { name: 'Mi Clínica' }),
      ).resolves.toMatchObject({ id: clinic.id });
    });

    it('lanza ForbiddenException si la prueba caducó y el plan no es CLINIC', async () => {
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      prisma.clinicianProfile.findUnique.mockResolvedValue({
        plan: 'INDIVIDUAL',
        trialEndsAt: ayer,
      });
      await expect(
        service.createClinic('clinician-id', { name: 'Clínica' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite crear clínica con plan CLINIC aunque la prueba haya caducado', async () => {
      const profile = makeClinicianProfile();
      const clinic = makeClinic();
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

      prisma.clinicianProfile.findUnique.mockResolvedValue({
        ...profile,
        plan: 'CLINIC',
        trialEndsAt: ayer,
      });
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation((cb: any) => {
        prisma.clinic.create.mockResolvedValue(clinic);
        prisma.clinicMember.create.mockResolvedValue({});
        return cb(prisma);
      });

      await expect(
        service.createClinic(profile.id, { name: 'Mi Clínica' }),
      ).resolves.toMatchObject({ id: clinic.id });
    });

    // `null` es "sin límite", no "caducada": una cuenta interna o una fila que
    // el backfill no alcanzara no puede quedar bloqueada por omisión.
    it('trata trialEndsAt nulo como prueba vigente', async () => {
      const profile = makeClinicianProfile();
      const clinic = makeClinic();

      prisma.clinicianProfile.findUnique.mockResolvedValue({
        ...profile,
        plan: 'INDIVIDUAL',
        trialEndsAt: null,
      });
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation((cb: any) => {
        prisma.clinic.create.mockResolvedValue(clinic);
        prisma.clinicMember.create.mockResolvedValue({});
        return cb(prisma);
      });

      await expect(
        service.createClinic(profile.id, { name: 'Mi Clínica' }),
      ).resolves.toMatchObject({ id: clinic.id });
    });

    it('lanza ConflictException si ya pertenece a una clínica', async () => {
      prisma.clinicianProfile.findUnique.mockResolvedValue({
        plan: 'CLINIC',
        trialEndsAt: null,
      });
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'existing-member',
      });
      await expect(
        service.createClinic('clinician-id', { name: 'Clínica' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── getMyClinic ────────────────────────────────────────────────────────────

  describe('getMyClinic()', () => {
    it('retorna la clínica del miembro', async () => {
      const clinic = makeClinic();
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'member-1',
        clinic: { ...clinic, members: [] },
      });

      const result = await service.getMyClinic('clinician-id');
      expect(result).toMatchObject({ id: clinic.id });
    });

    it('lanza NotFoundException si no pertenece a ninguna clínica', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      await expect(service.getMyClinic('nobody')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── createInvitation ───────────────────────────────────────────────────────

  describe('createInvitation()', () => {
    const createdInvitation = {
      id: 'inv-1',
      token: 'generated-token',
      invitedRole: ClinicRole.MEMBER,
      clinic: { name: 'Clínica Test' },
    };

    it('normaliza el correo y crea la invitación con token y caducidad', async () => {
      prisma.clinicInvitation.create.mockResolvedValue(createdInvitation);

      const result = await service.createInvitation('clinic-1', 'creator-id', {
        email: '  Invitado@Test.com ',
        role: ClinicRole.MEMBER,
      });

      expect(prisma.clinicInvitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clinicId: 'clinic-1',
            // En minúsculas: el canje compara esto contra `users.email`.
            invitedEmail: 'invitado@test.com',
            invitedRole: ClinicRole.MEMBER,
          }),
        }),
      );
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('link');
      expect(result.emailSent).toBe(true);
    });

    // El enlace ahora fija una credencial: 7 días era demasiado.
    it('caduca el enlace muy por debajo de los 7 días de antes', async () => {
      prisma.clinicInvitation.create.mockResolvedValue(createdInvitation);

      const result = await service.createInvitation('clinic-1', 'creator-id', {
        email: 'invitado@test.com',
        role: ClinicRole.MEMBER,
      });

      const horas = (result.expiresAt.getTime() - Date.now()) / 3600000;
      expect(horas).toBeGreaterThan(1);
      expect(horas).toBeLessThanOrEqual(48);
    });

    // El correo es un extra; el camino principal es el enlace en pantalla.
    it('devuelve el enlace aunque falle el envío del correo', async () => {
      prisma.clinicInvitation.create.mockResolvedValue(createdInvitation);
      email.sendClinicInvitationEmail.mockResolvedValue(false);

      const result = await service.createInvitation('clinic-1', 'creator-id', {
        email: 'invitado@test.com',
        role: ClinicRole.MEMBER,
      });

      expect(result.link).toContain('/join/');
      expect(result.emailSent).toBe(false);
    });

    // La escalada que esto cierra: `POST /clinics/mine/invitations` solo exige
    // `ClinicAdminGuard`, y desde que existe `POST /clinics/join/register` una
    // invitación crea la cuenta. Un ADMIN se emitía una invitación OWNER, la
    // canjeaba él (el token se le devuelve en la respuesta) y nacía un OWNER
    // irrevocable con permiso para borrar la clínica.
    it('rechaza emitir una invitación con rol OWNER', async () => {
      await expect(
        service.createInvitation('clinic-1', 'admin-id', {
          email: 'yo-mismo@test.com',
          role: OWNER_AS_GRANTABLE,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.clinicInvitation.create).not.toHaveBeenCalled();
    });
  });

  // ── listInvitations ────────────────────────────────────────────────────────

  describe('listInvitations()', () => {
    it('consulta con select explícito, sin devolver la fila entera', async () => {
      prisma.clinicInvitation.findMany.mockResolvedValue([]);

      await service.listInvitations('clinic-1');

      const args = prisma.clinicInvitation.findMany.mock.calls[0][0];
      expect(args.select).toBeDefined();
      // `token` sigue en el select a propósito: `ClinicPage.tsx` reconstruye con
      // él el enlace del botón "Copiar enlace". Ver el comentario del método.
      expect(args.select.token).toBe(true);
      expect(args.select).not.toHaveProperty('createdById');
    });
  });

  // ── validateInvitationToken ────────────────────────────────────────────────

  describe('validateInvitationToken()', () => {
    const validInvitation = {
      id: 'inv-1',
      token: 'valid-token',
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
      invitedRole: ClinicRole.MEMBER,
      invitedEmail: 'invitado@test.com',
      clinic: { name: 'Clínica Test' },
    };

    it('retorna los datos de la invitación con hasAccount=false si no existe la cuenta', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateInvitationToken('valid-token');

      expect(result).toEqual({
        clinicName: 'Clínica Test',
        invitedRole: ClinicRole.MEMBER,
        invitedEmail: 'invitado@test.com',
        hasAccount: false,
        expiresAt: validInvitation.expiresAt,
      });
    });

    // `hasAccount` es lo que decide qué canje ofrece la pantalla de /join.
    it('marca hasAccount=true si el correo invitado ya tiene usuario', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const result = await service.validateInvitationToken('valid-token');
      expect(result.hasAccount).toBe(true);
    });

    it('lanza NotFoundException si el token no existe', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(null);
      await expect(
        service.validateInvitationToken('no-existe'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si el token ya fue aceptado', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        acceptedAt: new Date(),
      });
      await expect(service.validateInvitationToken('usado')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFoundException si el token expiró', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.validateInvitationToken('expirado')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── acceptInvitation ───────────────────────────────────────────────────────

  describe('acceptInvitation()', () => {
    const validInvitation = {
      id: 'inv-1',
      clinicId: 'clinic-1',
      token: 'valid-token',
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
      invitedRole: ClinicRole.MEMBER,
    };

    it('crea ClinicMember y canjea la invitación en transacción', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.clinicInvitation.updateMany.mockResolvedValue({ count: 1 });
      prisma.clinicMember.create.mockResolvedValue({});

      await service.acceptInvitation('clinician-id', 'valid-token');

      expect(prisma.clinicMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clinicId: 'clinic-1',
            clinicianId: 'clinician-id',
            role: ClinicRole.MEMBER,
          }),
        }),
      );
      // Canje condicional, no `update` por id: es lo que impide cobrar dos
      // veces la misma invitación desde dos peticiones simultáneas.
      expect(prisma.clinicInvitation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ acceptedAt: null }),
          data: expect.objectContaining({ acceptedAt: expect.any(Date) }),
        }),
      );
    });

    // La carrera: dos peticiones leen la invitación sin aceptar, la primera la
    // canjea y la segunda tiene que abortar sin crear un segundo miembro.
    it('aborta si otra petición canjeó la invitación primero', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      prisma.clinicInvitation.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.acceptInvitation('clinician-id', 'valid-token'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.clinicMember.create).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el token es inválido', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(null);
      await expect(
        service.acceptInvitation('clinician-id', 'bad'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si ya pertenece a una clínica', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.clinicMember.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        service.acceptInvitation('clinician-id', 'valid-token'),
      ).rejects.toThrow(ConflictException);
    });

    // Rechazar al emitir no alcanza a las filas ya guardadas con OWNER, que
    // siguen vivas hasta 48 h con su token en el correo de alguien.
    it('no honra una invitación guardada con rol OWNER', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        invitedRole: ClinicRole.OWNER,
      });
      prisma.clinicMember.findFirst.mockResolvedValue(null);

      await expect(
        service.acceptInvitation('clinician-id', 'valid-token'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.clinicMember.create).not.toHaveBeenCalled();
    });
  });

  // ── registerFromInvitation ─────────────────────────────────────────────────

  describe('registerFromInvitation()', () => {
    const validInvitation = {
      id: 'inv-1',
      clinicId: 'clinic-1',
      token: 'valid-token',
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
      invitedRole: ClinicRole.ADMIN,
      invitedEmail: 'colega@test.com',
      clinic: { id: 'clinic-1', name: 'Clínica Test' },
    };

    const dto = {
      token: 'valid-token',
      password: 'Password1',
      fullName: '  Ana Colega  ',
    };

    const arrangeHappyPath = () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.clinicInvitation.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'colega@test.com',
      });
      prisma.clinicianProfile.create.mockResolvedValue({ id: 'profile-1' });
      prisma.clinicMember.create.mockResolvedValue({});
    };

    it('crea User, ClinicianProfile y ClinicMember con el rol invitado', async () => {
      arrangeHappyPath();

      const result = await service.registerFromInvitation(dto);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            // El correo sale de la invitación, no del cuerpo: el enlace es
            // nominativo y quien lo reciba no puede estrenar otra dirección.
            email: 'colega@test.com',
            fullName: 'Ana Colega',
            passwordHash: 'hashed_password',
            role: 'CLINICIAN',
          }),
        }),
      );
      expect(prisma.clinicMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clinicId: 'clinic-1',
            clinicianId: 'profile-1',
            role: ClinicRole.ADMIN,
          }),
        }),
      );
      expect(result).toMatchObject({
        email: 'colega@test.com',
        clinicId: 'clinic-1',
        clinicName: 'Clínica Test',
        role: ClinicRole.ADMIN,
      });
    });

    // El alta vieja dejaba `trialEndsAt` null, que en lib/trial.ts es "sin
    // límite": el colega tenía prueba infinita y quien se registraba solo, 15
    // días.
    it('fija trialEndsAt en el perfil nuevo', async () => {
      arrangeHappyPath();

      await service.registerFromInvitation(dto);

      const data = prisma.clinicianProfile.create.mock.calls[0][0].data;
      expect(data.trialEndsAt).toBeInstanceOf(Date);
      expect(data.trialEndsAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('canjea la invitación antes de crear nada', async () => {
      arrangeHappyPath();

      await service.registerFromInvitation(dto);

      expect(prisma.clinicInvitation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'inv-1',
            acceptedAt: null,
          }),
          data: expect.objectContaining({ acceptedAt: expect.any(Date) }),
        }),
      );
    });

    it('no crea usuario si otra petición canjeó el token primero', async () => {
      arrangeHappyPath();
      prisma.clinicInvitation.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el token no existe', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(null);
      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFoundException si la invitación expiró', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFoundException si la invitación ya fue aceptada', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        acceptedAt: new Date(),
      });
      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Quien ya tiene cuenta debe iniciar sesión y aceptar por el otro camino:
    // este endpoint es público y no puede tocar una cuenta existente.
    it('lanza ConflictException si el correo invitado ya tiene cuenta', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-existente' });

      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.clinicInvitation.updateMany).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    // El pre-chequeo de `user.findUnique` vive fuera de la transacción: entre
    // él y el `create` cabe un `POST /auth/signup` con el mismo correo. La
    // unique de `users.email` lo para, pero sin traducir el P2002 el cliente
    // recibía un 500 en vez del 409 que el contrato promete.
    it('traduce el choque de correo (P2002) en ConflictException, no en 500', async () => {
      arrangeHappyPath();
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['email'] },
        }),
      );

      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('propaga cualquier otro fallo de la transacción sin disfrazarlo', async () => {
      arrangeHappyPath();
      prisma.user.create.mockRejectedValue(new Error('conexión caída'));

      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        'conexión caída',
      );
    });

    it('no honra una invitación guardada con rol OWNER', async () => {
      prisma.clinicInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        invitedRole: ClinicRole.OWNER,
      });

      await expect(service.registerFromInvitation(dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.clinicInvitation.updateMany).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ── updateMemberRole ───────────────────────────────────────────────────────

  describe('updateMemberRole()', () => {
    it('cambia el rol de un miembro que no es OWNER', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'member-1',
        role: ClinicRole.MEMBER,
      });
      prisma.clinicMember.update.mockResolvedValue({
        id: 'member-1',
        role: ClinicRole.ADMIN,
      });

      await service.updateMemberRole('clinic-1', 'clinician-1', {
        role: ClinicRole.ADMIN,
      });

      expect(prisma.clinicMember.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { role: ClinicRole.ADMIN },
      });
    });

    // Promover a OWNER no transfiere la propiedad: la duplica, y el segundo
    // OWNER ya no se puede degradar ni quitar, y puede borrar la clínica.
    it('rechaza promover a OWNER', async () => {
      await expect(
        service.updateMemberRole('clinic-1', 'clinician-1', {
          role: OWNER_AS_GRANTABLE,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.clinicMember.update).not.toHaveBeenCalled();
    });

    it('lanza ForbiddenException al intentar cambiar el rol del OWNER', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'owner-member',
        role: ClinicRole.OWNER,
      });

      await expect(
        service.updateMemberRole('clinic-1', 'owner-id', {
          role: ClinicRole.MEMBER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lanza NotFoundException si el miembro no existe', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('clinic-1', 'nobody', {
          role: ClinicRole.MEMBER,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── removeMember ───────────────────────────────────────────────────────────

  describe('removeMember()', () => {
    it('elimina al miembro si existe y no es OWNER', async () => {
      const member = { id: 'member-1', role: ClinicRole.MEMBER };
      prisma.clinicMember.findFirst.mockResolvedValue(member);
      prisma.clinicMember.delete.mockResolvedValue(member);

      await service.removeMember('clinic-1', 'clinician-1');
      expect(prisma.clinicMember.delete).toHaveBeenCalledWith({
        where: { id: 'member-1' },
      });
    });

    it('lanza NotFoundException si el miembro no existe', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue(null);
      await expect(service.removeMember('clinic-1', 'nobody')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza ForbiddenException al intentar remover al OWNER', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'owner-member',
        role: ClinicRole.OWNER,
      });
      await expect(
        service.removeMember('clinic-1', 'owner-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── getClinicPatients ──────────────────────────────────────────────────────

  describe('getClinicPatients()', () => {
    it('retorna pacientes de todos los miembros de la clínica sin campos encriptados', async () => {
      prisma.clinicMember.findMany.mockResolvedValue([
        { clinicianId: 'doc-1' },
        { clinicianId: 'doc-2' },
      ]);
      prisma.patient.findMany.mockResolvedValue([
        {
          id: 'p1',
          fullName: 'Paciente 1',
          status: 'ACTIVE',
          createdAt: new Date(),
          clinicianId: 'doc-1',
        },
        {
          id: 'p2',
          fullName: 'Paciente 2',
          status: 'ACTIVE',
          createdAt: new Date(),
          clinicianId: 'doc-2',
        },
      ]);

      const result = await service.getClinicPatients('clinic-1');

      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clinicianId: { in: ['doc-1', 'doc-2'] } },
          select: expect.objectContaining({ id: true, fullName: true }),
        }),
      );
      expect(result).toHaveLength(2);
      // Sin campos encriptados
      expect(result[0]).not.toHaveProperty('diagnosis');
      expect(result[0]).not.toHaveProperty('contactPhone');
    });
  });

  // ── leaveClinic ────────────────────────────────────────────────────────────

  describe('leaveClinic()', () => {
    it('elimina el membership si el clinician no es OWNER', async () => {
      const membership = { id: 'member-1', role: ClinicRole.MEMBER };
      prisma.clinicMember.findFirst.mockResolvedValue(membership);
      prisma.clinicMember.delete.mockResolvedValue(membership);

      await service.leaveClinic('clinician-id');
      expect(prisma.clinicMember.delete).toHaveBeenCalledWith({
        where: { id: 'member-1' },
      });
    });

    it('lanza ForbiddenException si el OWNER intenta abandonar', async () => {
      prisma.clinicMember.findFirst.mockResolvedValue({
        id: 'member-1',
        role: ClinicRole.OWNER,
      });
      await expect(service.leaveClinic('owner-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
