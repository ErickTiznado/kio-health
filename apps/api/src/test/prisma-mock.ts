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
    clinicSubscription: makeDelegateMock(),
    $transaction: jest.fn().mockImplementation((cb: unknown) => {
      if (typeof cb === 'function') return cb(mock);
      return Promise.resolve(cb);
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return mock;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
