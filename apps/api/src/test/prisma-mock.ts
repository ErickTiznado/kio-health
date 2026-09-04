function makeDelegateMock() {
  return {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    // Default a lista vacía: los agregados suelen ser colaterales al caso
    // bajo prueba (p. ej. saldos por paciente en findAll).
    groupBy: jest.fn().mockResolvedValue([]),
    aggregate: jest.fn(),
  };
}

export function createPrismaMock() {
  const mock = {
    user: makeDelegateMock(),
    clinicianProfile: makeDelegateMock(),
    patient: makeDelegateMock(),
    appointment: makeDelegateMock(),
    refreshToken: makeDelegateMock(),
    financeTransaction: makeDelegateMock(),
    psychNote: makeDelegateMock(),
    clinicalScale: makeDelegateMock(),
    accessLog: makeDelegateMock(),
    clinic: makeDelegateMock(),
    clinicMember: makeDelegateMock(),
    clinicInvitation: makeDelegateMock(),
    clinicSubscription: makeDelegateMock(),
    betaInvitation: makeDelegateMock(),
    betaRequest: makeDelegateMock(),
    subscriptionPlan: makeDelegateMock(),
    riskFlag: makeDelegateMock(),
    psychNoteAddendum: makeDelegateMock(),
    passwordResetToken: makeDelegateMock(),
    task: makeDelegateMock(),
    appointmentReminder: makeDelegateMock(),
    patientPortalToken: makeDelegateMock(),
    appointmentSeries: makeDelegateMock(),
    scaleAssignment: makeDelegateMock(),
    $transaction: jest.fn().mockImplementation((cb: unknown) => {
      if (typeof cb === 'function') {
        return (cb as (tx: typeof mock) => unknown)(mock);
      }
      return Promise.resolve(cb);
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return mock;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
