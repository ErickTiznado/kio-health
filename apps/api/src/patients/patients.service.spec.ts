import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { createPrismaMock } from '../test/prisma-mock';
import { createTestEncryptionService } from '../test/encryption-helpers';
import { makePatient } from '../test/factories';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  const encryptionService = createTestEncryptionService();

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new PatientsService(prisma as any, encryptionService);
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('encrypts diagnosis, clinicalContext, contactPhone before storing', async () => {
      const clinicianId = 'clinician-1';
      const dto = {
        fullName: 'Ana López',
        diagnosis: 'Trastorno de ansiedad',
        clinicalContext: 'Contexto clínico',
        contactPhone: '+52 55 0000 0000',
      };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      expect(createCall.diagnosis).not.toBe(dto.diagnosis);
      expect(createCall.clinicalContext).not.toBe(dto.clinicalContext);
      expect(createCall.contactPhone).not.toBe(dto.contactPhone);
      // Verify ciphertext format: iv:tag:data
      expect(createCall.diagnosis).toMatch(
        /^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/,
      );
    });

    it('serializes emergencyContact to JSON before encrypting', async () => {
      const clinicianId = 'clinician-1';
      const emergencyContact = { name: 'Carlos', phone: '5555555555' };
      const dto = { fullName: 'Test', emergencyContact };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      // Decrypt and verify JSON round-trip
      const decrypted = encryptionService.decrypt(createCall.emergencyContact);
      expect(JSON.parse(decrypted)).toEqual(emergencyContact);
    });

    it('stores null for undefined/null sensitive fields', async () => {
      const clinicianId = 'clinician-1';
      const dto = {
        fullName: 'Test',
        diagnosis: undefined,
        contactPhone: null,
      };
      prisma.patient.create.mockImplementation(async ({ data }: any) => ({
        ...makePatient({ clinicianId }),
        ...data,
      }));

      await service.create(clinicianId, dto as any);

      const createCall = prisma.patient.create.mock.calls[0][0].data;
      expect(createCall.diagnosis).toBeUndefined();
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('queries with both id AND clinicianId (ownership enforcement)', async () => {
      const patient = makePatient();
      prisma.patient.findFirst.mockResolvedValue(patient);

      await service.findOne(patient.id, 'clinician-123');

      expect(prisma.patient.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: patient.id, clinicianId: 'clinician-123' },
        }),
      );
    });

    it('throws NotFoundException when patient not found (wrong clinicianId)', async () => {
      prisma.patient.findFirst.mockResolvedValue(null);
      await expect(
        service.findOne('any-id', 'wrong-clinician'),
      ).rejects.toThrow(NotFoundException);
    });

    it('decrypts diagnosis and clinicalContext on return', async () => {
      const plainDiagnosis = 'Depresión moderada';
      const plainPhone = '+52 55 9999 0000';
      const patient = makePatient({
        diagnosis: encryptionService.encrypt(plainDiagnosis),
        contactPhone: encryptionService.encrypt(plainPhone),
      });
      prisma.patient.findFirst.mockResolvedValue(patient);

      const result = await service.findOne(
        patient.id as string,
        patient.clinicianId as string,
      );

      expect(result.diagnosis).toBe(plainDiagnosis);
      expect(result.contactPhone).toBe(plainPhone);
    });

    it('parses emergencyContact JSON after decryption', async () => {
      const contactObj = {
        name: 'María',
        relation: 'madre',
        phone: '5550001234',
      };
      const patient = makePatient({
        emergencyContact: encryptionService.encrypt(JSON.stringify(contactObj)),
      });
      prisma.patient.findFirst.mockResolvedValue(patient);

      const result = await service.findOne(
        patient.id as string,
        patient.clinicianId as string,
      );

      expect(result.emergencyContact).toEqual(contactObj);
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('always filters by clinicianId', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-abc', {} as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.clinicianId).toBe('clinician-abc');
    });

    it('excludes ARCHIVED by default when no status filter', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', {} as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.status).toEqual({ not: 'ARCHIVED' });
    });

    it('uses provided status filter when given', async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', { status: 'ARCHIVED' } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.status).toBe('ARCHIVED');
    });

    it('returns correct pagination meta', async () => {
      prisma.patient.findMany.mockResolvedValue([makePatient(), makePatient()]);
      prisma.patient.count.mockResolvedValue(25);

      const result = await service.findAll('clinician-1', {
        page: 2,
        limit: 10,
      } as any);

      expect(result.meta).toEqual({ total: 25, page: 2, lastPage: 3 });
    });

    it('sin filtro de saldo, el agregado se acota a los ids de la página', async () => {
      const patient = makePatient();
      prisma.patient.findMany.mockResolvedValue([patient]);
      prisma.patient.count.mockResolvedValue(1);

      await service.findAll('clinician-1', {} as any);

      const groupByWhere = prisma.appointment.groupBy.mock.calls[0][0].where;
      expect(groupByWhere.patientId).toEqual({ in: [patient.id] });
      // El camino normal no debe pagar un agregado sobre toda la cartera.
      expect(prisma.appointment.groupBy).toHaveBeenCalledTimes(1);
    });
  });

  // ── findAll() · filtro de riesgo ──────────────────────────────────────────

  describe('findAll() riskFlag', () => {
    const ACTIVE_FLAG = { resolvedAt: null, flagTypes: { isEmpty: false } };

    beforeEach(() => {
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);
    });

    it('riskFlag=true exige resolvedAt null Y flagTypes no vacío', async () => {
      await service.findAll('clinician-1', { riskFlag: true } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.riskFlag).toEqual(ACTIVE_FLAG);
      // Las dos condiciones son independientes: una fila resuelta a medias
      // conserva resolvedAt null, y una sin banderas tiene flagTypes vacío.
      expect(whereArg.riskFlag.resolvedAt).toBeNull();
      expect(whereArg.riskFlag.flagTypes).toEqual({ isEmpty: false });
    });

    it('el conteo usa el mismo where que el listado', async () => {
      await service.findAll('clinician-1', { riskFlag: true } as any);

      expect(prisma.patient.count.mock.calls[0][0].where).toEqual(
        prisma.patient.findMany.mock.calls[0][0].where,
      );
    });

    it('riskFlag=false excluye por NOT sin pisar el OR de la búsqueda', async () => {
      await service.findAll('clinician-1', {
        riskFlag: false,
        search: 'ana',
      } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.NOT).toEqual({ riskFlag: ACTIVE_FLAG });
      expect(whereArg.OR).toEqual([
        { fullName: { contains: 'ana', mode: 'insensitive' } },
      ]);
      expect(whereArg.riskFlag).toBeUndefined();
    });

    it('sin el parámetro no añade ningún filtro de bandera', async () => {
      await service.findAll('clinician-1', {} as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.riskFlag).toBeUndefined();
      expect(whereArg.NOT).toBeUndefined();
    });
  });

  // ── findAll() · filtro de saldo ───────────────────────────────────────────

  describe('findAll() hasBalance', () => {
    it('agrega los saldos ANTES de listar y acota el where por ids', async () => {
      const conSaldo = makePatient();
      const sinSaldo = makePatient();
      prisma.appointment.groupBy.mockResolvedValue([
        { patientId: conSaldo.id, _sum: { price: 1500 } },
        // Una sesión completada de precio 0 no es saldo pendiente.
        { patientId: sinSaldo.id, _sum: { price: 0 } },
      ]);
      prisma.patient.findMany.mockResolvedValue([conSaldo]);
      prisma.patient.count.mockResolvedValue(1);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
      } as any);

      // El agregado corre sobre TODAS las citas del clínico, no sobre la página.
      const groupByWhere = prisma.appointment.groupBy.mock.calls[0][0].where;
      expect(groupByWhere.clinicianId).toBe('clinician-1');
      expect(groupByWhere.patientId).toBeUndefined();
      expect(groupByWhere.status).toBe('COMPLETED');
      expect(groupByWhere.paymentStatus).toBe('PENDING');

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.id).toEqual({ in: [conSaldo.id] });
      expect(result.data[0].pendingBalance).toBe(1500);
      // El mapa completo ya está en memoria: no se vuelve a agregar por página.
      expect(prisma.appointment.groupBy).toHaveBeenCalledTimes(1);
    });

    it('el conteo y lastPage sólo cuentan pacientes con saldo', async () => {
      const owing = Array.from({ length: 25 }, () => makePatient());
      prisma.appointment.groupBy.mockResolvedValue(
        owing.map((p) => ({ patientId: p.id, _sum: { price: 500 } })),
      );
      prisma.patient.findMany.mockResolvedValue(owing.slice(10, 20));
      // `count()` recibe el where ya filtrado por ids, así que devuelve 25 y no
      // el total de la cartera.
      prisma.patient.count.mockResolvedValue(25);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
        page: 2,
        limit: 10,
      } as any);

      const countWhere = prisma.patient.count.mock.calls[0][0].where;
      expect(countWhere.id).toEqual({ in: owing.map((p) => p.id) });
      expect(countWhere).toEqual(
        prisma.patient.findMany.mock.calls[0][0].where,
      );
      expect(result.meta).toEqual({ total: 25, page: 2, lastPage: 3 });
    });

    it('hasBalance=false excluye a los deudores con notIn', async () => {
      const conSaldo = makePatient();
      prisma.appointment.groupBy.mockResolvedValue([
        { patientId: conSaldo.id, _sum: { price: 300 } },
      ]);
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', { hasBalance: false } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.id).toEqual({ notIn: [conSaldo.id] });
    });

    it('sin deudores devuelve página vacía y lastPage 0', async () => {
      prisma.appointment.groupBy.mockResolvedValue([]);
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
      } as any);

      expect(prisma.patient.findMany.mock.calls[0][0].where.id).toEqual({
        in: [],
      });
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({ total: 0, page: 1, lastPage: 0 });
    });

    it('combina con status y search sin perder ninguno', async () => {
      const conSaldo = makePatient();
      prisma.appointment.groupBy.mockResolvedValue([
        { patientId: conSaldo.id, _sum: { price: 100 } },
      ]);
      prisma.patient.findMany.mockResolvedValue([]);
      prisma.patient.count.mockResolvedValue(0);

      await service.findAll('clinician-1', {
        hasBalance: true,
        riskFlag: true,
        status: 'ACTIVE',
        search: 'ana',
      } as any);

      const whereArg = prisma.patient.findMany.mock.calls[0][0].where;
      expect(whereArg.clinicianId).toBe('clinician-1');
      expect(whereArg.status).toBe('ACTIVE');
      expect(whereArg.OR).toEqual([
        { fullName: { contains: 'ana', mode: 'insensitive' } },
      ]);
      expect(whereArg.riskFlag).toEqual({
        resolvedAt: null,
        flagTypes: { isEmpty: false },
      });
      expect(whereArg.id).toEqual({ in: [conSaldo.id] });
    });
  });

  // ── findAll() · orden por saldo ───────────────────────────────────────────

  describe('findAll() sort=balance', () => {
    const setupOwing = (amounts: number[]) => {
      const patients = amounts.map(() => makePatient());
      prisma.appointment.groupBy.mockResolvedValue(
        patients.map((p, i) => ({
          patientId: p.id,
          _sum: { price: amounts[i] },
        })),
      );
      return patients;
    };

    it('rechaza sort=balance sin hasBalance=true', async () => {
      await expect(
        service.findAll('clinician-1', { sort: 'balance' } as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.findAll('clinician-1', {
          sort: 'balance',
          hasBalance: false,
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.patient.findMany).not.toHaveBeenCalled();
    });

    it('ordena sobre todo el conjunto, no sólo sobre la página', async () => {
      const [bajo, alto, medio] = setupOwing([100, 900, 500]);
      prisma.patient.findMany
        // 1ª llamada: ids que pasan el where completo.
        .mockResolvedValueOnce([
          { id: bajo.id },
          { id: alto.id },
          { id: medio.id },
        ])
        // 2ª llamada: filas de la página, en el orden que quiera la BD.
        .mockResolvedValueOnce([medio, alto]);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
        sort: 'balance',
        page: 1,
        limit: 2,
      } as any);

      expect(result.data.map((p: any) => p.id)).toEqual([alto.id, medio.id]);
      expect(result.data.map((p: any) => p.pendingBalance)).toEqual([900, 500]);
      // `total` sale del conjunto completo con saldo, no de la página.
      expect(result.meta).toEqual({ total: 3, page: 1, lastPage: 2 });
      expect(prisma.patient.count).not.toHaveBeenCalled();
    });

    it('la página 2 continúa el orden global', async () => {
      const [bajo, alto, medio] = setupOwing([100, 900, 500]);
      prisma.patient.findMany
        .mockResolvedValueOnce([
          { id: bajo.id },
          { id: alto.id },
          { id: medio.id },
        ])
        .mockResolvedValueOnce([bajo]);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
        sort: 'balance',
        page: 2,
        limit: 2,
      } as any);

      expect(prisma.patient.findMany.mock.calls[1][0].where.id).toEqual({
        in: [bajo.id],
      });
      expect(result.data.map((p: any) => p.id)).toEqual([bajo.id]);
      expect(result.meta).toEqual({ total: 3, page: 2, lastPage: 2 });
    });

    it('la consulta de la página conserva el where completo (ownership)', async () => {
      const [uno] = setupOwing([700]);
      prisma.patient.findMany
        .mockResolvedValueOnce([{ id: uno.id }])
        .mockResolvedValueOnce([uno]);

      await service.findAll('clinician-1', {
        hasBalance: true,
        sort: 'balance',
      } as any);

      const pageWhere = prisma.patient.findMany.mock.calls[1][0].where;
      expect(pageWhere.clinicianId).toBe('clinician-1');
      expect(pageWhere.status).toEqual({ not: 'ARCHIVED' });
    });

    it('desempata por id para que la paginación sea estable', async () => {
      const [a, b] = setupOwing([400, 400]);
      const esperado = [a.id, b.id].sort((x, y) => x.localeCompare(y));
      prisma.patient.findMany
        .mockResolvedValueOnce([{ id: a.id }, { id: b.id }])
        .mockResolvedValueOnce([a, b]);

      const result = await service.findAll('clinician-1', {
        hasBalance: true,
        sort: 'balance',
      } as any);

      expect(result.data.map((p: any) => p.id)).toEqual(esperado);
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('re-encrypts only fields that are provided', async () => {
      const patient = makePatient();
      prisma.patient.findFirst.mockResolvedValue(patient);
      prisma.patient.update.mockImplementation(async ({ data }: any) => ({
        ...patient,
        ...data,
      }));

      await service.update(
        patient.id as string,
        patient.clinicianId as string,
        {
          diagnosis: 'Nueva diagnosis',
        } as any,
      );

      const updateData = prisma.patient.update.mock.calls[0][0].data;
      expect(updateData.diagnosis).toMatch(
        /^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/,
      );
      // clinicalContext was not provided, should not be in the update
      expect(updateData.clinicalContext).toBeUndefined();
    });

    it('sets null when a sensitive field is explicitly set to null', async () => {
      const patient = makePatient({
        diagnosis: encryptionService.encrypt('old'),
      });
      prisma.patient.findFirst.mockResolvedValue(patient);
      prisma.patient.update.mockImplementation(async ({ data }: any) => ({
        ...patient,
        ...data,
      }));

      await service.update(
        patient.id as string,
        patient.clinicianId as string,
        {
          diagnosis: null,
        } as any,
      );

      const updateData = prisma.patient.update.mock.calls[0][0].data;
      expect(updateData.diagnosis).toBeNull();
    });
  });

  // ── decryptPatient — tamper detection ─────────────────────────────────────

  describe('decryptPatient tamper detection', () => {
    it('throws when stored diagnosis ciphertext has been tampered', async () => {
      const patient = makePatient({ diagnosis: 'tampered:deadbeef:cafecafe' });
      prisma.patient.findFirst.mockResolvedValue(patient);

      await expect(
        service.findOne(patient.id as string, patient.clinicianId as string),
      ).rejects.toThrow();
    });
  });
});
