
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model ClinicianProfile
 * 
 */
export type ClinicianProfile = $Result.DefaultSelection<Prisma.$ClinicianProfilePayload>
/**
 * Model Patient
 * 
 */
export type Patient = $Result.DefaultSelection<Prisma.$PatientPayload>
/**
 * Model Appointment
 * 
 */
export type Appointment = $Result.DefaultSelection<Prisma.$AppointmentPayload>
/**
 * Model PsychNote
 * 
 */
export type PsychNote = $Result.DefaultSelection<Prisma.$PsychNotePayload>
/**
 * Model Task
 * 
 */
export type Task = $Result.DefaultSelection<Prisma.$TaskPayload>
/**
 * Model AccessLog
 * 
 */
export type AccessLog = $Result.DefaultSelection<Prisma.$AccessLogPayload>
/**
 * Model FinanceTransaction
 * 
 */
export type FinanceTransaction = $Result.DefaultSelection<Prisma.$FinanceTransactionPayload>
/**
 * Model Anthropometry
 * 
 */
export type Anthropometry = $Result.DefaultSelection<Prisma.$AnthropometryPayload>
/**
 * Model MealPlan
 * 
 */
export type MealPlan = $Result.DefaultSelection<Prisma.$MealPlanPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  ADMIN: 'ADMIN',
  CLINICIAN: 'CLINICIAN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const ClinicianType: {
  PSYCHOLOGIST: 'PSYCHOLOGIST'
};

export type ClinicianType = (typeof ClinicianType)[keyof typeof ClinicianType]


export const PatientStatus: {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  WAITLIST: 'WAITLIST'
};

export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus]


export const AppointmentStatus: {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]


export const PaymentStatus: {
  PENDING: 'PENDING',
  PAID: 'PAID'
};

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]


export const AppointmentType: {
  CONSULTATION: 'CONSULTATION',
  EVALUATION: 'EVALUATION',
  FOLLOW_UP: 'FOLLOW_UP'
};

export type AppointmentType = (typeof AppointmentType)[keyof typeof AppointmentType]


export const PaymentMethod: {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER'
};

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]


export const TransactionType: {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
};

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]


export const NoteTemplateType: {
  SOAP: 'SOAP',
  FREE: 'FREE',
  INITIAL: 'INITIAL',
  CBT: 'CBT'
};

export type NoteTemplateType = (typeof NoteTemplateType)[keyof typeof NoteTemplateType]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type ClinicianType = $Enums.ClinicianType

export const ClinicianType: typeof $Enums.ClinicianType

export type PatientStatus = $Enums.PatientStatus

export const PatientStatus: typeof $Enums.PatientStatus

export type AppointmentStatus = $Enums.AppointmentStatus

export const AppointmentStatus: typeof $Enums.AppointmentStatus

export type PaymentStatus = $Enums.PaymentStatus

export const PaymentStatus: typeof $Enums.PaymentStatus

export type AppointmentType = $Enums.AppointmentType

export const AppointmentType: typeof $Enums.AppointmentType

export type PaymentMethod = $Enums.PaymentMethod

export const PaymentMethod: typeof $Enums.PaymentMethod

export type TransactionType = $Enums.TransactionType

export const TransactionType: typeof $Enums.TransactionType

export type NoteTemplateType = $Enums.NoteTemplateType

export const NoteTemplateType: typeof $Enums.NoteTemplateType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clinicianProfile`: Exposes CRUD operations for the **ClinicianProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClinicianProfiles
    * const clinicianProfiles = await prisma.clinicianProfile.findMany()
    * ```
    */
  get clinicianProfile(): Prisma.ClinicianProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.patient`: Exposes CRUD operations for the **Patient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Patients
    * const patients = await prisma.patient.findMany()
    * ```
    */
  get patient(): Prisma.PatientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appointment`: Exposes CRUD operations for the **Appointment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Appointments
    * const appointments = await prisma.appointment.findMany()
    * ```
    */
  get appointment(): Prisma.AppointmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.psychNote`: Exposes CRUD operations for the **PsychNote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PsychNotes
    * const psychNotes = await prisma.psychNote.findMany()
    * ```
    */
  get psychNote(): Prisma.PsychNoteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.task`: Exposes CRUD operations for the **Task** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tasks
    * const tasks = await prisma.task.findMany()
    * ```
    */
  get task(): Prisma.TaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accessLog`: Exposes CRUD operations for the **AccessLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccessLogs
    * const accessLogs = await prisma.accessLog.findMany()
    * ```
    */
  get accessLog(): Prisma.AccessLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.financeTransaction`: Exposes CRUD operations for the **FinanceTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FinanceTransactions
    * const financeTransactions = await prisma.financeTransaction.findMany()
    * ```
    */
  get financeTransaction(): Prisma.FinanceTransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.anthropometry`: Exposes CRUD operations for the **Anthropometry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Anthropometries
    * const anthropometries = await prisma.anthropometry.findMany()
    * ```
    */
  get anthropometry(): Prisma.AnthropometryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mealPlan`: Exposes CRUD operations for the **MealPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MealPlans
    * const mealPlans = await prisma.mealPlan.findMany()
    * ```
    */
  get mealPlan(): Prisma.MealPlanDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.3.0
   * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    ClinicianProfile: 'ClinicianProfile',
    Patient: 'Patient',
    Appointment: 'Appointment',
    PsychNote: 'PsychNote',
    Task: 'Task',
    AccessLog: 'AccessLog',
    FinanceTransaction: 'FinanceTransaction',
    Anthropometry: 'Anthropometry',
    MealPlan: 'MealPlan'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "clinicianProfile" | "patient" | "appointment" | "psychNote" | "task" | "accessLog" | "financeTransaction" | "anthropometry" | "mealPlan"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      ClinicianProfile: {
        payload: Prisma.$ClinicianProfilePayload<ExtArgs>
        fields: Prisma.ClinicianProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClinicianProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClinicianProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          findFirst: {
            args: Prisma.ClinicianProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClinicianProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          findMany: {
            args: Prisma.ClinicianProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>[]
          }
          create: {
            args: Prisma.ClinicianProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          createMany: {
            args: Prisma.ClinicianProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClinicianProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>[]
          }
          delete: {
            args: Prisma.ClinicianProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          update: {
            args: Prisma.ClinicianProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          deleteMany: {
            args: Prisma.ClinicianProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClinicianProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClinicianProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>[]
          }
          upsert: {
            args: Prisma.ClinicianProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClinicianProfilePayload>
          }
          aggregate: {
            args: Prisma.ClinicianProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClinicianProfile>
          }
          groupBy: {
            args: Prisma.ClinicianProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClinicianProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClinicianProfileCountArgs<ExtArgs>
            result: $Utils.Optional<ClinicianProfileCountAggregateOutputType> | number
          }
        }
      }
      Patient: {
        payload: Prisma.$PatientPayload<ExtArgs>
        fields: Prisma.PatientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PatientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PatientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findFirst: {
            args: Prisma.PatientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PatientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findMany: {
            args: Prisma.PatientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          create: {
            args: Prisma.PatientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          createMany: {
            args: Prisma.PatientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PatientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          delete: {
            args: Prisma.PatientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          update: {
            args: Prisma.PatientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          deleteMany: {
            args: Prisma.PatientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PatientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PatientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          upsert: {
            args: Prisma.PatientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          aggregate: {
            args: Prisma.PatientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePatient>
          }
          groupBy: {
            args: Prisma.PatientGroupByArgs<ExtArgs>
            result: $Utils.Optional<PatientGroupByOutputType>[]
          }
          count: {
            args: Prisma.PatientCountArgs<ExtArgs>
            result: $Utils.Optional<PatientCountAggregateOutputType> | number
          }
        }
      }
      Appointment: {
        payload: Prisma.$AppointmentPayload<ExtArgs>
        fields: Prisma.AppointmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppointmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppointmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          findFirst: {
            args: Prisma.AppointmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppointmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          findMany: {
            args: Prisma.AppointmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          create: {
            args: Prisma.AppointmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          createMany: {
            args: Prisma.AppointmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppointmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          delete: {
            args: Prisma.AppointmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          update: {
            args: Prisma.AppointmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          deleteMany: {
            args: Prisma.AppointmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppointmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppointmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>[]
          }
          upsert: {
            args: Prisma.AppointmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppointmentPayload>
          }
          aggregate: {
            args: Prisma.AppointmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppointment>
          }
          groupBy: {
            args: Prisma.AppointmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppointmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppointmentCountArgs<ExtArgs>
            result: $Utils.Optional<AppointmentCountAggregateOutputType> | number
          }
        }
      }
      PsychNote: {
        payload: Prisma.$PsychNotePayload<ExtArgs>
        fields: Prisma.PsychNoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PsychNoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PsychNoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          findFirst: {
            args: Prisma.PsychNoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PsychNoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          findMany: {
            args: Prisma.PsychNoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>[]
          }
          create: {
            args: Prisma.PsychNoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          createMany: {
            args: Prisma.PsychNoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PsychNoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>[]
          }
          delete: {
            args: Prisma.PsychNoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          update: {
            args: Prisma.PsychNoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          deleteMany: {
            args: Prisma.PsychNoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PsychNoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PsychNoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>[]
          }
          upsert: {
            args: Prisma.PsychNoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PsychNotePayload>
          }
          aggregate: {
            args: Prisma.PsychNoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePsychNote>
          }
          groupBy: {
            args: Prisma.PsychNoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<PsychNoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.PsychNoteCountArgs<ExtArgs>
            result: $Utils.Optional<PsychNoteCountAggregateOutputType> | number
          }
        }
      }
      Task: {
        payload: Prisma.$TaskPayload<ExtArgs>
        fields: Prisma.TaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findFirst: {
            args: Prisma.TaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findMany: {
            args: Prisma.TaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          create: {
            args: Prisma.TaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          createMany: {
            args: Prisma.TaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          delete: {
            args: Prisma.TaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          update: {
            args: Prisma.TaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          deleteMany: {
            args: Prisma.TaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          upsert: {
            args: Prisma.TaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          aggregate: {
            args: Prisma.TaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTask>
          }
          groupBy: {
            args: Prisma.TaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaskCountArgs<ExtArgs>
            result: $Utils.Optional<TaskCountAggregateOutputType> | number
          }
        }
      }
      AccessLog: {
        payload: Prisma.$AccessLogPayload<ExtArgs>
        fields: Prisma.AccessLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccessLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccessLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          findFirst: {
            args: Prisma.AccessLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccessLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          findMany: {
            args: Prisma.AccessLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>[]
          }
          create: {
            args: Prisma.AccessLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          createMany: {
            args: Prisma.AccessLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccessLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>[]
          }
          delete: {
            args: Prisma.AccessLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          update: {
            args: Prisma.AccessLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          deleteMany: {
            args: Prisma.AccessLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccessLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccessLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>[]
          }
          upsert: {
            args: Prisma.AccessLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccessLogPayload>
          }
          aggregate: {
            args: Prisma.AccessLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccessLog>
          }
          groupBy: {
            args: Prisma.AccessLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccessLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccessLogCountArgs<ExtArgs>
            result: $Utils.Optional<AccessLogCountAggregateOutputType> | number
          }
        }
      }
      FinanceTransaction: {
        payload: Prisma.$FinanceTransactionPayload<ExtArgs>
        fields: Prisma.FinanceTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FinanceTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FinanceTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          findFirst: {
            args: Prisma.FinanceTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FinanceTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          findMany: {
            args: Prisma.FinanceTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>[]
          }
          create: {
            args: Prisma.FinanceTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          createMany: {
            args: Prisma.FinanceTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FinanceTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>[]
          }
          delete: {
            args: Prisma.FinanceTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          update: {
            args: Prisma.FinanceTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          deleteMany: {
            args: Prisma.FinanceTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FinanceTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FinanceTransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>[]
          }
          upsert: {
            args: Prisma.FinanceTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinanceTransactionPayload>
          }
          aggregate: {
            args: Prisma.FinanceTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFinanceTransaction>
          }
          groupBy: {
            args: Prisma.FinanceTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<FinanceTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.FinanceTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<FinanceTransactionCountAggregateOutputType> | number
          }
        }
      }
      Anthropometry: {
        payload: Prisma.$AnthropometryPayload<ExtArgs>
        fields: Prisma.AnthropometryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnthropometryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnthropometryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          findFirst: {
            args: Prisma.AnthropometryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnthropometryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          findMany: {
            args: Prisma.AnthropometryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>[]
          }
          create: {
            args: Prisma.AnthropometryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          createMany: {
            args: Prisma.AnthropometryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnthropometryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>[]
          }
          delete: {
            args: Prisma.AnthropometryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          update: {
            args: Prisma.AnthropometryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          deleteMany: {
            args: Prisma.AnthropometryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnthropometryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnthropometryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>[]
          }
          upsert: {
            args: Prisma.AnthropometryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnthropometryPayload>
          }
          aggregate: {
            args: Prisma.AnthropometryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnthropometry>
          }
          groupBy: {
            args: Prisma.AnthropometryGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnthropometryGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnthropometryCountArgs<ExtArgs>
            result: $Utils.Optional<AnthropometryCountAggregateOutputType> | number
          }
        }
      }
      MealPlan: {
        payload: Prisma.$MealPlanPayload<ExtArgs>
        fields: Prisma.MealPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MealPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MealPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          findFirst: {
            args: Prisma.MealPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MealPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          findMany: {
            args: Prisma.MealPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>[]
          }
          create: {
            args: Prisma.MealPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          createMany: {
            args: Prisma.MealPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MealPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>[]
          }
          delete: {
            args: Prisma.MealPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          update: {
            args: Prisma.MealPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          deleteMany: {
            args: Prisma.MealPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MealPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MealPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>[]
          }
          upsert: {
            args: Prisma.MealPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MealPlanPayload>
          }
          aggregate: {
            args: Prisma.MealPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMealPlan>
          }
          groupBy: {
            args: Prisma.MealPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<MealPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.MealPlanCountArgs<ExtArgs>
            result: $Utils.Optional<MealPlanCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    clinicianProfile?: ClinicianProfileOmit
    patient?: PatientOmit
    appointment?: AppointmentOmit
    psychNote?: PsychNoteOmit
    task?: TaskOmit
    accessLog?: AccessLogOmit
    financeTransaction?: FinanceTransactionOmit
    anthropometry?: AnthropometryOmit
    mealPlan?: MealPlanOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    accessLogs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accessLogs?: boolean | UserCountOutputTypeCountAccessLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccessLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccessLogWhereInput
  }


  /**
   * Count Type ClinicianProfileCountOutputType
   */

  export type ClinicianProfileCountOutputType = {
    patients: number
    appointments: number
    transactions: number
  }

  export type ClinicianProfileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patients?: boolean | ClinicianProfileCountOutputTypeCountPatientsArgs
    appointments?: boolean | ClinicianProfileCountOutputTypeCountAppointmentsArgs
    transactions?: boolean | ClinicianProfileCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * ClinicianProfileCountOutputType without action
   */
  export type ClinicianProfileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfileCountOutputType
     */
    select?: ClinicianProfileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClinicianProfileCountOutputType without action
   */
  export type ClinicianProfileCountOutputTypeCountPatientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PatientWhereInput
  }

  /**
   * ClinicianProfileCountOutputType without action
   */
  export type ClinicianProfileCountOutputTypeCountAppointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
  }

  /**
   * ClinicianProfileCountOutputType without action
   */
  export type ClinicianProfileCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FinanceTransactionWhereInput
  }


  /**
   * Count Type PatientCountOutputType
   */

  export type PatientCountOutputType = {
    appointments: number
    psychNotes: number
    accessLogs: number
    tasks: number
    anthropometries: number
    mealPlans: number
  }

  export type PatientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointments?: boolean | PatientCountOutputTypeCountAppointmentsArgs
    psychNotes?: boolean | PatientCountOutputTypeCountPsychNotesArgs
    accessLogs?: boolean | PatientCountOutputTypeCountAccessLogsArgs
    tasks?: boolean | PatientCountOutputTypeCountTasksArgs
    anthropometries?: boolean | PatientCountOutputTypeCountAnthropometriesArgs
    mealPlans?: boolean | PatientCountOutputTypeCountMealPlansArgs
  }

  // Custom InputTypes
  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientCountOutputType
     */
    select?: PatientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountAppointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountPsychNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PsychNoteWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountAccessLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccessLogWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountAnthropometriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnthropometryWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountMealPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MealPlanWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    profile?: boolean | User$profileArgs<ExtArgs>
    accessLogs?: boolean | User$accessLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | User$profileArgs<ExtArgs>
    accessLogs?: boolean | User$accessLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      profile: Prisma.$ClinicianProfilePayload<ExtArgs> | null
      accessLogs: Prisma.$AccessLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      role: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    accessLogs<T extends User$accessLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$accessLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    where?: ClinicianProfileWhereInput
  }

  /**
   * User.accessLogs
   */
  export type User$accessLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    where?: AccessLogWhereInput
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    cursor?: AccessLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccessLogScalarFieldEnum | AccessLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model ClinicianProfile
   */

  export type AggregateClinicianProfile = {
    _count: ClinicianProfileCountAggregateOutputType | null
    _avg: ClinicianProfileAvgAggregateOutputType | null
    _sum: ClinicianProfileSumAggregateOutputType | null
    _min: ClinicianProfileMinAggregateOutputType | null
    _max: ClinicianProfileMaxAggregateOutputType | null
  }

  export type ClinicianProfileAvgAggregateOutputType = {
    sessionDefaultDuration: number | null
    sessionDefaultPrice: Decimal | null
  }

  export type ClinicianProfileSumAggregateOutputType = {
    sessionDefaultDuration: number | null
    sessionDefaultPrice: Decimal | null
  }

  export type ClinicianProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.ClinicianType | null
    licenseNumber: string | null
    currency: string | null
    sessionDefaultDuration: number | null
    sessionDefaultPrice: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClinicianProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.ClinicianType | null
    licenseNumber: string | null
    currency: string | null
    sessionDefaultDuration: number | null
    sessionDefaultPrice: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClinicianProfileCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    licenseNumber: number
    currency: number
    sessionDefaultDuration: number
    sessionDefaultPrice: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClinicianProfileAvgAggregateInputType = {
    sessionDefaultDuration?: true
    sessionDefaultPrice?: true
  }

  export type ClinicianProfileSumAggregateInputType = {
    sessionDefaultDuration?: true
    sessionDefaultPrice?: true
  }

  export type ClinicianProfileMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    licenseNumber?: true
    currency?: true
    sessionDefaultDuration?: true
    sessionDefaultPrice?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClinicianProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    licenseNumber?: true
    currency?: true
    sessionDefaultDuration?: true
    sessionDefaultPrice?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClinicianProfileCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    licenseNumber?: true
    currency?: true
    sessionDefaultDuration?: true
    sessionDefaultPrice?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClinicianProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClinicianProfile to aggregate.
     */
    where?: ClinicianProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClinicianProfiles to fetch.
     */
    orderBy?: ClinicianProfileOrderByWithRelationInput | ClinicianProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClinicianProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClinicianProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClinicianProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClinicianProfiles
    **/
    _count?: true | ClinicianProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClinicianProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClinicianProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClinicianProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClinicianProfileMaxAggregateInputType
  }

  export type GetClinicianProfileAggregateType<T extends ClinicianProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateClinicianProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClinicianProfile[P]>
      : GetScalarType<T[P], AggregateClinicianProfile[P]>
  }




  export type ClinicianProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClinicianProfileWhereInput
    orderBy?: ClinicianProfileOrderByWithAggregationInput | ClinicianProfileOrderByWithAggregationInput[]
    by: ClinicianProfileScalarFieldEnum[] | ClinicianProfileScalarFieldEnum
    having?: ClinicianProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClinicianProfileCountAggregateInputType | true
    _avg?: ClinicianProfileAvgAggregateInputType
    _sum?: ClinicianProfileSumAggregateInputType
    _min?: ClinicianProfileMinAggregateInputType
    _max?: ClinicianProfileMaxAggregateInputType
  }

  export type ClinicianProfileGroupByOutputType = {
    id: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber: string | null
    currency: string
    sessionDefaultDuration: number
    sessionDefaultPrice: Decimal
    createdAt: Date
    updatedAt: Date
    _count: ClinicianProfileCountAggregateOutputType | null
    _avg: ClinicianProfileAvgAggregateOutputType | null
    _sum: ClinicianProfileSumAggregateOutputType | null
    _min: ClinicianProfileMinAggregateOutputType | null
    _max: ClinicianProfileMaxAggregateOutputType | null
  }

  type GetClinicianProfileGroupByPayload<T extends ClinicianProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClinicianProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClinicianProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClinicianProfileGroupByOutputType[P]>
            : GetScalarType<T[P], ClinicianProfileGroupByOutputType[P]>
        }
      >
    >


  export type ClinicianProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    licenseNumber?: boolean
    currency?: boolean
    sessionDefaultDuration?: boolean
    sessionDefaultPrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    patients?: boolean | ClinicianProfile$patientsArgs<ExtArgs>
    appointments?: boolean | ClinicianProfile$appointmentsArgs<ExtArgs>
    transactions?: boolean | ClinicianProfile$transactionsArgs<ExtArgs>
    _count?: boolean | ClinicianProfileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clinicianProfile"]>

  export type ClinicianProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    licenseNumber?: boolean
    currency?: boolean
    sessionDefaultDuration?: boolean
    sessionDefaultPrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clinicianProfile"]>

  export type ClinicianProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    licenseNumber?: boolean
    currency?: boolean
    sessionDefaultDuration?: boolean
    sessionDefaultPrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clinicianProfile"]>

  export type ClinicianProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    licenseNumber?: boolean
    currency?: boolean
    sessionDefaultDuration?: boolean
    sessionDefaultPrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClinicianProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "licenseNumber" | "currency" | "sessionDefaultDuration" | "sessionDefaultPrice" | "createdAt" | "updatedAt", ExtArgs["result"]["clinicianProfile"]>
  export type ClinicianProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    patients?: boolean | ClinicianProfile$patientsArgs<ExtArgs>
    appointments?: boolean | ClinicianProfile$appointmentsArgs<ExtArgs>
    transactions?: boolean | ClinicianProfile$transactionsArgs<ExtArgs>
    _count?: boolean | ClinicianProfileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClinicianProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ClinicianProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ClinicianProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClinicianProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      patients: Prisma.$PatientPayload<ExtArgs>[]
      appointments: Prisma.$AppointmentPayload<ExtArgs>[]
      transactions: Prisma.$FinanceTransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: $Enums.ClinicianType
      licenseNumber: string | null
      currency: string
      sessionDefaultDuration: number
      sessionDefaultPrice: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["clinicianProfile"]>
    composites: {}
  }

  type ClinicianProfileGetPayload<S extends boolean | null | undefined | ClinicianProfileDefaultArgs> = $Result.GetResult<Prisma.$ClinicianProfilePayload, S>

  type ClinicianProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClinicianProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClinicianProfileCountAggregateInputType | true
    }

  export interface ClinicianProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClinicianProfile'], meta: { name: 'ClinicianProfile' } }
    /**
     * Find zero or one ClinicianProfile that matches the filter.
     * @param {ClinicianProfileFindUniqueArgs} args - Arguments to find a ClinicianProfile
     * @example
     * // Get one ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClinicianProfileFindUniqueArgs>(args: SelectSubset<T, ClinicianProfileFindUniqueArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClinicianProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClinicianProfileFindUniqueOrThrowArgs} args - Arguments to find a ClinicianProfile
     * @example
     * // Get one ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClinicianProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, ClinicianProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClinicianProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileFindFirstArgs} args - Arguments to find a ClinicianProfile
     * @example
     * // Get one ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClinicianProfileFindFirstArgs>(args?: SelectSubset<T, ClinicianProfileFindFirstArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClinicianProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileFindFirstOrThrowArgs} args - Arguments to find a ClinicianProfile
     * @example
     * // Get one ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClinicianProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, ClinicianProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClinicianProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClinicianProfiles
     * const clinicianProfiles = await prisma.clinicianProfile.findMany()
     * 
     * // Get first 10 ClinicianProfiles
     * const clinicianProfiles = await prisma.clinicianProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clinicianProfileWithIdOnly = await prisma.clinicianProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClinicianProfileFindManyArgs>(args?: SelectSubset<T, ClinicianProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClinicianProfile.
     * @param {ClinicianProfileCreateArgs} args - Arguments to create a ClinicianProfile.
     * @example
     * // Create one ClinicianProfile
     * const ClinicianProfile = await prisma.clinicianProfile.create({
     *   data: {
     *     // ... data to create a ClinicianProfile
     *   }
     * })
     * 
     */
    create<T extends ClinicianProfileCreateArgs>(args: SelectSubset<T, ClinicianProfileCreateArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClinicianProfiles.
     * @param {ClinicianProfileCreateManyArgs} args - Arguments to create many ClinicianProfiles.
     * @example
     * // Create many ClinicianProfiles
     * const clinicianProfile = await prisma.clinicianProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClinicianProfileCreateManyArgs>(args?: SelectSubset<T, ClinicianProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClinicianProfiles and returns the data saved in the database.
     * @param {ClinicianProfileCreateManyAndReturnArgs} args - Arguments to create many ClinicianProfiles.
     * @example
     * // Create many ClinicianProfiles
     * const clinicianProfile = await prisma.clinicianProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClinicianProfiles and only return the `id`
     * const clinicianProfileWithIdOnly = await prisma.clinicianProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClinicianProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, ClinicianProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClinicianProfile.
     * @param {ClinicianProfileDeleteArgs} args - Arguments to delete one ClinicianProfile.
     * @example
     * // Delete one ClinicianProfile
     * const ClinicianProfile = await prisma.clinicianProfile.delete({
     *   where: {
     *     // ... filter to delete one ClinicianProfile
     *   }
     * })
     * 
     */
    delete<T extends ClinicianProfileDeleteArgs>(args: SelectSubset<T, ClinicianProfileDeleteArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClinicianProfile.
     * @param {ClinicianProfileUpdateArgs} args - Arguments to update one ClinicianProfile.
     * @example
     * // Update one ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClinicianProfileUpdateArgs>(args: SelectSubset<T, ClinicianProfileUpdateArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClinicianProfiles.
     * @param {ClinicianProfileDeleteManyArgs} args - Arguments to filter ClinicianProfiles to delete.
     * @example
     * // Delete a few ClinicianProfiles
     * const { count } = await prisma.clinicianProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClinicianProfileDeleteManyArgs>(args?: SelectSubset<T, ClinicianProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClinicianProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClinicianProfiles
     * const clinicianProfile = await prisma.clinicianProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClinicianProfileUpdateManyArgs>(args: SelectSubset<T, ClinicianProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClinicianProfiles and returns the data updated in the database.
     * @param {ClinicianProfileUpdateManyAndReturnArgs} args - Arguments to update many ClinicianProfiles.
     * @example
     * // Update many ClinicianProfiles
     * const clinicianProfile = await prisma.clinicianProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClinicianProfiles and only return the `id`
     * const clinicianProfileWithIdOnly = await prisma.clinicianProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClinicianProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, ClinicianProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClinicianProfile.
     * @param {ClinicianProfileUpsertArgs} args - Arguments to update or create a ClinicianProfile.
     * @example
     * // Update or create a ClinicianProfile
     * const clinicianProfile = await prisma.clinicianProfile.upsert({
     *   create: {
     *     // ... data to create a ClinicianProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClinicianProfile we want to update
     *   }
     * })
     */
    upsert<T extends ClinicianProfileUpsertArgs>(args: SelectSubset<T, ClinicianProfileUpsertArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClinicianProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileCountArgs} args - Arguments to filter ClinicianProfiles to count.
     * @example
     * // Count the number of ClinicianProfiles
     * const count = await prisma.clinicianProfile.count({
     *   where: {
     *     // ... the filter for the ClinicianProfiles we want to count
     *   }
     * })
    **/
    count<T extends ClinicianProfileCountArgs>(
      args?: Subset<T, ClinicianProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClinicianProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClinicianProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClinicianProfileAggregateArgs>(args: Subset<T, ClinicianProfileAggregateArgs>): Prisma.PrismaPromise<GetClinicianProfileAggregateType<T>>

    /**
     * Group by ClinicianProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClinicianProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClinicianProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClinicianProfileGroupByArgs['orderBy'] }
        : { orderBy?: ClinicianProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClinicianProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClinicianProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClinicianProfile model
   */
  readonly fields: ClinicianProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClinicianProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClinicianProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    patients<T extends ClinicianProfile$patientsArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfile$patientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    appointments<T extends ClinicianProfile$appointmentsArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfile$appointmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    transactions<T extends ClinicianProfile$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfile$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClinicianProfile model
   */
  interface ClinicianProfileFieldRefs {
    readonly id: FieldRef<"ClinicianProfile", 'String'>
    readonly userId: FieldRef<"ClinicianProfile", 'String'>
    readonly type: FieldRef<"ClinicianProfile", 'ClinicianType'>
    readonly licenseNumber: FieldRef<"ClinicianProfile", 'String'>
    readonly currency: FieldRef<"ClinicianProfile", 'String'>
    readonly sessionDefaultDuration: FieldRef<"ClinicianProfile", 'Int'>
    readonly sessionDefaultPrice: FieldRef<"ClinicianProfile", 'Decimal'>
    readonly createdAt: FieldRef<"ClinicianProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"ClinicianProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ClinicianProfile findUnique
   */
  export type ClinicianProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter, which ClinicianProfile to fetch.
     */
    where: ClinicianProfileWhereUniqueInput
  }

  /**
   * ClinicianProfile findUniqueOrThrow
   */
  export type ClinicianProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter, which ClinicianProfile to fetch.
     */
    where: ClinicianProfileWhereUniqueInput
  }

  /**
   * ClinicianProfile findFirst
   */
  export type ClinicianProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter, which ClinicianProfile to fetch.
     */
    where?: ClinicianProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClinicianProfiles to fetch.
     */
    orderBy?: ClinicianProfileOrderByWithRelationInput | ClinicianProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClinicianProfiles.
     */
    cursor?: ClinicianProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClinicianProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClinicianProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClinicianProfiles.
     */
    distinct?: ClinicianProfileScalarFieldEnum | ClinicianProfileScalarFieldEnum[]
  }

  /**
   * ClinicianProfile findFirstOrThrow
   */
  export type ClinicianProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter, which ClinicianProfile to fetch.
     */
    where?: ClinicianProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClinicianProfiles to fetch.
     */
    orderBy?: ClinicianProfileOrderByWithRelationInput | ClinicianProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClinicianProfiles.
     */
    cursor?: ClinicianProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClinicianProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClinicianProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClinicianProfiles.
     */
    distinct?: ClinicianProfileScalarFieldEnum | ClinicianProfileScalarFieldEnum[]
  }

  /**
   * ClinicianProfile findMany
   */
  export type ClinicianProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter, which ClinicianProfiles to fetch.
     */
    where?: ClinicianProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClinicianProfiles to fetch.
     */
    orderBy?: ClinicianProfileOrderByWithRelationInput | ClinicianProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClinicianProfiles.
     */
    cursor?: ClinicianProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClinicianProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClinicianProfiles.
     */
    skip?: number
    distinct?: ClinicianProfileScalarFieldEnum | ClinicianProfileScalarFieldEnum[]
  }

  /**
   * ClinicianProfile create
   */
  export type ClinicianProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a ClinicianProfile.
     */
    data: XOR<ClinicianProfileCreateInput, ClinicianProfileUncheckedCreateInput>
  }

  /**
   * ClinicianProfile createMany
   */
  export type ClinicianProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClinicianProfiles.
     */
    data: ClinicianProfileCreateManyInput | ClinicianProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClinicianProfile createManyAndReturn
   */
  export type ClinicianProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * The data used to create many ClinicianProfiles.
     */
    data: ClinicianProfileCreateManyInput | ClinicianProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClinicianProfile update
   */
  export type ClinicianProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a ClinicianProfile.
     */
    data: XOR<ClinicianProfileUpdateInput, ClinicianProfileUncheckedUpdateInput>
    /**
     * Choose, which ClinicianProfile to update.
     */
    where: ClinicianProfileWhereUniqueInput
  }

  /**
   * ClinicianProfile updateMany
   */
  export type ClinicianProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClinicianProfiles.
     */
    data: XOR<ClinicianProfileUpdateManyMutationInput, ClinicianProfileUncheckedUpdateManyInput>
    /**
     * Filter which ClinicianProfiles to update
     */
    where?: ClinicianProfileWhereInput
    /**
     * Limit how many ClinicianProfiles to update.
     */
    limit?: number
  }

  /**
   * ClinicianProfile updateManyAndReturn
   */
  export type ClinicianProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * The data used to update ClinicianProfiles.
     */
    data: XOR<ClinicianProfileUpdateManyMutationInput, ClinicianProfileUncheckedUpdateManyInput>
    /**
     * Filter which ClinicianProfiles to update
     */
    where?: ClinicianProfileWhereInput
    /**
     * Limit how many ClinicianProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClinicianProfile upsert
   */
  export type ClinicianProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the ClinicianProfile to update in case it exists.
     */
    where: ClinicianProfileWhereUniqueInput
    /**
     * In case the ClinicianProfile found by the `where` argument doesn't exist, create a new ClinicianProfile with this data.
     */
    create: XOR<ClinicianProfileCreateInput, ClinicianProfileUncheckedCreateInput>
    /**
     * In case the ClinicianProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClinicianProfileUpdateInput, ClinicianProfileUncheckedUpdateInput>
  }

  /**
   * ClinicianProfile delete
   */
  export type ClinicianProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
    /**
     * Filter which ClinicianProfile to delete.
     */
    where: ClinicianProfileWhereUniqueInput
  }

  /**
   * ClinicianProfile deleteMany
   */
  export type ClinicianProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClinicianProfiles to delete
     */
    where?: ClinicianProfileWhereInput
    /**
     * Limit how many ClinicianProfiles to delete.
     */
    limit?: number
  }

  /**
   * ClinicianProfile.patients
   */
  export type ClinicianProfile$patientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    where?: PatientWhereInput
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    cursor?: PatientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * ClinicianProfile.appointments
   */
  export type ClinicianProfile$appointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    cursor?: AppointmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * ClinicianProfile.transactions
   */
  export type ClinicianProfile$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    where?: FinanceTransactionWhereInput
    orderBy?: FinanceTransactionOrderByWithRelationInput | FinanceTransactionOrderByWithRelationInput[]
    cursor?: FinanceTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FinanceTransactionScalarFieldEnum | FinanceTransactionScalarFieldEnum[]
  }

  /**
   * ClinicianProfile without action
   */
  export type ClinicianProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClinicianProfile
     */
    select?: ClinicianProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClinicianProfile
     */
    omit?: ClinicianProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClinicianProfileInclude<ExtArgs> | null
  }


  /**
   * Model Patient
   */

  export type AggregatePatient = {
    _count: PatientCountAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  export type PatientMinAggregateOutputType = {
    id: string | null
    clinicianId: string | null
    fullName: string | null
    dateOfBirth: Date | null
    diagnosis: string | null
    clinicalContext: string | null
    status: $Enums.PatientStatus | null
    contactPhone: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PatientMaxAggregateOutputType = {
    id: string | null
    clinicianId: string | null
    fullName: string | null
    dateOfBirth: Date | null
    diagnosis: string | null
    clinicalContext: string | null
    status: $Enums.PatientStatus | null
    contactPhone: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PatientCountAggregateOutputType = {
    id: number
    clinicianId: number
    fullName: number
    dateOfBirth: number
    diagnosis: number
    clinicalContext: number
    status: number
    contactPhone: number
    emergencyContact: number
    treatmentGoals: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PatientMinAggregateInputType = {
    id?: true
    clinicianId?: true
    fullName?: true
    dateOfBirth?: true
    diagnosis?: true
    clinicalContext?: true
    status?: true
    contactPhone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PatientMaxAggregateInputType = {
    id?: true
    clinicianId?: true
    fullName?: true
    dateOfBirth?: true
    diagnosis?: true
    clinicalContext?: true
    status?: true
    contactPhone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PatientCountAggregateInputType = {
    id?: true
    clinicianId?: true
    fullName?: true
    dateOfBirth?: true
    diagnosis?: true
    clinicalContext?: true
    status?: true
    contactPhone?: true
    emergencyContact?: true
    treatmentGoals?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PatientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patient to aggregate.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Patients
    **/
    _count?: true | PatientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PatientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PatientMaxAggregateInputType
  }

  export type GetPatientAggregateType<T extends PatientAggregateArgs> = {
        [P in keyof T & keyof AggregatePatient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePatient[P]>
      : GetScalarType<T[P], AggregatePatient[P]>
  }




  export type PatientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PatientWhereInput
    orderBy?: PatientOrderByWithAggregationInput | PatientOrderByWithAggregationInput[]
    by: PatientScalarFieldEnum[] | PatientScalarFieldEnum
    having?: PatientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PatientCountAggregateInputType | true
    _min?: PatientMinAggregateInputType
    _max?: PatientMaxAggregateInputType
  }

  export type PatientGroupByOutputType = {
    id: string
    clinicianId: string
    fullName: string
    dateOfBirth: Date | null
    diagnosis: string | null
    clinicalContext: string | null
    status: $Enums.PatientStatus
    contactPhone: string | null
    emergencyContact: JsonValue | null
    treatmentGoals: string[]
    createdAt: Date
    updatedAt: Date
    _count: PatientCountAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  type GetPatientGroupByPayload<T extends PatientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PatientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PatientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PatientGroupByOutputType[P]>
            : GetScalarType<T[P], PatientGroupByOutputType[P]>
        }
      >
    >


  export type PatientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    diagnosis?: boolean
    clinicalContext?: boolean
    status?: boolean
    contactPhone?: boolean
    emergencyContact?: boolean
    treatmentGoals?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointments?: boolean | Patient$appointmentsArgs<ExtArgs>
    psychNotes?: boolean | Patient$psychNotesArgs<ExtArgs>
    accessLogs?: boolean | Patient$accessLogsArgs<ExtArgs>
    tasks?: boolean | Patient$tasksArgs<ExtArgs>
    anthropometries?: boolean | Patient$anthropometriesArgs<ExtArgs>
    mealPlans?: boolean | Patient$mealPlansArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    diagnosis?: boolean
    clinicalContext?: boolean
    status?: boolean
    contactPhone?: boolean
    emergencyContact?: boolean
    treatmentGoals?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    diagnosis?: boolean
    clinicalContext?: boolean
    status?: boolean
    contactPhone?: boolean
    emergencyContact?: boolean
    treatmentGoals?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectScalar = {
    id?: boolean
    clinicianId?: boolean
    fullName?: boolean
    dateOfBirth?: boolean
    diagnosis?: boolean
    clinicalContext?: boolean
    status?: boolean
    contactPhone?: boolean
    emergencyContact?: boolean
    treatmentGoals?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PatientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clinicianId" | "fullName" | "dateOfBirth" | "diagnosis" | "clinicalContext" | "status" | "contactPhone" | "emergencyContact" | "treatmentGoals" | "createdAt" | "updatedAt", ExtArgs["result"]["patient"]>
  export type PatientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointments?: boolean | Patient$appointmentsArgs<ExtArgs>
    psychNotes?: boolean | Patient$psychNotesArgs<ExtArgs>
    accessLogs?: boolean | Patient$accessLogsArgs<ExtArgs>
    tasks?: boolean | Patient$tasksArgs<ExtArgs>
    anthropometries?: boolean | Patient$anthropometriesArgs<ExtArgs>
    mealPlans?: boolean | Patient$mealPlansArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PatientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }
  export type PatientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }

  export type $PatientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Patient"
    objects: {
      clinician: Prisma.$ClinicianProfilePayload<ExtArgs>
      appointments: Prisma.$AppointmentPayload<ExtArgs>[]
      psychNotes: Prisma.$PsychNotePayload<ExtArgs>[]
      accessLogs: Prisma.$AccessLogPayload<ExtArgs>[]
      tasks: Prisma.$TaskPayload<ExtArgs>[]
      anthropometries: Prisma.$AnthropometryPayload<ExtArgs>[]
      mealPlans: Prisma.$MealPlanPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clinicianId: string
      fullName: string
      dateOfBirth: Date | null
      diagnosis: string | null
      clinicalContext: string | null
      status: $Enums.PatientStatus
      contactPhone: string | null
      emergencyContact: Prisma.JsonValue | null
      treatmentGoals: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["patient"]>
    composites: {}
  }

  type PatientGetPayload<S extends boolean | null | undefined | PatientDefaultArgs> = $Result.GetResult<Prisma.$PatientPayload, S>

  type PatientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PatientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PatientCountAggregateInputType | true
    }

  export interface PatientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Patient'], meta: { name: 'Patient' } }
    /**
     * Find zero or one Patient that matches the filter.
     * @param {PatientFindUniqueArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PatientFindUniqueArgs>(args: SelectSubset<T, PatientFindUniqueArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Patient that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PatientFindUniqueOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PatientFindUniqueOrThrowArgs>(args: SelectSubset<T, PatientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PatientFindFirstArgs>(args?: SelectSubset<T, PatientFindFirstArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PatientFindFirstOrThrowArgs>(args?: SelectSubset<T, PatientFindFirstOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Patients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Patients
     * const patients = await prisma.patient.findMany()
     * 
     * // Get first 10 Patients
     * const patients = await prisma.patient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const patientWithIdOnly = await prisma.patient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PatientFindManyArgs>(args?: SelectSubset<T, PatientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Patient.
     * @param {PatientCreateArgs} args - Arguments to create a Patient.
     * @example
     * // Create one Patient
     * const Patient = await prisma.patient.create({
     *   data: {
     *     // ... data to create a Patient
     *   }
     * })
     * 
     */
    create<T extends PatientCreateArgs>(args: SelectSubset<T, PatientCreateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Patients.
     * @param {PatientCreateManyArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PatientCreateManyArgs>(args?: SelectSubset<T, PatientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Patients and returns the data saved in the database.
     * @param {PatientCreateManyAndReturnArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PatientCreateManyAndReturnArgs>(args?: SelectSubset<T, PatientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Patient.
     * @param {PatientDeleteArgs} args - Arguments to delete one Patient.
     * @example
     * // Delete one Patient
     * const Patient = await prisma.patient.delete({
     *   where: {
     *     // ... filter to delete one Patient
     *   }
     * })
     * 
     */
    delete<T extends PatientDeleteArgs>(args: SelectSubset<T, PatientDeleteArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Patient.
     * @param {PatientUpdateArgs} args - Arguments to update one Patient.
     * @example
     * // Update one Patient
     * const patient = await prisma.patient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PatientUpdateArgs>(args: SelectSubset<T, PatientUpdateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Patients.
     * @param {PatientDeleteManyArgs} args - Arguments to filter Patients to delete.
     * @example
     * // Delete a few Patients
     * const { count } = await prisma.patient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PatientDeleteManyArgs>(args?: SelectSubset<T, PatientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PatientUpdateManyArgs>(args: SelectSubset<T, PatientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients and returns the data updated in the database.
     * @param {PatientUpdateManyAndReturnArgs} args - Arguments to update many Patients.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PatientUpdateManyAndReturnArgs>(args: SelectSubset<T, PatientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Patient.
     * @param {PatientUpsertArgs} args - Arguments to update or create a Patient.
     * @example
     * // Update or create a Patient
     * const patient = await prisma.patient.upsert({
     *   create: {
     *     // ... data to create a Patient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Patient we want to update
     *   }
     * })
     */
    upsert<T extends PatientUpsertArgs>(args: SelectSubset<T, PatientUpsertArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientCountArgs} args - Arguments to filter Patients to count.
     * @example
     * // Count the number of Patients
     * const count = await prisma.patient.count({
     *   where: {
     *     // ... the filter for the Patients we want to count
     *   }
     * })
    **/
    count<T extends PatientCountArgs>(
      args?: Subset<T, PatientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PatientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PatientAggregateArgs>(args: Subset<T, PatientAggregateArgs>): Prisma.PrismaPromise<GetPatientAggregateType<T>>

    /**
     * Group by Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PatientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PatientGroupByArgs['orderBy'] }
        : { orderBy?: PatientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PatientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPatientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Patient model
   */
  readonly fields: PatientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Patient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PatientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clinician<T extends ClinicianProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfileDefaultArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    appointments<T extends Patient$appointmentsArgs<ExtArgs> = {}>(args?: Subset<T, Patient$appointmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    psychNotes<T extends Patient$psychNotesArgs<ExtArgs> = {}>(args?: Subset<T, Patient$psychNotesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    accessLogs<T extends Patient$accessLogsArgs<ExtArgs> = {}>(args?: Subset<T, Patient$accessLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tasks<T extends Patient$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Patient$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    anthropometries<T extends Patient$anthropometriesArgs<ExtArgs> = {}>(args?: Subset<T, Patient$anthropometriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    mealPlans<T extends Patient$mealPlansArgs<ExtArgs> = {}>(args?: Subset<T, Patient$mealPlansArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Patient model
   */
  interface PatientFieldRefs {
    readonly id: FieldRef<"Patient", 'String'>
    readonly clinicianId: FieldRef<"Patient", 'String'>
    readonly fullName: FieldRef<"Patient", 'String'>
    readonly dateOfBirth: FieldRef<"Patient", 'DateTime'>
    readonly diagnosis: FieldRef<"Patient", 'String'>
    readonly clinicalContext: FieldRef<"Patient", 'String'>
    readonly status: FieldRef<"Patient", 'PatientStatus'>
    readonly contactPhone: FieldRef<"Patient", 'String'>
    readonly emergencyContact: FieldRef<"Patient", 'Json'>
    readonly treatmentGoals: FieldRef<"Patient", 'String[]'>
    readonly createdAt: FieldRef<"Patient", 'DateTime'>
    readonly updatedAt: FieldRef<"Patient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Patient findUnique
   */
  export type PatientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findUniqueOrThrow
   */
  export type PatientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findFirst
   */
  export type PatientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findFirstOrThrow
   */
  export type PatientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findMany
   */
  export type PatientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patients to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient create
   */
  export type PatientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to create a Patient.
     */
    data: XOR<PatientCreateInput, PatientUncheckedCreateInput>
  }

  /**
   * Patient createMany
   */
  export type PatientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Patient createManyAndReturn
   */
  export type PatientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Patient update
   */
  export type PatientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to update a Patient.
     */
    data: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
    /**
     * Choose, which Patient to update.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient updateMany
   */
  export type PatientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
  }

  /**
   * Patient updateManyAndReturn
   */
  export type PatientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Patient upsert
   */
  export type PatientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The filter to search for the Patient to update in case it exists.
     */
    where: PatientWhereUniqueInput
    /**
     * In case the Patient found by the `where` argument doesn't exist, create a new Patient with this data.
     */
    create: XOR<PatientCreateInput, PatientUncheckedCreateInput>
    /**
     * In case the Patient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
  }

  /**
   * Patient delete
   */
  export type PatientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter which Patient to delete.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient deleteMany
   */
  export type PatientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patients to delete
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to delete.
     */
    limit?: number
  }

  /**
   * Patient.appointments
   */
  export type Patient$appointmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    cursor?: AppointmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Patient.psychNotes
   */
  export type Patient$psychNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    where?: PsychNoteWhereInput
    orderBy?: PsychNoteOrderByWithRelationInput | PsychNoteOrderByWithRelationInput[]
    cursor?: PsychNoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PsychNoteScalarFieldEnum | PsychNoteScalarFieldEnum[]
  }

  /**
   * Patient.accessLogs
   */
  export type Patient$accessLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    where?: AccessLogWhereInput
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    cursor?: AccessLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccessLogScalarFieldEnum | AccessLogScalarFieldEnum[]
  }

  /**
   * Patient.tasks
   */
  export type Patient$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Patient.anthropometries
   */
  export type Patient$anthropometriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    where?: AnthropometryWhereInput
    orderBy?: AnthropometryOrderByWithRelationInput | AnthropometryOrderByWithRelationInput[]
    cursor?: AnthropometryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnthropometryScalarFieldEnum | AnthropometryScalarFieldEnum[]
  }

  /**
   * Patient.mealPlans
   */
  export type Patient$mealPlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    where?: MealPlanWhereInput
    orderBy?: MealPlanOrderByWithRelationInput | MealPlanOrderByWithRelationInput[]
    cursor?: MealPlanWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MealPlanScalarFieldEnum | MealPlanScalarFieldEnum[]
  }

  /**
   * Patient without action
   */
  export type PatientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
  }


  /**
   * Model Appointment
   */

  export type AggregateAppointment = {
    _count: AppointmentCountAggregateOutputType | null
    _avg: AppointmentAvgAggregateOutputType | null
    _sum: AppointmentSumAggregateOutputType | null
    _min: AppointmentMinAggregateOutputType | null
    _max: AppointmentMaxAggregateOutputType | null
  }

  export type AppointmentAvgAggregateOutputType = {
    price: Decimal | null
  }

  export type AppointmentSumAggregateOutputType = {
    price: Decimal | null
  }

  export type AppointmentMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    clinicianId: string | null
    startTime: Date | null
    endTime: Date | null
    type: $Enums.AppointmentType | null
    reason: string | null
    status: $Enums.AppointmentStatus | null
    paymentStatus: $Enums.PaymentStatus | null
    paymentMethod: $Enums.PaymentMethod | null
    price: Decimal | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppointmentMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    clinicianId: string | null
    startTime: Date | null
    endTime: Date | null
    type: $Enums.AppointmentType | null
    reason: string | null
    status: $Enums.AppointmentStatus | null
    paymentStatus: $Enums.PaymentStatus | null
    paymentMethod: $Enums.PaymentMethod | null
    price: Decimal | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppointmentCountAggregateOutputType = {
    id: number
    patientId: number
    clinicianId: number
    startTime: number
    endTime: number
    type: number
    reason: number
    status: number
    paymentStatus: number
    paymentMethod: number
    price: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AppointmentAvgAggregateInputType = {
    price?: true
  }

  export type AppointmentSumAggregateInputType = {
    price?: true
  }

  export type AppointmentMinAggregateInputType = {
    id?: true
    patientId?: true
    clinicianId?: true
    startTime?: true
    endTime?: true
    type?: true
    reason?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    price?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppointmentMaxAggregateInputType = {
    id?: true
    patientId?: true
    clinicianId?: true
    startTime?: true
    endTime?: true
    type?: true
    reason?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    price?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppointmentCountAggregateInputType = {
    id?: true
    patientId?: true
    clinicianId?: true
    startTime?: true
    endTime?: true
    type?: true
    reason?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    price?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AppointmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Appointment to aggregate.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Appointments
    **/
    _count?: true | AppointmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppointmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppointmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppointmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppointmentMaxAggregateInputType
  }

  export type GetAppointmentAggregateType<T extends AppointmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAppointment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppointment[P]>
      : GetScalarType<T[P], AggregateAppointment[P]>
  }




  export type AppointmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppointmentWhereInput
    orderBy?: AppointmentOrderByWithAggregationInput | AppointmentOrderByWithAggregationInput[]
    by: AppointmentScalarFieldEnum[] | AppointmentScalarFieldEnum
    having?: AppointmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppointmentCountAggregateInputType | true
    _avg?: AppointmentAvgAggregateInputType
    _sum?: AppointmentSumAggregateInputType
    _min?: AppointmentMinAggregateInputType
    _max?: AppointmentMaxAggregateInputType
  }

  export type AppointmentGroupByOutputType = {
    id: string
    patientId: string
    clinicianId: string
    startTime: Date
    endTime: Date
    type: $Enums.AppointmentType
    reason: string | null
    status: $Enums.AppointmentStatus
    paymentStatus: $Enums.PaymentStatus
    paymentMethod: $Enums.PaymentMethod | null
    price: Decimal
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: AppointmentCountAggregateOutputType | null
    _avg: AppointmentAvgAggregateOutputType | null
    _sum: AppointmentSumAggregateOutputType | null
    _min: AppointmentMinAggregateOutputType | null
    _max: AppointmentMaxAggregateOutputType | null
  }

  type GetAppointmentGroupByPayload<T extends AppointmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppointmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppointmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppointmentGroupByOutputType[P]>
            : GetScalarType<T[P], AppointmentGroupByOutputType[P]>
        }
      >
    >


  export type AppointmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    clinicianId?: boolean
    startTime?: boolean
    endTime?: boolean
    type?: boolean
    reason?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    price?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    psychNote?: boolean | Appointment$psychNoteArgs<ExtArgs>
    transaction?: boolean | Appointment$transactionArgs<ExtArgs>
    anthropometry?: boolean | Appointment$anthropometryArgs<ExtArgs>
    mealPlan?: boolean | Appointment$mealPlanArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    clinicianId?: boolean
    startTime?: boolean
    endTime?: boolean
    type?: boolean
    reason?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    price?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    clinicianId?: boolean
    startTime?: boolean
    endTime?: boolean
    type?: boolean
    reason?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    price?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appointment"]>

  export type AppointmentSelectScalar = {
    id?: boolean
    patientId?: boolean
    clinicianId?: boolean
    startTime?: boolean
    endTime?: boolean
    type?: boolean
    reason?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    price?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AppointmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "clinicianId" | "startTime" | "endTime" | "type" | "reason" | "status" | "paymentStatus" | "paymentMethod" | "price" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["appointment"]>
  export type AppointmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    psychNote?: boolean | Appointment$psychNoteArgs<ExtArgs>
    transaction?: boolean | Appointment$transactionArgs<ExtArgs>
    anthropometry?: boolean | Appointment$anthropometryArgs<ExtArgs>
    mealPlan?: boolean | Appointment$mealPlanArgs<ExtArgs>
  }
  export type AppointmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }
  export type AppointmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
  }

  export type $AppointmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Appointment"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
      clinician: Prisma.$ClinicianProfilePayload<ExtArgs>
      psychNote: Prisma.$PsychNotePayload<ExtArgs> | null
      transaction: Prisma.$FinanceTransactionPayload<ExtArgs> | null
      anthropometry: Prisma.$AnthropometryPayload<ExtArgs> | null
      mealPlan: Prisma.$MealPlanPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      clinicianId: string
      startTime: Date
      endTime: Date
      type: $Enums.AppointmentType
      reason: string | null
      status: $Enums.AppointmentStatus
      paymentStatus: $Enums.PaymentStatus
      paymentMethod: $Enums.PaymentMethod | null
      price: Prisma.Decimal
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["appointment"]>
    composites: {}
  }

  type AppointmentGetPayload<S extends boolean | null | undefined | AppointmentDefaultArgs> = $Result.GetResult<Prisma.$AppointmentPayload, S>

  type AppointmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppointmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppointmentCountAggregateInputType | true
    }

  export interface AppointmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Appointment'], meta: { name: 'Appointment' } }
    /**
     * Find zero or one Appointment that matches the filter.
     * @param {AppointmentFindUniqueArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppointmentFindUniqueArgs>(args: SelectSubset<T, AppointmentFindUniqueArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Appointment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppointmentFindUniqueOrThrowArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppointmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AppointmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Appointment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindFirstArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppointmentFindFirstArgs>(args?: SelectSubset<T, AppointmentFindFirstArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Appointment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindFirstOrThrowArgs} args - Arguments to find a Appointment
     * @example
     * // Get one Appointment
     * const appointment = await prisma.appointment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppointmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AppointmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Appointments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Appointments
     * const appointments = await prisma.appointment.findMany()
     * 
     * // Get first 10 Appointments
     * const appointments = await prisma.appointment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appointmentWithIdOnly = await prisma.appointment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppointmentFindManyArgs>(args?: SelectSubset<T, AppointmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Appointment.
     * @param {AppointmentCreateArgs} args - Arguments to create a Appointment.
     * @example
     * // Create one Appointment
     * const Appointment = await prisma.appointment.create({
     *   data: {
     *     // ... data to create a Appointment
     *   }
     * })
     * 
     */
    create<T extends AppointmentCreateArgs>(args: SelectSubset<T, AppointmentCreateArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Appointments.
     * @param {AppointmentCreateManyArgs} args - Arguments to create many Appointments.
     * @example
     * // Create many Appointments
     * const appointment = await prisma.appointment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppointmentCreateManyArgs>(args?: SelectSubset<T, AppointmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Appointments and returns the data saved in the database.
     * @param {AppointmentCreateManyAndReturnArgs} args - Arguments to create many Appointments.
     * @example
     * // Create many Appointments
     * const appointment = await prisma.appointment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Appointments and only return the `id`
     * const appointmentWithIdOnly = await prisma.appointment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppointmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AppointmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Appointment.
     * @param {AppointmentDeleteArgs} args - Arguments to delete one Appointment.
     * @example
     * // Delete one Appointment
     * const Appointment = await prisma.appointment.delete({
     *   where: {
     *     // ... filter to delete one Appointment
     *   }
     * })
     * 
     */
    delete<T extends AppointmentDeleteArgs>(args: SelectSubset<T, AppointmentDeleteArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Appointment.
     * @param {AppointmentUpdateArgs} args - Arguments to update one Appointment.
     * @example
     * // Update one Appointment
     * const appointment = await prisma.appointment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppointmentUpdateArgs>(args: SelectSubset<T, AppointmentUpdateArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Appointments.
     * @param {AppointmentDeleteManyArgs} args - Arguments to filter Appointments to delete.
     * @example
     * // Delete a few Appointments
     * const { count } = await prisma.appointment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppointmentDeleteManyArgs>(args?: SelectSubset<T, AppointmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Appointments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Appointments
     * const appointment = await prisma.appointment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppointmentUpdateManyArgs>(args: SelectSubset<T, AppointmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Appointments and returns the data updated in the database.
     * @param {AppointmentUpdateManyAndReturnArgs} args - Arguments to update many Appointments.
     * @example
     * // Update many Appointments
     * const appointment = await prisma.appointment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Appointments and only return the `id`
     * const appointmentWithIdOnly = await prisma.appointment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppointmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AppointmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Appointment.
     * @param {AppointmentUpsertArgs} args - Arguments to update or create a Appointment.
     * @example
     * // Update or create a Appointment
     * const appointment = await prisma.appointment.upsert({
     *   create: {
     *     // ... data to create a Appointment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Appointment we want to update
     *   }
     * })
     */
    upsert<T extends AppointmentUpsertArgs>(args: SelectSubset<T, AppointmentUpsertArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Appointments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentCountArgs} args - Arguments to filter Appointments to count.
     * @example
     * // Count the number of Appointments
     * const count = await prisma.appointment.count({
     *   where: {
     *     // ... the filter for the Appointments we want to count
     *   }
     * })
    **/
    count<T extends AppointmentCountArgs>(
      args?: Subset<T, AppointmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppointmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Appointment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppointmentAggregateArgs>(args: Subset<T, AppointmentAggregateArgs>): Prisma.PrismaPromise<GetAppointmentAggregateType<T>>

    /**
     * Group by Appointment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppointmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppointmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppointmentGroupByArgs['orderBy'] }
        : { orderBy?: AppointmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppointmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppointmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Appointment model
   */
  readonly fields: AppointmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Appointment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppointmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    clinician<T extends ClinicianProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfileDefaultArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    psychNote<T extends Appointment$psychNoteArgs<ExtArgs> = {}>(args?: Subset<T, Appointment$psychNoteArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    transaction<T extends Appointment$transactionArgs<ExtArgs> = {}>(args?: Subset<T, Appointment$transactionArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    anthropometry<T extends Appointment$anthropometryArgs<ExtArgs> = {}>(args?: Subset<T, Appointment$anthropometryArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    mealPlan<T extends Appointment$mealPlanArgs<ExtArgs> = {}>(args?: Subset<T, Appointment$mealPlanArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Appointment model
   */
  interface AppointmentFieldRefs {
    readonly id: FieldRef<"Appointment", 'String'>
    readonly patientId: FieldRef<"Appointment", 'String'>
    readonly clinicianId: FieldRef<"Appointment", 'String'>
    readonly startTime: FieldRef<"Appointment", 'DateTime'>
    readonly endTime: FieldRef<"Appointment", 'DateTime'>
    readonly type: FieldRef<"Appointment", 'AppointmentType'>
    readonly reason: FieldRef<"Appointment", 'String'>
    readonly status: FieldRef<"Appointment", 'AppointmentStatus'>
    readonly paymentStatus: FieldRef<"Appointment", 'PaymentStatus'>
    readonly paymentMethod: FieldRef<"Appointment", 'PaymentMethod'>
    readonly price: FieldRef<"Appointment", 'Decimal'>
    readonly notes: FieldRef<"Appointment", 'String'>
    readonly createdAt: FieldRef<"Appointment", 'DateTime'>
    readonly updatedAt: FieldRef<"Appointment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Appointment findUnique
   */
  export type AppointmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment findUniqueOrThrow
   */
  export type AppointmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment findFirst
   */
  export type AppointmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Appointments.
     */
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment findFirstOrThrow
   */
  export type AppointmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointment to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Appointments.
     */
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment findMany
   */
  export type AppointmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter, which Appointments to fetch.
     */
    where?: AppointmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Appointments to fetch.
     */
    orderBy?: AppointmentOrderByWithRelationInput | AppointmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Appointments.
     */
    cursor?: AppointmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Appointments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Appointments.
     */
    skip?: number
    distinct?: AppointmentScalarFieldEnum | AppointmentScalarFieldEnum[]
  }

  /**
   * Appointment create
   */
  export type AppointmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Appointment.
     */
    data: XOR<AppointmentCreateInput, AppointmentUncheckedCreateInput>
  }

  /**
   * Appointment createMany
   */
  export type AppointmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Appointments.
     */
    data: AppointmentCreateManyInput | AppointmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Appointment createManyAndReturn
   */
  export type AppointmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * The data used to create many Appointments.
     */
    data: AppointmentCreateManyInput | AppointmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Appointment update
   */
  export type AppointmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Appointment.
     */
    data: XOR<AppointmentUpdateInput, AppointmentUncheckedUpdateInput>
    /**
     * Choose, which Appointment to update.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment updateMany
   */
  export type AppointmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Appointments.
     */
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyInput>
    /**
     * Filter which Appointments to update
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to update.
     */
    limit?: number
  }

  /**
   * Appointment updateManyAndReturn
   */
  export type AppointmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * The data used to update Appointments.
     */
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyInput>
    /**
     * Filter which Appointments to update
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Appointment upsert
   */
  export type AppointmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Appointment to update in case it exists.
     */
    where: AppointmentWhereUniqueInput
    /**
     * In case the Appointment found by the `where` argument doesn't exist, create a new Appointment with this data.
     */
    create: XOR<AppointmentCreateInput, AppointmentUncheckedCreateInput>
    /**
     * In case the Appointment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppointmentUpdateInput, AppointmentUncheckedUpdateInput>
  }

  /**
   * Appointment delete
   */
  export type AppointmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    /**
     * Filter which Appointment to delete.
     */
    where: AppointmentWhereUniqueInput
  }

  /**
   * Appointment deleteMany
   */
  export type AppointmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Appointments to delete
     */
    where?: AppointmentWhereInput
    /**
     * Limit how many Appointments to delete.
     */
    limit?: number
  }

  /**
   * Appointment.psychNote
   */
  export type Appointment$psychNoteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    where?: PsychNoteWhereInput
  }

  /**
   * Appointment.transaction
   */
  export type Appointment$transactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    where?: FinanceTransactionWhereInput
  }

  /**
   * Appointment.anthropometry
   */
  export type Appointment$anthropometryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    where?: AnthropometryWhereInput
  }

  /**
   * Appointment.mealPlan
   */
  export type Appointment$mealPlanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    where?: MealPlanWhereInput
  }

  /**
   * Appointment without action
   */
  export type AppointmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
  }


  /**
   * Model PsychNote
   */

  export type AggregatePsychNote = {
    _count: PsychNoteCountAggregateOutputType | null
    _avg: PsychNoteAvgAggregateOutputType | null
    _sum: PsychNoteSumAggregateOutputType | null
    _min: PsychNoteMinAggregateOutputType | null
    _max: PsychNoteMaxAggregateOutputType | null
  }

  export type PsychNoteAvgAggregateOutputType = {
    moodRating: number | null
  }

  export type PsychNoteSumAggregateOutputType = {
    moodRating: number | null
  }

  export type PsychNoteMinAggregateOutputType = {
    id: string | null
    appointmentId: string | null
    patientId: string | null
    templateType: $Enums.NoteTemplateType | null
    moodRating: number | null
    privateNotes: string | null
    isPinned: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PsychNoteMaxAggregateOutputType = {
    id: string | null
    appointmentId: string | null
    patientId: string | null
    templateType: $Enums.NoteTemplateType | null
    moodRating: number | null
    privateNotes: string | null
    isPinned: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PsychNoteCountAggregateOutputType = {
    id: number
    appointmentId: number
    patientId: number
    templateType: number
    content: number
    moodRating: number
    privateNotes: number
    isPinned: number
    tags: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PsychNoteAvgAggregateInputType = {
    moodRating?: true
  }

  export type PsychNoteSumAggregateInputType = {
    moodRating?: true
  }

  export type PsychNoteMinAggregateInputType = {
    id?: true
    appointmentId?: true
    patientId?: true
    templateType?: true
    moodRating?: true
    privateNotes?: true
    isPinned?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PsychNoteMaxAggregateInputType = {
    id?: true
    appointmentId?: true
    patientId?: true
    templateType?: true
    moodRating?: true
    privateNotes?: true
    isPinned?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PsychNoteCountAggregateInputType = {
    id?: true
    appointmentId?: true
    patientId?: true
    templateType?: true
    content?: true
    moodRating?: true
    privateNotes?: true
    isPinned?: true
    tags?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PsychNoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PsychNote to aggregate.
     */
    where?: PsychNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PsychNotes to fetch.
     */
    orderBy?: PsychNoteOrderByWithRelationInput | PsychNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PsychNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PsychNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PsychNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PsychNotes
    **/
    _count?: true | PsychNoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PsychNoteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PsychNoteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PsychNoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PsychNoteMaxAggregateInputType
  }

  export type GetPsychNoteAggregateType<T extends PsychNoteAggregateArgs> = {
        [P in keyof T & keyof AggregatePsychNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePsychNote[P]>
      : GetScalarType<T[P], AggregatePsychNote[P]>
  }




  export type PsychNoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PsychNoteWhereInput
    orderBy?: PsychNoteOrderByWithAggregationInput | PsychNoteOrderByWithAggregationInput[]
    by: PsychNoteScalarFieldEnum[] | PsychNoteScalarFieldEnum
    having?: PsychNoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PsychNoteCountAggregateInputType | true
    _avg?: PsychNoteAvgAggregateInputType
    _sum?: PsychNoteSumAggregateInputType
    _min?: PsychNoteMinAggregateInputType
    _max?: PsychNoteMaxAggregateInputType
  }

  export type PsychNoteGroupByOutputType = {
    id: string
    appointmentId: string
    patientId: string
    templateType: $Enums.NoteTemplateType
    content: JsonValue
    moodRating: number | null
    privateNotes: string | null
    isPinned: boolean
    tags: string[]
    createdAt: Date
    updatedAt: Date
    _count: PsychNoteCountAggregateOutputType | null
    _avg: PsychNoteAvgAggregateOutputType | null
    _sum: PsychNoteSumAggregateOutputType | null
    _min: PsychNoteMinAggregateOutputType | null
    _max: PsychNoteMaxAggregateOutputType | null
  }

  type GetPsychNoteGroupByPayload<T extends PsychNoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PsychNoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PsychNoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PsychNoteGroupByOutputType[P]>
            : GetScalarType<T[P], PsychNoteGroupByOutputType[P]>
        }
      >
    >


  export type PsychNoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    appointmentId?: boolean
    patientId?: boolean
    templateType?: boolean
    content?: boolean
    moodRating?: boolean
    privateNotes?: boolean
    isPinned?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["psychNote"]>

  export type PsychNoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    appointmentId?: boolean
    patientId?: boolean
    templateType?: boolean
    content?: boolean
    moodRating?: boolean
    privateNotes?: boolean
    isPinned?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["psychNote"]>

  export type PsychNoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    appointmentId?: boolean
    patientId?: boolean
    templateType?: boolean
    content?: boolean
    moodRating?: boolean
    privateNotes?: boolean
    isPinned?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["psychNote"]>

  export type PsychNoteSelectScalar = {
    id?: boolean
    appointmentId?: boolean
    patientId?: boolean
    templateType?: boolean
    content?: boolean
    moodRating?: boolean
    privateNotes?: boolean
    isPinned?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PsychNoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "appointmentId" | "patientId" | "templateType" | "content" | "moodRating" | "privateNotes" | "isPinned" | "tags" | "createdAt" | "updatedAt", ExtArgs["result"]["psychNote"]>
  export type PsychNoteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type PsychNoteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type PsychNoteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }

  export type $PsychNotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PsychNote"
    objects: {
      appointment: Prisma.$AppointmentPayload<ExtArgs>
      patient: Prisma.$PatientPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      appointmentId: string
      patientId: string
      templateType: $Enums.NoteTemplateType
      content: Prisma.JsonValue
      moodRating: number | null
      privateNotes: string | null
      isPinned: boolean
      tags: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["psychNote"]>
    composites: {}
  }

  type PsychNoteGetPayload<S extends boolean | null | undefined | PsychNoteDefaultArgs> = $Result.GetResult<Prisma.$PsychNotePayload, S>

  type PsychNoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PsychNoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PsychNoteCountAggregateInputType | true
    }

  export interface PsychNoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PsychNote'], meta: { name: 'PsychNote' } }
    /**
     * Find zero or one PsychNote that matches the filter.
     * @param {PsychNoteFindUniqueArgs} args - Arguments to find a PsychNote
     * @example
     * // Get one PsychNote
     * const psychNote = await prisma.psychNote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PsychNoteFindUniqueArgs>(args: SelectSubset<T, PsychNoteFindUniqueArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PsychNote that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PsychNoteFindUniqueOrThrowArgs} args - Arguments to find a PsychNote
     * @example
     * // Get one PsychNote
     * const psychNote = await prisma.psychNote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PsychNoteFindUniqueOrThrowArgs>(args: SelectSubset<T, PsychNoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PsychNote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteFindFirstArgs} args - Arguments to find a PsychNote
     * @example
     * // Get one PsychNote
     * const psychNote = await prisma.psychNote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PsychNoteFindFirstArgs>(args?: SelectSubset<T, PsychNoteFindFirstArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PsychNote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteFindFirstOrThrowArgs} args - Arguments to find a PsychNote
     * @example
     * // Get one PsychNote
     * const psychNote = await prisma.psychNote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PsychNoteFindFirstOrThrowArgs>(args?: SelectSubset<T, PsychNoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PsychNotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PsychNotes
     * const psychNotes = await prisma.psychNote.findMany()
     * 
     * // Get first 10 PsychNotes
     * const psychNotes = await prisma.psychNote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const psychNoteWithIdOnly = await prisma.psychNote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PsychNoteFindManyArgs>(args?: SelectSubset<T, PsychNoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PsychNote.
     * @param {PsychNoteCreateArgs} args - Arguments to create a PsychNote.
     * @example
     * // Create one PsychNote
     * const PsychNote = await prisma.psychNote.create({
     *   data: {
     *     // ... data to create a PsychNote
     *   }
     * })
     * 
     */
    create<T extends PsychNoteCreateArgs>(args: SelectSubset<T, PsychNoteCreateArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PsychNotes.
     * @param {PsychNoteCreateManyArgs} args - Arguments to create many PsychNotes.
     * @example
     * // Create many PsychNotes
     * const psychNote = await prisma.psychNote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PsychNoteCreateManyArgs>(args?: SelectSubset<T, PsychNoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PsychNotes and returns the data saved in the database.
     * @param {PsychNoteCreateManyAndReturnArgs} args - Arguments to create many PsychNotes.
     * @example
     * // Create many PsychNotes
     * const psychNote = await prisma.psychNote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PsychNotes and only return the `id`
     * const psychNoteWithIdOnly = await prisma.psychNote.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PsychNoteCreateManyAndReturnArgs>(args?: SelectSubset<T, PsychNoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PsychNote.
     * @param {PsychNoteDeleteArgs} args - Arguments to delete one PsychNote.
     * @example
     * // Delete one PsychNote
     * const PsychNote = await prisma.psychNote.delete({
     *   where: {
     *     // ... filter to delete one PsychNote
     *   }
     * })
     * 
     */
    delete<T extends PsychNoteDeleteArgs>(args: SelectSubset<T, PsychNoteDeleteArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PsychNote.
     * @param {PsychNoteUpdateArgs} args - Arguments to update one PsychNote.
     * @example
     * // Update one PsychNote
     * const psychNote = await prisma.psychNote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PsychNoteUpdateArgs>(args: SelectSubset<T, PsychNoteUpdateArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PsychNotes.
     * @param {PsychNoteDeleteManyArgs} args - Arguments to filter PsychNotes to delete.
     * @example
     * // Delete a few PsychNotes
     * const { count } = await prisma.psychNote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PsychNoteDeleteManyArgs>(args?: SelectSubset<T, PsychNoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PsychNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PsychNotes
     * const psychNote = await prisma.psychNote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PsychNoteUpdateManyArgs>(args: SelectSubset<T, PsychNoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PsychNotes and returns the data updated in the database.
     * @param {PsychNoteUpdateManyAndReturnArgs} args - Arguments to update many PsychNotes.
     * @example
     * // Update many PsychNotes
     * const psychNote = await prisma.psychNote.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PsychNotes and only return the `id`
     * const psychNoteWithIdOnly = await prisma.psychNote.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PsychNoteUpdateManyAndReturnArgs>(args: SelectSubset<T, PsychNoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PsychNote.
     * @param {PsychNoteUpsertArgs} args - Arguments to update or create a PsychNote.
     * @example
     * // Update or create a PsychNote
     * const psychNote = await prisma.psychNote.upsert({
     *   create: {
     *     // ... data to create a PsychNote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PsychNote we want to update
     *   }
     * })
     */
    upsert<T extends PsychNoteUpsertArgs>(args: SelectSubset<T, PsychNoteUpsertArgs<ExtArgs>>): Prisma__PsychNoteClient<$Result.GetResult<Prisma.$PsychNotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PsychNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteCountArgs} args - Arguments to filter PsychNotes to count.
     * @example
     * // Count the number of PsychNotes
     * const count = await prisma.psychNote.count({
     *   where: {
     *     // ... the filter for the PsychNotes we want to count
     *   }
     * })
    **/
    count<T extends PsychNoteCountArgs>(
      args?: Subset<T, PsychNoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PsychNoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PsychNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PsychNoteAggregateArgs>(args: Subset<T, PsychNoteAggregateArgs>): Prisma.PrismaPromise<GetPsychNoteAggregateType<T>>

    /**
     * Group by PsychNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PsychNoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PsychNoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PsychNoteGroupByArgs['orderBy'] }
        : { orderBy?: PsychNoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PsychNoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPsychNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PsychNote model
   */
  readonly fields: PsychNoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PsychNote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PsychNoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    appointment<T extends AppointmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AppointmentDefaultArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PsychNote model
   */
  interface PsychNoteFieldRefs {
    readonly id: FieldRef<"PsychNote", 'String'>
    readonly appointmentId: FieldRef<"PsychNote", 'String'>
    readonly patientId: FieldRef<"PsychNote", 'String'>
    readonly templateType: FieldRef<"PsychNote", 'NoteTemplateType'>
    readonly content: FieldRef<"PsychNote", 'Json'>
    readonly moodRating: FieldRef<"PsychNote", 'Int'>
    readonly privateNotes: FieldRef<"PsychNote", 'String'>
    readonly isPinned: FieldRef<"PsychNote", 'Boolean'>
    readonly tags: FieldRef<"PsychNote", 'String[]'>
    readonly createdAt: FieldRef<"PsychNote", 'DateTime'>
    readonly updatedAt: FieldRef<"PsychNote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PsychNote findUnique
   */
  export type PsychNoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter, which PsychNote to fetch.
     */
    where: PsychNoteWhereUniqueInput
  }

  /**
   * PsychNote findUniqueOrThrow
   */
  export type PsychNoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter, which PsychNote to fetch.
     */
    where: PsychNoteWhereUniqueInput
  }

  /**
   * PsychNote findFirst
   */
  export type PsychNoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter, which PsychNote to fetch.
     */
    where?: PsychNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PsychNotes to fetch.
     */
    orderBy?: PsychNoteOrderByWithRelationInput | PsychNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PsychNotes.
     */
    cursor?: PsychNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PsychNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PsychNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PsychNotes.
     */
    distinct?: PsychNoteScalarFieldEnum | PsychNoteScalarFieldEnum[]
  }

  /**
   * PsychNote findFirstOrThrow
   */
  export type PsychNoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter, which PsychNote to fetch.
     */
    where?: PsychNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PsychNotes to fetch.
     */
    orderBy?: PsychNoteOrderByWithRelationInput | PsychNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PsychNotes.
     */
    cursor?: PsychNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PsychNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PsychNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PsychNotes.
     */
    distinct?: PsychNoteScalarFieldEnum | PsychNoteScalarFieldEnum[]
  }

  /**
   * PsychNote findMany
   */
  export type PsychNoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter, which PsychNotes to fetch.
     */
    where?: PsychNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PsychNotes to fetch.
     */
    orderBy?: PsychNoteOrderByWithRelationInput | PsychNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PsychNotes.
     */
    cursor?: PsychNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PsychNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PsychNotes.
     */
    skip?: number
    distinct?: PsychNoteScalarFieldEnum | PsychNoteScalarFieldEnum[]
  }

  /**
   * PsychNote create
   */
  export type PsychNoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * The data needed to create a PsychNote.
     */
    data: XOR<PsychNoteCreateInput, PsychNoteUncheckedCreateInput>
  }

  /**
   * PsychNote createMany
   */
  export type PsychNoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PsychNotes.
     */
    data: PsychNoteCreateManyInput | PsychNoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PsychNote createManyAndReturn
   */
  export type PsychNoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * The data used to create many PsychNotes.
     */
    data: PsychNoteCreateManyInput | PsychNoteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PsychNote update
   */
  export type PsychNoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * The data needed to update a PsychNote.
     */
    data: XOR<PsychNoteUpdateInput, PsychNoteUncheckedUpdateInput>
    /**
     * Choose, which PsychNote to update.
     */
    where: PsychNoteWhereUniqueInput
  }

  /**
   * PsychNote updateMany
   */
  export type PsychNoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PsychNotes.
     */
    data: XOR<PsychNoteUpdateManyMutationInput, PsychNoteUncheckedUpdateManyInput>
    /**
     * Filter which PsychNotes to update
     */
    where?: PsychNoteWhereInput
    /**
     * Limit how many PsychNotes to update.
     */
    limit?: number
  }

  /**
   * PsychNote updateManyAndReturn
   */
  export type PsychNoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * The data used to update PsychNotes.
     */
    data: XOR<PsychNoteUpdateManyMutationInput, PsychNoteUncheckedUpdateManyInput>
    /**
     * Filter which PsychNotes to update
     */
    where?: PsychNoteWhereInput
    /**
     * Limit how many PsychNotes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PsychNote upsert
   */
  export type PsychNoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * The filter to search for the PsychNote to update in case it exists.
     */
    where: PsychNoteWhereUniqueInput
    /**
     * In case the PsychNote found by the `where` argument doesn't exist, create a new PsychNote with this data.
     */
    create: XOR<PsychNoteCreateInput, PsychNoteUncheckedCreateInput>
    /**
     * In case the PsychNote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PsychNoteUpdateInput, PsychNoteUncheckedUpdateInput>
  }

  /**
   * PsychNote delete
   */
  export type PsychNoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
    /**
     * Filter which PsychNote to delete.
     */
    where: PsychNoteWhereUniqueInput
  }

  /**
   * PsychNote deleteMany
   */
  export type PsychNoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PsychNotes to delete
     */
    where?: PsychNoteWhereInput
    /**
     * Limit how many PsychNotes to delete.
     */
    limit?: number
  }

  /**
   * PsychNote without action
   */
  export type PsychNoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PsychNote
     */
    select?: PsychNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PsychNote
     */
    omit?: PsychNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PsychNoteInclude<ExtArgs> | null
  }


  /**
   * Model Task
   */

  export type AggregateTask = {
    _count: TaskCountAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  export type TaskMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    description: string | null
    isCompleted: boolean | null
    dueDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    description: string | null
    isCompleted: boolean | null
    dueDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskCountAggregateOutputType = {
    id: number
    patientId: number
    description: number
    isCompleted: number
    dueDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TaskMinAggregateInputType = {
    id?: true
    patientId?: true
    description?: true
    isCompleted?: true
    dueDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskMaxAggregateInputType = {
    id?: true
    patientId?: true
    description?: true
    isCompleted?: true
    dueDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskCountAggregateInputType = {
    id?: true
    patientId?: true
    description?: true
    isCompleted?: true
    dueDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Task to aggregate.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tasks
    **/
    _count?: true | TaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskMaxAggregateInputType
  }

  export type GetTaskAggregateType<T extends TaskAggregateArgs> = {
        [P in keyof T & keyof AggregateTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTask[P]>
      : GetScalarType<T[P], AggregateTask[P]>
  }




  export type TaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithAggregationInput | TaskOrderByWithAggregationInput[]
    by: TaskScalarFieldEnum[] | TaskScalarFieldEnum
    having?: TaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskCountAggregateInputType | true
    _min?: TaskMinAggregateInputType
    _max?: TaskMaxAggregateInputType
  }

  export type TaskGroupByOutputType = {
    id: string
    patientId: string
    description: string
    isCompleted: boolean
    dueDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: TaskCountAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  type GetTaskGroupByPayload<T extends TaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskGroupByOutputType[P]>
            : GetScalarType<T[P], TaskGroupByOutputType[P]>
        }
      >
    >


  export type TaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    description?: boolean
    isCompleted?: boolean
    dueDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    description?: boolean
    isCompleted?: boolean
    dueDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    description?: boolean
    isCompleted?: boolean
    dueDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectScalar = {
    id?: boolean
    patientId?: boolean
    description?: boolean
    isCompleted?: boolean
    dueDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "description" | "isCompleted" | "dueDate" | "createdAt" | "updatedAt", ExtArgs["result"]["task"]>
  export type TaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type TaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type TaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }

  export type $TaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Task"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      description: string
      isCompleted: boolean
      dueDate: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["task"]>
    composites: {}
  }

  type TaskGetPayload<S extends boolean | null | undefined | TaskDefaultArgs> = $Result.GetResult<Prisma.$TaskPayload, S>

  type TaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TaskCountAggregateInputType | true
    }

  export interface TaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Task'], meta: { name: 'Task' } }
    /**
     * Find zero or one Task that matches the filter.
     * @param {TaskFindUniqueArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaskFindUniqueArgs>(args: SelectSubset<T, TaskFindUniqueArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Task that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TaskFindUniqueOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaskFindUniqueOrThrowArgs>(args: SelectSubset<T, TaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Task that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaskFindFirstArgs>(args?: SelectSubset<T, TaskFindFirstArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Task that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaskFindFirstOrThrowArgs>(args?: SelectSubset<T, TaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tasks
     * const tasks = await prisma.task.findMany()
     * 
     * // Get first 10 Tasks
     * const tasks = await prisma.task.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taskWithIdOnly = await prisma.task.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TaskFindManyArgs>(args?: SelectSubset<T, TaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Task.
     * @param {TaskCreateArgs} args - Arguments to create a Task.
     * @example
     * // Create one Task
     * const Task = await prisma.task.create({
     *   data: {
     *     // ... data to create a Task
     *   }
     * })
     * 
     */
    create<T extends TaskCreateArgs>(args: SelectSubset<T, TaskCreateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tasks.
     * @param {TaskCreateManyArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaskCreateManyArgs>(args?: SelectSubset<T, TaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tasks and returns the data saved in the database.
     * @param {TaskCreateManyAndReturnArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tasks and only return the `id`
     * const taskWithIdOnly = await prisma.task.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaskCreateManyAndReturnArgs>(args?: SelectSubset<T, TaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Task.
     * @param {TaskDeleteArgs} args - Arguments to delete one Task.
     * @example
     * // Delete one Task
     * const Task = await prisma.task.delete({
     *   where: {
     *     // ... filter to delete one Task
     *   }
     * })
     * 
     */
    delete<T extends TaskDeleteArgs>(args: SelectSubset<T, TaskDeleteArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Task.
     * @param {TaskUpdateArgs} args - Arguments to update one Task.
     * @example
     * // Update one Task
     * const task = await prisma.task.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaskUpdateArgs>(args: SelectSubset<T, TaskUpdateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tasks.
     * @param {TaskDeleteManyArgs} args - Arguments to filter Tasks to delete.
     * @example
     * // Delete a few Tasks
     * const { count } = await prisma.task.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaskDeleteManyArgs>(args?: SelectSubset<T, TaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tasks
     * const task = await prisma.task.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaskUpdateManyArgs>(args: SelectSubset<T, TaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tasks and returns the data updated in the database.
     * @param {TaskUpdateManyAndReturnArgs} args - Arguments to update many Tasks.
     * @example
     * // Update many Tasks
     * const task = await prisma.task.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tasks and only return the `id`
     * const taskWithIdOnly = await prisma.task.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TaskUpdateManyAndReturnArgs>(args: SelectSubset<T, TaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Task.
     * @param {TaskUpsertArgs} args - Arguments to update or create a Task.
     * @example
     * // Update or create a Task
     * const task = await prisma.task.upsert({
     *   create: {
     *     // ... data to create a Task
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Task we want to update
     *   }
     * })
     */
    upsert<T extends TaskUpsertArgs>(args: SelectSubset<T, TaskUpsertArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskCountArgs} args - Arguments to filter Tasks to count.
     * @example
     * // Count the number of Tasks
     * const count = await prisma.task.count({
     *   where: {
     *     // ... the filter for the Tasks we want to count
     *   }
     * })
    **/
    count<T extends TaskCountArgs>(
      args?: Subset<T, TaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaskAggregateArgs>(args: Subset<T, TaskAggregateArgs>): Prisma.PrismaPromise<GetTaskAggregateType<T>>

    /**
     * Group by Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskGroupByArgs['orderBy'] }
        : { orderBy?: TaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Task model
   */
  readonly fields: TaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Task.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Task model
   */
  interface TaskFieldRefs {
    readonly id: FieldRef<"Task", 'String'>
    readonly patientId: FieldRef<"Task", 'String'>
    readonly description: FieldRef<"Task", 'String'>
    readonly isCompleted: FieldRef<"Task", 'Boolean'>
    readonly dueDate: FieldRef<"Task", 'DateTime'>
    readonly createdAt: FieldRef<"Task", 'DateTime'>
    readonly updatedAt: FieldRef<"Task", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Task findUnique
   */
  export type TaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findUniqueOrThrow
   */
  export type TaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findFirst
   */
  export type TaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findFirstOrThrow
   */
  export type TaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findMany
   */
  export type TaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Tasks to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task create
   */
  export type TaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to create a Task.
     */
    data: XOR<TaskCreateInput, TaskUncheckedCreateInput>
  }

  /**
   * Task createMany
   */
  export type TaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Task createManyAndReturn
   */
  export type TaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Task update
   */
  export type TaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to update a Task.
     */
    data: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
    /**
     * Choose, which Task to update.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task updateMany
   */
  export type TaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tasks.
     */
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyInput>
    /**
     * Filter which Tasks to update
     */
    where?: TaskWhereInput
    /**
     * Limit how many Tasks to update.
     */
    limit?: number
  }

  /**
   * Task updateManyAndReturn
   */
  export type TaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * The data used to update Tasks.
     */
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyInput>
    /**
     * Filter which Tasks to update
     */
    where?: TaskWhereInput
    /**
     * Limit how many Tasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Task upsert
   */
  export type TaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The filter to search for the Task to update in case it exists.
     */
    where: TaskWhereUniqueInput
    /**
     * In case the Task found by the `where` argument doesn't exist, create a new Task with this data.
     */
    create: XOR<TaskCreateInput, TaskUncheckedCreateInput>
    /**
     * In case the Task was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
  }

  /**
   * Task delete
   */
  export type TaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter which Task to delete.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task deleteMany
   */
  export type TaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tasks to delete
     */
    where?: TaskWhereInput
    /**
     * Limit how many Tasks to delete.
     */
    limit?: number
  }

  /**
   * Task without action
   */
  export type TaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Task
     */
    omit?: TaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
  }


  /**
   * Model AccessLog
   */

  export type AggregateAccessLog = {
    _count: AccessLogCountAggregateOutputType | null
    _min: AccessLogMinAggregateOutputType | null
    _max: AccessLogMaxAggregateOutputType | null
  }

  export type AccessLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    patientId: string | null
    action: string | null
    resource: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AccessLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    patientId: string | null
    action: string | null
    resource: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AccessLogCountAggregateOutputType = {
    id: number
    userId: number
    patientId: number
    action: number
    resource: number
    details: number
    ipAddress: number
    userAgent: number
    createdAt: number
    _all: number
  }


  export type AccessLogMinAggregateInputType = {
    id?: true
    userId?: true
    patientId?: true
    action?: true
    resource?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AccessLogMaxAggregateInputType = {
    id?: true
    userId?: true
    patientId?: true
    action?: true
    resource?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AccessLogCountAggregateInputType = {
    id?: true
    userId?: true
    patientId?: true
    action?: true
    resource?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    _all?: true
  }

  export type AccessLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccessLog to aggregate.
     */
    where?: AccessLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessLogs to fetch.
     */
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccessLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccessLogs
    **/
    _count?: true | AccessLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccessLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccessLogMaxAggregateInputType
  }

  export type GetAccessLogAggregateType<T extends AccessLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAccessLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccessLog[P]>
      : GetScalarType<T[P], AggregateAccessLog[P]>
  }




  export type AccessLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccessLogWhereInput
    orderBy?: AccessLogOrderByWithAggregationInput | AccessLogOrderByWithAggregationInput[]
    by: AccessLogScalarFieldEnum[] | AccessLogScalarFieldEnum
    having?: AccessLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccessLogCountAggregateInputType | true
    _min?: AccessLogMinAggregateInputType
    _max?: AccessLogMaxAggregateInputType
  }

  export type AccessLogGroupByOutputType = {
    id: string
    userId: string
    patientId: string | null
    action: string
    resource: string
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    _count: AccessLogCountAggregateOutputType | null
    _min: AccessLogMinAggregateOutputType | null
    _max: AccessLogMaxAggregateOutputType | null
  }

  type GetAccessLogGroupByPayload<T extends AccessLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccessLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccessLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccessLogGroupByOutputType[P]>
            : GetScalarType<T[P], AccessLogGroupByOutputType[P]>
        }
      >
    >


  export type AccessLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    patientId?: boolean
    action?: boolean
    resource?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }, ExtArgs["result"]["accessLog"]>

  export type AccessLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    patientId?: boolean
    action?: boolean
    resource?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }, ExtArgs["result"]["accessLog"]>

  export type AccessLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    patientId?: boolean
    action?: boolean
    resource?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }, ExtArgs["result"]["accessLog"]>

  export type AccessLogSelectScalar = {
    id?: boolean
    userId?: boolean
    patientId?: boolean
    action?: boolean
    resource?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }

  export type AccessLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "patientId" | "action" | "resource" | "details" | "ipAddress" | "userAgent" | "createdAt", ExtArgs["result"]["accessLog"]>
  export type AccessLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }
  export type AccessLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }
  export type AccessLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    patient?: boolean | AccessLog$patientArgs<ExtArgs>
  }

  export type $AccessLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AccessLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      patient: Prisma.$PatientPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      patientId: string | null
      action: string
      resource: string
      details: string | null
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
    }, ExtArgs["result"]["accessLog"]>
    composites: {}
  }

  type AccessLogGetPayload<S extends boolean | null | undefined | AccessLogDefaultArgs> = $Result.GetResult<Prisma.$AccessLogPayload, S>

  type AccessLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccessLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccessLogCountAggregateInputType | true
    }

  export interface AccessLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AccessLog'], meta: { name: 'AccessLog' } }
    /**
     * Find zero or one AccessLog that matches the filter.
     * @param {AccessLogFindUniqueArgs} args - Arguments to find a AccessLog
     * @example
     * // Get one AccessLog
     * const accessLog = await prisma.accessLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccessLogFindUniqueArgs>(args: SelectSubset<T, AccessLogFindUniqueArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AccessLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccessLogFindUniqueOrThrowArgs} args - Arguments to find a AccessLog
     * @example
     * // Get one AccessLog
     * const accessLog = await prisma.accessLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccessLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AccessLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccessLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogFindFirstArgs} args - Arguments to find a AccessLog
     * @example
     * // Get one AccessLog
     * const accessLog = await prisma.accessLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccessLogFindFirstArgs>(args?: SelectSubset<T, AccessLogFindFirstArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccessLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogFindFirstOrThrowArgs} args - Arguments to find a AccessLog
     * @example
     * // Get one AccessLog
     * const accessLog = await prisma.accessLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccessLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AccessLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AccessLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccessLogs
     * const accessLogs = await prisma.accessLog.findMany()
     * 
     * // Get first 10 AccessLogs
     * const accessLogs = await prisma.accessLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accessLogWithIdOnly = await prisma.accessLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccessLogFindManyArgs>(args?: SelectSubset<T, AccessLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AccessLog.
     * @param {AccessLogCreateArgs} args - Arguments to create a AccessLog.
     * @example
     * // Create one AccessLog
     * const AccessLog = await prisma.accessLog.create({
     *   data: {
     *     // ... data to create a AccessLog
     *   }
     * })
     * 
     */
    create<T extends AccessLogCreateArgs>(args: SelectSubset<T, AccessLogCreateArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AccessLogs.
     * @param {AccessLogCreateManyArgs} args - Arguments to create many AccessLogs.
     * @example
     * // Create many AccessLogs
     * const accessLog = await prisma.accessLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccessLogCreateManyArgs>(args?: SelectSubset<T, AccessLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AccessLogs and returns the data saved in the database.
     * @param {AccessLogCreateManyAndReturnArgs} args - Arguments to create many AccessLogs.
     * @example
     * // Create many AccessLogs
     * const accessLog = await prisma.accessLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AccessLogs and only return the `id`
     * const accessLogWithIdOnly = await prisma.accessLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccessLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AccessLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AccessLog.
     * @param {AccessLogDeleteArgs} args - Arguments to delete one AccessLog.
     * @example
     * // Delete one AccessLog
     * const AccessLog = await prisma.accessLog.delete({
     *   where: {
     *     // ... filter to delete one AccessLog
     *   }
     * })
     * 
     */
    delete<T extends AccessLogDeleteArgs>(args: SelectSubset<T, AccessLogDeleteArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AccessLog.
     * @param {AccessLogUpdateArgs} args - Arguments to update one AccessLog.
     * @example
     * // Update one AccessLog
     * const accessLog = await prisma.accessLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccessLogUpdateArgs>(args: SelectSubset<T, AccessLogUpdateArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AccessLogs.
     * @param {AccessLogDeleteManyArgs} args - Arguments to filter AccessLogs to delete.
     * @example
     * // Delete a few AccessLogs
     * const { count } = await prisma.accessLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccessLogDeleteManyArgs>(args?: SelectSubset<T, AccessLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccessLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccessLogs
     * const accessLog = await prisma.accessLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccessLogUpdateManyArgs>(args: SelectSubset<T, AccessLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccessLogs and returns the data updated in the database.
     * @param {AccessLogUpdateManyAndReturnArgs} args - Arguments to update many AccessLogs.
     * @example
     * // Update many AccessLogs
     * const accessLog = await prisma.accessLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AccessLogs and only return the `id`
     * const accessLogWithIdOnly = await prisma.accessLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccessLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AccessLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AccessLog.
     * @param {AccessLogUpsertArgs} args - Arguments to update or create a AccessLog.
     * @example
     * // Update or create a AccessLog
     * const accessLog = await prisma.accessLog.upsert({
     *   create: {
     *     // ... data to create a AccessLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccessLog we want to update
     *   }
     * })
     */
    upsert<T extends AccessLogUpsertArgs>(args: SelectSubset<T, AccessLogUpsertArgs<ExtArgs>>): Prisma__AccessLogClient<$Result.GetResult<Prisma.$AccessLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AccessLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogCountArgs} args - Arguments to filter AccessLogs to count.
     * @example
     * // Count the number of AccessLogs
     * const count = await prisma.accessLog.count({
     *   where: {
     *     // ... the filter for the AccessLogs we want to count
     *   }
     * })
    **/
    count<T extends AccessLogCountArgs>(
      args?: Subset<T, AccessLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccessLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccessLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccessLogAggregateArgs>(args: Subset<T, AccessLogAggregateArgs>): Prisma.PrismaPromise<GetAccessLogAggregateType<T>>

    /**
     * Group by AccessLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccessLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccessLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccessLogGroupByArgs['orderBy'] }
        : { orderBy?: AccessLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccessLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccessLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AccessLog model
   */
  readonly fields: AccessLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccessLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccessLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    patient<T extends AccessLog$patientArgs<ExtArgs> = {}>(args?: Subset<T, AccessLog$patientArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AccessLog model
   */
  interface AccessLogFieldRefs {
    readonly id: FieldRef<"AccessLog", 'String'>
    readonly userId: FieldRef<"AccessLog", 'String'>
    readonly patientId: FieldRef<"AccessLog", 'String'>
    readonly action: FieldRef<"AccessLog", 'String'>
    readonly resource: FieldRef<"AccessLog", 'String'>
    readonly details: FieldRef<"AccessLog", 'String'>
    readonly ipAddress: FieldRef<"AccessLog", 'String'>
    readonly userAgent: FieldRef<"AccessLog", 'String'>
    readonly createdAt: FieldRef<"AccessLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AccessLog findUnique
   */
  export type AccessLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter, which AccessLog to fetch.
     */
    where: AccessLogWhereUniqueInput
  }

  /**
   * AccessLog findUniqueOrThrow
   */
  export type AccessLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter, which AccessLog to fetch.
     */
    where: AccessLogWhereUniqueInput
  }

  /**
   * AccessLog findFirst
   */
  export type AccessLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter, which AccessLog to fetch.
     */
    where?: AccessLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessLogs to fetch.
     */
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccessLogs.
     */
    cursor?: AccessLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccessLogs.
     */
    distinct?: AccessLogScalarFieldEnum | AccessLogScalarFieldEnum[]
  }

  /**
   * AccessLog findFirstOrThrow
   */
  export type AccessLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter, which AccessLog to fetch.
     */
    where?: AccessLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessLogs to fetch.
     */
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccessLogs.
     */
    cursor?: AccessLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccessLogs.
     */
    distinct?: AccessLogScalarFieldEnum | AccessLogScalarFieldEnum[]
  }

  /**
   * AccessLog findMany
   */
  export type AccessLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter, which AccessLogs to fetch.
     */
    where?: AccessLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccessLogs to fetch.
     */
    orderBy?: AccessLogOrderByWithRelationInput | AccessLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccessLogs.
     */
    cursor?: AccessLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccessLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccessLogs.
     */
    skip?: number
    distinct?: AccessLogScalarFieldEnum | AccessLogScalarFieldEnum[]
  }

  /**
   * AccessLog create
   */
  export type AccessLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AccessLog.
     */
    data: XOR<AccessLogCreateInput, AccessLogUncheckedCreateInput>
  }

  /**
   * AccessLog createMany
   */
  export type AccessLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AccessLogs.
     */
    data: AccessLogCreateManyInput | AccessLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AccessLog createManyAndReturn
   */
  export type AccessLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * The data used to create many AccessLogs.
     */
    data: AccessLogCreateManyInput | AccessLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccessLog update
   */
  export type AccessLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AccessLog.
     */
    data: XOR<AccessLogUpdateInput, AccessLogUncheckedUpdateInput>
    /**
     * Choose, which AccessLog to update.
     */
    where: AccessLogWhereUniqueInput
  }

  /**
   * AccessLog updateMany
   */
  export type AccessLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AccessLogs.
     */
    data: XOR<AccessLogUpdateManyMutationInput, AccessLogUncheckedUpdateManyInput>
    /**
     * Filter which AccessLogs to update
     */
    where?: AccessLogWhereInput
    /**
     * Limit how many AccessLogs to update.
     */
    limit?: number
  }

  /**
   * AccessLog updateManyAndReturn
   */
  export type AccessLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * The data used to update AccessLogs.
     */
    data: XOR<AccessLogUpdateManyMutationInput, AccessLogUncheckedUpdateManyInput>
    /**
     * Filter which AccessLogs to update
     */
    where?: AccessLogWhereInput
    /**
     * Limit how many AccessLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AccessLog upsert
   */
  export type AccessLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AccessLog to update in case it exists.
     */
    where: AccessLogWhereUniqueInput
    /**
     * In case the AccessLog found by the `where` argument doesn't exist, create a new AccessLog with this data.
     */
    create: XOR<AccessLogCreateInput, AccessLogUncheckedCreateInput>
    /**
     * In case the AccessLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccessLogUpdateInput, AccessLogUncheckedUpdateInput>
  }

  /**
   * AccessLog delete
   */
  export type AccessLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
    /**
     * Filter which AccessLog to delete.
     */
    where: AccessLogWhereUniqueInput
  }

  /**
   * AccessLog deleteMany
   */
  export type AccessLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccessLogs to delete
     */
    where?: AccessLogWhereInput
    /**
     * Limit how many AccessLogs to delete.
     */
    limit?: number
  }

  /**
   * AccessLog.patient
   */
  export type AccessLog$patientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    where?: PatientWhereInput
  }

  /**
   * AccessLog without action
   */
  export type AccessLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccessLog
     */
    select?: AccessLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccessLog
     */
    omit?: AccessLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccessLogInclude<ExtArgs> | null
  }


  /**
   * Model FinanceTransaction
   */

  export type AggregateFinanceTransaction = {
    _count: FinanceTransactionCountAggregateOutputType | null
    _avg: FinanceTransactionAvgAggregateOutputType | null
    _sum: FinanceTransactionSumAggregateOutputType | null
    _min: FinanceTransactionMinAggregateOutputType | null
    _max: FinanceTransactionMaxAggregateOutputType | null
  }

  export type FinanceTransactionAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type FinanceTransactionSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type FinanceTransactionMinAggregateOutputType = {
    id: string | null
    clinicianId: string | null
    appointmentId: string | null
    type: $Enums.TransactionType | null
    category: string | null
    amount: Decimal | null
    description: string | null
    date: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FinanceTransactionMaxAggregateOutputType = {
    id: string | null
    clinicianId: string | null
    appointmentId: string | null
    type: $Enums.TransactionType | null
    category: string | null
    amount: Decimal | null
    description: string | null
    date: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FinanceTransactionCountAggregateOutputType = {
    id: number
    clinicianId: number
    appointmentId: number
    type: number
    category: number
    amount: number
    description: number
    date: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FinanceTransactionAvgAggregateInputType = {
    amount?: true
  }

  export type FinanceTransactionSumAggregateInputType = {
    amount?: true
  }

  export type FinanceTransactionMinAggregateInputType = {
    id?: true
    clinicianId?: true
    appointmentId?: true
    type?: true
    category?: true
    amount?: true
    description?: true
    date?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FinanceTransactionMaxAggregateInputType = {
    id?: true
    clinicianId?: true
    appointmentId?: true
    type?: true
    category?: true
    amount?: true
    description?: true
    date?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FinanceTransactionCountAggregateInputType = {
    id?: true
    clinicianId?: true
    appointmentId?: true
    type?: true
    category?: true
    amount?: true
    description?: true
    date?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FinanceTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinanceTransaction to aggregate.
     */
    where?: FinanceTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinanceTransactions to fetch.
     */
    orderBy?: FinanceTransactionOrderByWithRelationInput | FinanceTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FinanceTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinanceTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinanceTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FinanceTransactions
    **/
    _count?: true | FinanceTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FinanceTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FinanceTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FinanceTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FinanceTransactionMaxAggregateInputType
  }

  export type GetFinanceTransactionAggregateType<T extends FinanceTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateFinanceTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFinanceTransaction[P]>
      : GetScalarType<T[P], AggregateFinanceTransaction[P]>
  }




  export type FinanceTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FinanceTransactionWhereInput
    orderBy?: FinanceTransactionOrderByWithAggregationInput | FinanceTransactionOrderByWithAggregationInput[]
    by: FinanceTransactionScalarFieldEnum[] | FinanceTransactionScalarFieldEnum
    having?: FinanceTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FinanceTransactionCountAggregateInputType | true
    _avg?: FinanceTransactionAvgAggregateInputType
    _sum?: FinanceTransactionSumAggregateInputType
    _min?: FinanceTransactionMinAggregateInputType
    _max?: FinanceTransactionMaxAggregateInputType
  }

  export type FinanceTransactionGroupByOutputType = {
    id: string
    clinicianId: string
    appointmentId: string | null
    type: $Enums.TransactionType
    category: string
    amount: Decimal
    description: string | null
    date: Date
    createdAt: Date
    updatedAt: Date
    _count: FinanceTransactionCountAggregateOutputType | null
    _avg: FinanceTransactionAvgAggregateOutputType | null
    _sum: FinanceTransactionSumAggregateOutputType | null
    _min: FinanceTransactionMinAggregateOutputType | null
    _max: FinanceTransactionMaxAggregateOutputType | null
  }

  type GetFinanceTransactionGroupByPayload<T extends FinanceTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FinanceTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FinanceTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FinanceTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], FinanceTransactionGroupByOutputType[P]>
        }
      >
    >


  export type FinanceTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    appointmentId?: boolean
    type?: boolean
    category?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }, ExtArgs["result"]["financeTransaction"]>

  export type FinanceTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    appointmentId?: boolean
    type?: boolean
    category?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }, ExtArgs["result"]["financeTransaction"]>

  export type FinanceTransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clinicianId?: boolean
    appointmentId?: boolean
    type?: boolean
    category?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }, ExtArgs["result"]["financeTransaction"]>

  export type FinanceTransactionSelectScalar = {
    id?: boolean
    clinicianId?: boolean
    appointmentId?: boolean
    type?: boolean
    category?: boolean
    amount?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FinanceTransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clinicianId" | "appointmentId" | "type" | "category" | "amount" | "description" | "date" | "createdAt" | "updatedAt", ExtArgs["result"]["financeTransaction"]>
  export type FinanceTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }
  export type FinanceTransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }
  export type FinanceTransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clinician?: boolean | ClinicianProfileDefaultArgs<ExtArgs>
    appointment?: boolean | FinanceTransaction$appointmentArgs<ExtArgs>
  }

  export type $FinanceTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FinanceTransaction"
    objects: {
      clinician: Prisma.$ClinicianProfilePayload<ExtArgs>
      appointment: Prisma.$AppointmentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clinicianId: string
      appointmentId: string | null
      type: $Enums.TransactionType
      category: string
      amount: Prisma.Decimal
      description: string | null
      date: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["financeTransaction"]>
    composites: {}
  }

  type FinanceTransactionGetPayload<S extends boolean | null | undefined | FinanceTransactionDefaultArgs> = $Result.GetResult<Prisma.$FinanceTransactionPayload, S>

  type FinanceTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FinanceTransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FinanceTransactionCountAggregateInputType | true
    }

  export interface FinanceTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FinanceTransaction'], meta: { name: 'FinanceTransaction' } }
    /**
     * Find zero or one FinanceTransaction that matches the filter.
     * @param {FinanceTransactionFindUniqueArgs} args - Arguments to find a FinanceTransaction
     * @example
     * // Get one FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FinanceTransactionFindUniqueArgs>(args: SelectSubset<T, FinanceTransactionFindUniqueArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FinanceTransaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FinanceTransactionFindUniqueOrThrowArgs} args - Arguments to find a FinanceTransaction
     * @example
     * // Get one FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FinanceTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, FinanceTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinanceTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionFindFirstArgs} args - Arguments to find a FinanceTransaction
     * @example
     * // Get one FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FinanceTransactionFindFirstArgs>(args?: SelectSubset<T, FinanceTransactionFindFirstArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinanceTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionFindFirstOrThrowArgs} args - Arguments to find a FinanceTransaction
     * @example
     * // Get one FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FinanceTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, FinanceTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FinanceTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FinanceTransactions
     * const financeTransactions = await prisma.financeTransaction.findMany()
     * 
     * // Get first 10 FinanceTransactions
     * const financeTransactions = await prisma.financeTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const financeTransactionWithIdOnly = await prisma.financeTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FinanceTransactionFindManyArgs>(args?: SelectSubset<T, FinanceTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FinanceTransaction.
     * @param {FinanceTransactionCreateArgs} args - Arguments to create a FinanceTransaction.
     * @example
     * // Create one FinanceTransaction
     * const FinanceTransaction = await prisma.financeTransaction.create({
     *   data: {
     *     // ... data to create a FinanceTransaction
     *   }
     * })
     * 
     */
    create<T extends FinanceTransactionCreateArgs>(args: SelectSubset<T, FinanceTransactionCreateArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FinanceTransactions.
     * @param {FinanceTransactionCreateManyArgs} args - Arguments to create many FinanceTransactions.
     * @example
     * // Create many FinanceTransactions
     * const financeTransaction = await prisma.financeTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FinanceTransactionCreateManyArgs>(args?: SelectSubset<T, FinanceTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FinanceTransactions and returns the data saved in the database.
     * @param {FinanceTransactionCreateManyAndReturnArgs} args - Arguments to create many FinanceTransactions.
     * @example
     * // Create many FinanceTransactions
     * const financeTransaction = await prisma.financeTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FinanceTransactions and only return the `id`
     * const financeTransactionWithIdOnly = await prisma.financeTransaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FinanceTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, FinanceTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FinanceTransaction.
     * @param {FinanceTransactionDeleteArgs} args - Arguments to delete one FinanceTransaction.
     * @example
     * // Delete one FinanceTransaction
     * const FinanceTransaction = await prisma.financeTransaction.delete({
     *   where: {
     *     // ... filter to delete one FinanceTransaction
     *   }
     * })
     * 
     */
    delete<T extends FinanceTransactionDeleteArgs>(args: SelectSubset<T, FinanceTransactionDeleteArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FinanceTransaction.
     * @param {FinanceTransactionUpdateArgs} args - Arguments to update one FinanceTransaction.
     * @example
     * // Update one FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FinanceTransactionUpdateArgs>(args: SelectSubset<T, FinanceTransactionUpdateArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FinanceTransactions.
     * @param {FinanceTransactionDeleteManyArgs} args - Arguments to filter FinanceTransactions to delete.
     * @example
     * // Delete a few FinanceTransactions
     * const { count } = await prisma.financeTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FinanceTransactionDeleteManyArgs>(args?: SelectSubset<T, FinanceTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinanceTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FinanceTransactions
     * const financeTransaction = await prisma.financeTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FinanceTransactionUpdateManyArgs>(args: SelectSubset<T, FinanceTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinanceTransactions and returns the data updated in the database.
     * @param {FinanceTransactionUpdateManyAndReturnArgs} args - Arguments to update many FinanceTransactions.
     * @example
     * // Update many FinanceTransactions
     * const financeTransaction = await prisma.financeTransaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FinanceTransactions and only return the `id`
     * const financeTransactionWithIdOnly = await prisma.financeTransaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FinanceTransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, FinanceTransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FinanceTransaction.
     * @param {FinanceTransactionUpsertArgs} args - Arguments to update or create a FinanceTransaction.
     * @example
     * // Update or create a FinanceTransaction
     * const financeTransaction = await prisma.financeTransaction.upsert({
     *   create: {
     *     // ... data to create a FinanceTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FinanceTransaction we want to update
     *   }
     * })
     */
    upsert<T extends FinanceTransactionUpsertArgs>(args: SelectSubset<T, FinanceTransactionUpsertArgs<ExtArgs>>): Prisma__FinanceTransactionClient<$Result.GetResult<Prisma.$FinanceTransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FinanceTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionCountArgs} args - Arguments to filter FinanceTransactions to count.
     * @example
     * // Count the number of FinanceTransactions
     * const count = await prisma.financeTransaction.count({
     *   where: {
     *     // ... the filter for the FinanceTransactions we want to count
     *   }
     * })
    **/
    count<T extends FinanceTransactionCountArgs>(
      args?: Subset<T, FinanceTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FinanceTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FinanceTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FinanceTransactionAggregateArgs>(args: Subset<T, FinanceTransactionAggregateArgs>): Prisma.PrismaPromise<GetFinanceTransactionAggregateType<T>>

    /**
     * Group by FinanceTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinanceTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FinanceTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FinanceTransactionGroupByArgs['orderBy'] }
        : { orderBy?: FinanceTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FinanceTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFinanceTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FinanceTransaction model
   */
  readonly fields: FinanceTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FinanceTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FinanceTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clinician<T extends ClinicianProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClinicianProfileDefaultArgs<ExtArgs>>): Prisma__ClinicianProfileClient<$Result.GetResult<Prisma.$ClinicianProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    appointment<T extends FinanceTransaction$appointmentArgs<ExtArgs> = {}>(args?: Subset<T, FinanceTransaction$appointmentArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FinanceTransaction model
   */
  interface FinanceTransactionFieldRefs {
    readonly id: FieldRef<"FinanceTransaction", 'String'>
    readonly clinicianId: FieldRef<"FinanceTransaction", 'String'>
    readonly appointmentId: FieldRef<"FinanceTransaction", 'String'>
    readonly type: FieldRef<"FinanceTransaction", 'TransactionType'>
    readonly category: FieldRef<"FinanceTransaction", 'String'>
    readonly amount: FieldRef<"FinanceTransaction", 'Decimal'>
    readonly description: FieldRef<"FinanceTransaction", 'String'>
    readonly date: FieldRef<"FinanceTransaction", 'DateTime'>
    readonly createdAt: FieldRef<"FinanceTransaction", 'DateTime'>
    readonly updatedAt: FieldRef<"FinanceTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FinanceTransaction findUnique
   */
  export type FinanceTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter, which FinanceTransaction to fetch.
     */
    where: FinanceTransactionWhereUniqueInput
  }

  /**
   * FinanceTransaction findUniqueOrThrow
   */
  export type FinanceTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter, which FinanceTransaction to fetch.
     */
    where: FinanceTransactionWhereUniqueInput
  }

  /**
   * FinanceTransaction findFirst
   */
  export type FinanceTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter, which FinanceTransaction to fetch.
     */
    where?: FinanceTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinanceTransactions to fetch.
     */
    orderBy?: FinanceTransactionOrderByWithRelationInput | FinanceTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinanceTransactions.
     */
    cursor?: FinanceTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinanceTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinanceTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinanceTransactions.
     */
    distinct?: FinanceTransactionScalarFieldEnum | FinanceTransactionScalarFieldEnum[]
  }

  /**
   * FinanceTransaction findFirstOrThrow
   */
  export type FinanceTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter, which FinanceTransaction to fetch.
     */
    where?: FinanceTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinanceTransactions to fetch.
     */
    orderBy?: FinanceTransactionOrderByWithRelationInput | FinanceTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinanceTransactions.
     */
    cursor?: FinanceTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinanceTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinanceTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinanceTransactions.
     */
    distinct?: FinanceTransactionScalarFieldEnum | FinanceTransactionScalarFieldEnum[]
  }

  /**
   * FinanceTransaction findMany
   */
  export type FinanceTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter, which FinanceTransactions to fetch.
     */
    where?: FinanceTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinanceTransactions to fetch.
     */
    orderBy?: FinanceTransactionOrderByWithRelationInput | FinanceTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FinanceTransactions.
     */
    cursor?: FinanceTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinanceTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinanceTransactions.
     */
    skip?: number
    distinct?: FinanceTransactionScalarFieldEnum | FinanceTransactionScalarFieldEnum[]
  }

  /**
   * FinanceTransaction create
   */
  export type FinanceTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a FinanceTransaction.
     */
    data: XOR<FinanceTransactionCreateInput, FinanceTransactionUncheckedCreateInput>
  }

  /**
   * FinanceTransaction createMany
   */
  export type FinanceTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FinanceTransactions.
     */
    data: FinanceTransactionCreateManyInput | FinanceTransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FinanceTransaction createManyAndReturn
   */
  export type FinanceTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * The data used to create many FinanceTransactions.
     */
    data: FinanceTransactionCreateManyInput | FinanceTransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FinanceTransaction update
   */
  export type FinanceTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a FinanceTransaction.
     */
    data: XOR<FinanceTransactionUpdateInput, FinanceTransactionUncheckedUpdateInput>
    /**
     * Choose, which FinanceTransaction to update.
     */
    where: FinanceTransactionWhereUniqueInput
  }

  /**
   * FinanceTransaction updateMany
   */
  export type FinanceTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FinanceTransactions.
     */
    data: XOR<FinanceTransactionUpdateManyMutationInput, FinanceTransactionUncheckedUpdateManyInput>
    /**
     * Filter which FinanceTransactions to update
     */
    where?: FinanceTransactionWhereInput
    /**
     * Limit how many FinanceTransactions to update.
     */
    limit?: number
  }

  /**
   * FinanceTransaction updateManyAndReturn
   */
  export type FinanceTransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * The data used to update FinanceTransactions.
     */
    data: XOR<FinanceTransactionUpdateManyMutationInput, FinanceTransactionUncheckedUpdateManyInput>
    /**
     * Filter which FinanceTransactions to update
     */
    where?: FinanceTransactionWhereInput
    /**
     * Limit how many FinanceTransactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FinanceTransaction upsert
   */
  export type FinanceTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the FinanceTransaction to update in case it exists.
     */
    where: FinanceTransactionWhereUniqueInput
    /**
     * In case the FinanceTransaction found by the `where` argument doesn't exist, create a new FinanceTransaction with this data.
     */
    create: XOR<FinanceTransactionCreateInput, FinanceTransactionUncheckedCreateInput>
    /**
     * In case the FinanceTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FinanceTransactionUpdateInput, FinanceTransactionUncheckedUpdateInput>
  }

  /**
   * FinanceTransaction delete
   */
  export type FinanceTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
    /**
     * Filter which FinanceTransaction to delete.
     */
    where: FinanceTransactionWhereUniqueInput
  }

  /**
   * FinanceTransaction deleteMany
   */
  export type FinanceTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinanceTransactions to delete
     */
    where?: FinanceTransactionWhereInput
    /**
     * Limit how many FinanceTransactions to delete.
     */
    limit?: number
  }

  /**
   * FinanceTransaction.appointment
   */
  export type FinanceTransaction$appointmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Appointment
     */
    select?: AppointmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Appointment
     */
    omit?: AppointmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppointmentInclude<ExtArgs> | null
    where?: AppointmentWhereInput
  }

  /**
   * FinanceTransaction without action
   */
  export type FinanceTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinanceTransaction
     */
    select?: FinanceTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinanceTransaction
     */
    omit?: FinanceTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FinanceTransactionInclude<ExtArgs> | null
  }


  /**
   * Model Anthropometry
   */

  export type AggregateAnthropometry = {
    _count: AnthropometryCountAggregateOutputType | null
    _avg: AnthropometryAvgAggregateOutputType | null
    _sum: AnthropometrySumAggregateOutputType | null
    _min: AnthropometryMinAggregateOutputType | null
    _max: AnthropometryMaxAggregateOutputType | null
  }

  export type AnthropometryAvgAggregateOutputType = {
    weight: Decimal | null
    height: Decimal | null
    bodyFat: Decimal | null
    waist: Decimal | null
    hip: Decimal | null
  }

  export type AnthropometrySumAggregateOutputType = {
    weight: Decimal | null
    height: Decimal | null
    bodyFat: Decimal | null
    waist: Decimal | null
    hip: Decimal | null
  }

  export type AnthropometryMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    appointmentId: string | null
    weight: Decimal | null
    height: Decimal | null
    bodyFat: Decimal | null
    waist: Decimal | null
    hip: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnthropometryMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    appointmentId: string | null
    weight: Decimal | null
    height: Decimal | null
    bodyFat: Decimal | null
    waist: Decimal | null
    hip: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnthropometryCountAggregateOutputType = {
    id: number
    patientId: number
    appointmentId: number
    weight: number
    height: number
    bodyFat: number
    waist: number
    hip: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AnthropometryAvgAggregateInputType = {
    weight?: true
    height?: true
    bodyFat?: true
    waist?: true
    hip?: true
  }

  export type AnthropometrySumAggregateInputType = {
    weight?: true
    height?: true
    bodyFat?: true
    waist?: true
    hip?: true
  }

  export type AnthropometryMinAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    weight?: true
    height?: true
    bodyFat?: true
    waist?: true
    hip?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnthropometryMaxAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    weight?: true
    height?: true
    bodyFat?: true
    waist?: true
    hip?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnthropometryCountAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    weight?: true
    height?: true
    bodyFat?: true
    waist?: true
    hip?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AnthropometryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Anthropometry to aggregate.
     */
    where?: AnthropometryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anthropometries to fetch.
     */
    orderBy?: AnthropometryOrderByWithRelationInput | AnthropometryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnthropometryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anthropometries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anthropometries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Anthropometries
    **/
    _count?: true | AnthropometryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnthropometryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnthropometrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnthropometryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnthropometryMaxAggregateInputType
  }

  export type GetAnthropometryAggregateType<T extends AnthropometryAggregateArgs> = {
        [P in keyof T & keyof AggregateAnthropometry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnthropometry[P]>
      : GetScalarType<T[P], AggregateAnthropometry[P]>
  }




  export type AnthropometryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnthropometryWhereInput
    orderBy?: AnthropometryOrderByWithAggregationInput | AnthropometryOrderByWithAggregationInput[]
    by: AnthropometryScalarFieldEnum[] | AnthropometryScalarFieldEnum
    having?: AnthropometryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnthropometryCountAggregateInputType | true
    _avg?: AnthropometryAvgAggregateInputType
    _sum?: AnthropometrySumAggregateInputType
    _min?: AnthropometryMinAggregateInputType
    _max?: AnthropometryMaxAggregateInputType
  }

  export type AnthropometryGroupByOutputType = {
    id: string
    patientId: string
    appointmentId: string
    weight: Decimal
    height: Decimal
    bodyFat: Decimal | null
    waist: Decimal | null
    hip: Decimal | null
    createdAt: Date
    updatedAt: Date
    _count: AnthropometryCountAggregateOutputType | null
    _avg: AnthropometryAvgAggregateOutputType | null
    _sum: AnthropometrySumAggregateOutputType | null
    _min: AnthropometryMinAggregateOutputType | null
    _max: AnthropometryMaxAggregateOutputType | null
  }

  type GetAnthropometryGroupByPayload<T extends AnthropometryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnthropometryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnthropometryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnthropometryGroupByOutputType[P]>
            : GetScalarType<T[P], AnthropometryGroupByOutputType[P]>
        }
      >
    >


  export type AnthropometrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    weight?: boolean
    height?: boolean
    bodyFat?: boolean
    waist?: boolean
    hip?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["anthropometry"]>

  export type AnthropometrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    weight?: boolean
    height?: boolean
    bodyFat?: boolean
    waist?: boolean
    hip?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["anthropometry"]>

  export type AnthropometrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    weight?: boolean
    height?: boolean
    bodyFat?: boolean
    waist?: boolean
    hip?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["anthropometry"]>

  export type AnthropometrySelectScalar = {
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    weight?: boolean
    height?: boolean
    bodyFat?: boolean
    waist?: boolean
    hip?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AnthropometryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "appointmentId" | "weight" | "height" | "bodyFat" | "waist" | "hip" | "createdAt" | "updatedAt", ExtArgs["result"]["anthropometry"]>
  export type AnthropometryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }
  export type AnthropometryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }
  export type AnthropometryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }

  export type $AnthropometryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Anthropometry"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
      appointment: Prisma.$AppointmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      appointmentId: string
      weight: Prisma.Decimal
      height: Prisma.Decimal
      bodyFat: Prisma.Decimal | null
      waist: Prisma.Decimal | null
      hip: Prisma.Decimal | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["anthropometry"]>
    composites: {}
  }

  type AnthropometryGetPayload<S extends boolean | null | undefined | AnthropometryDefaultArgs> = $Result.GetResult<Prisma.$AnthropometryPayload, S>

  type AnthropometryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnthropometryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnthropometryCountAggregateInputType | true
    }

  export interface AnthropometryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Anthropometry'], meta: { name: 'Anthropometry' } }
    /**
     * Find zero or one Anthropometry that matches the filter.
     * @param {AnthropometryFindUniqueArgs} args - Arguments to find a Anthropometry
     * @example
     * // Get one Anthropometry
     * const anthropometry = await prisma.anthropometry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnthropometryFindUniqueArgs>(args: SelectSubset<T, AnthropometryFindUniqueArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Anthropometry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnthropometryFindUniqueOrThrowArgs} args - Arguments to find a Anthropometry
     * @example
     * // Get one Anthropometry
     * const anthropometry = await prisma.anthropometry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnthropometryFindUniqueOrThrowArgs>(args: SelectSubset<T, AnthropometryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Anthropometry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryFindFirstArgs} args - Arguments to find a Anthropometry
     * @example
     * // Get one Anthropometry
     * const anthropometry = await prisma.anthropometry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnthropometryFindFirstArgs>(args?: SelectSubset<T, AnthropometryFindFirstArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Anthropometry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryFindFirstOrThrowArgs} args - Arguments to find a Anthropometry
     * @example
     * // Get one Anthropometry
     * const anthropometry = await prisma.anthropometry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnthropometryFindFirstOrThrowArgs>(args?: SelectSubset<T, AnthropometryFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Anthropometries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Anthropometries
     * const anthropometries = await prisma.anthropometry.findMany()
     * 
     * // Get first 10 Anthropometries
     * const anthropometries = await prisma.anthropometry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const anthropometryWithIdOnly = await prisma.anthropometry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnthropometryFindManyArgs>(args?: SelectSubset<T, AnthropometryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Anthropometry.
     * @param {AnthropometryCreateArgs} args - Arguments to create a Anthropometry.
     * @example
     * // Create one Anthropometry
     * const Anthropometry = await prisma.anthropometry.create({
     *   data: {
     *     // ... data to create a Anthropometry
     *   }
     * })
     * 
     */
    create<T extends AnthropometryCreateArgs>(args: SelectSubset<T, AnthropometryCreateArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Anthropometries.
     * @param {AnthropometryCreateManyArgs} args - Arguments to create many Anthropometries.
     * @example
     * // Create many Anthropometries
     * const anthropometry = await prisma.anthropometry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnthropometryCreateManyArgs>(args?: SelectSubset<T, AnthropometryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Anthropometries and returns the data saved in the database.
     * @param {AnthropometryCreateManyAndReturnArgs} args - Arguments to create many Anthropometries.
     * @example
     * // Create many Anthropometries
     * const anthropometry = await prisma.anthropometry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Anthropometries and only return the `id`
     * const anthropometryWithIdOnly = await prisma.anthropometry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnthropometryCreateManyAndReturnArgs>(args?: SelectSubset<T, AnthropometryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Anthropometry.
     * @param {AnthropometryDeleteArgs} args - Arguments to delete one Anthropometry.
     * @example
     * // Delete one Anthropometry
     * const Anthropometry = await prisma.anthropometry.delete({
     *   where: {
     *     // ... filter to delete one Anthropometry
     *   }
     * })
     * 
     */
    delete<T extends AnthropometryDeleteArgs>(args: SelectSubset<T, AnthropometryDeleteArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Anthropometry.
     * @param {AnthropometryUpdateArgs} args - Arguments to update one Anthropometry.
     * @example
     * // Update one Anthropometry
     * const anthropometry = await prisma.anthropometry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnthropometryUpdateArgs>(args: SelectSubset<T, AnthropometryUpdateArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Anthropometries.
     * @param {AnthropometryDeleteManyArgs} args - Arguments to filter Anthropometries to delete.
     * @example
     * // Delete a few Anthropometries
     * const { count } = await prisma.anthropometry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnthropometryDeleteManyArgs>(args?: SelectSubset<T, AnthropometryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Anthropometries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Anthropometries
     * const anthropometry = await prisma.anthropometry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnthropometryUpdateManyArgs>(args: SelectSubset<T, AnthropometryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Anthropometries and returns the data updated in the database.
     * @param {AnthropometryUpdateManyAndReturnArgs} args - Arguments to update many Anthropometries.
     * @example
     * // Update many Anthropometries
     * const anthropometry = await prisma.anthropometry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Anthropometries and only return the `id`
     * const anthropometryWithIdOnly = await prisma.anthropometry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnthropometryUpdateManyAndReturnArgs>(args: SelectSubset<T, AnthropometryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Anthropometry.
     * @param {AnthropometryUpsertArgs} args - Arguments to update or create a Anthropometry.
     * @example
     * // Update or create a Anthropometry
     * const anthropometry = await prisma.anthropometry.upsert({
     *   create: {
     *     // ... data to create a Anthropometry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Anthropometry we want to update
     *   }
     * })
     */
    upsert<T extends AnthropometryUpsertArgs>(args: SelectSubset<T, AnthropometryUpsertArgs<ExtArgs>>): Prisma__AnthropometryClient<$Result.GetResult<Prisma.$AnthropometryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Anthropometries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryCountArgs} args - Arguments to filter Anthropometries to count.
     * @example
     * // Count the number of Anthropometries
     * const count = await prisma.anthropometry.count({
     *   where: {
     *     // ... the filter for the Anthropometries we want to count
     *   }
     * })
    **/
    count<T extends AnthropometryCountArgs>(
      args?: Subset<T, AnthropometryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnthropometryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Anthropometry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnthropometryAggregateArgs>(args: Subset<T, AnthropometryAggregateArgs>): Prisma.PrismaPromise<GetAnthropometryAggregateType<T>>

    /**
     * Group by Anthropometry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnthropometryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnthropometryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnthropometryGroupByArgs['orderBy'] }
        : { orderBy?: AnthropometryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnthropometryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnthropometryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Anthropometry model
   */
  readonly fields: AnthropometryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Anthropometry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnthropometryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    appointment<T extends AppointmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AppointmentDefaultArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Anthropometry model
   */
  interface AnthropometryFieldRefs {
    readonly id: FieldRef<"Anthropometry", 'String'>
    readonly patientId: FieldRef<"Anthropometry", 'String'>
    readonly appointmentId: FieldRef<"Anthropometry", 'String'>
    readonly weight: FieldRef<"Anthropometry", 'Decimal'>
    readonly height: FieldRef<"Anthropometry", 'Decimal'>
    readonly bodyFat: FieldRef<"Anthropometry", 'Decimal'>
    readonly waist: FieldRef<"Anthropometry", 'Decimal'>
    readonly hip: FieldRef<"Anthropometry", 'Decimal'>
    readonly createdAt: FieldRef<"Anthropometry", 'DateTime'>
    readonly updatedAt: FieldRef<"Anthropometry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Anthropometry findUnique
   */
  export type AnthropometryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter, which Anthropometry to fetch.
     */
    where: AnthropometryWhereUniqueInput
  }

  /**
   * Anthropometry findUniqueOrThrow
   */
  export type AnthropometryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter, which Anthropometry to fetch.
     */
    where: AnthropometryWhereUniqueInput
  }

  /**
   * Anthropometry findFirst
   */
  export type AnthropometryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter, which Anthropometry to fetch.
     */
    where?: AnthropometryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anthropometries to fetch.
     */
    orderBy?: AnthropometryOrderByWithRelationInput | AnthropometryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Anthropometries.
     */
    cursor?: AnthropometryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anthropometries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anthropometries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Anthropometries.
     */
    distinct?: AnthropometryScalarFieldEnum | AnthropometryScalarFieldEnum[]
  }

  /**
   * Anthropometry findFirstOrThrow
   */
  export type AnthropometryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter, which Anthropometry to fetch.
     */
    where?: AnthropometryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anthropometries to fetch.
     */
    orderBy?: AnthropometryOrderByWithRelationInput | AnthropometryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Anthropometries.
     */
    cursor?: AnthropometryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anthropometries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anthropometries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Anthropometries.
     */
    distinct?: AnthropometryScalarFieldEnum | AnthropometryScalarFieldEnum[]
  }

  /**
   * Anthropometry findMany
   */
  export type AnthropometryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter, which Anthropometries to fetch.
     */
    where?: AnthropometryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anthropometries to fetch.
     */
    orderBy?: AnthropometryOrderByWithRelationInput | AnthropometryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Anthropometries.
     */
    cursor?: AnthropometryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anthropometries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anthropometries.
     */
    skip?: number
    distinct?: AnthropometryScalarFieldEnum | AnthropometryScalarFieldEnum[]
  }

  /**
   * Anthropometry create
   */
  export type AnthropometryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * The data needed to create a Anthropometry.
     */
    data: XOR<AnthropometryCreateInput, AnthropometryUncheckedCreateInput>
  }

  /**
   * Anthropometry createMany
   */
  export type AnthropometryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Anthropometries.
     */
    data: AnthropometryCreateManyInput | AnthropometryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Anthropometry createManyAndReturn
   */
  export type AnthropometryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * The data used to create many Anthropometries.
     */
    data: AnthropometryCreateManyInput | AnthropometryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Anthropometry update
   */
  export type AnthropometryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * The data needed to update a Anthropometry.
     */
    data: XOR<AnthropometryUpdateInput, AnthropometryUncheckedUpdateInput>
    /**
     * Choose, which Anthropometry to update.
     */
    where: AnthropometryWhereUniqueInput
  }

  /**
   * Anthropometry updateMany
   */
  export type AnthropometryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Anthropometries.
     */
    data: XOR<AnthropometryUpdateManyMutationInput, AnthropometryUncheckedUpdateManyInput>
    /**
     * Filter which Anthropometries to update
     */
    where?: AnthropometryWhereInput
    /**
     * Limit how many Anthropometries to update.
     */
    limit?: number
  }

  /**
   * Anthropometry updateManyAndReturn
   */
  export type AnthropometryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * The data used to update Anthropometries.
     */
    data: XOR<AnthropometryUpdateManyMutationInput, AnthropometryUncheckedUpdateManyInput>
    /**
     * Filter which Anthropometries to update
     */
    where?: AnthropometryWhereInput
    /**
     * Limit how many Anthropometries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Anthropometry upsert
   */
  export type AnthropometryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * The filter to search for the Anthropometry to update in case it exists.
     */
    where: AnthropometryWhereUniqueInput
    /**
     * In case the Anthropometry found by the `where` argument doesn't exist, create a new Anthropometry with this data.
     */
    create: XOR<AnthropometryCreateInput, AnthropometryUncheckedCreateInput>
    /**
     * In case the Anthropometry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnthropometryUpdateInput, AnthropometryUncheckedUpdateInput>
  }

  /**
   * Anthropometry delete
   */
  export type AnthropometryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
    /**
     * Filter which Anthropometry to delete.
     */
    where: AnthropometryWhereUniqueInput
  }

  /**
   * Anthropometry deleteMany
   */
  export type AnthropometryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Anthropometries to delete
     */
    where?: AnthropometryWhereInput
    /**
     * Limit how many Anthropometries to delete.
     */
    limit?: number
  }

  /**
   * Anthropometry without action
   */
  export type AnthropometryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anthropometry
     */
    select?: AnthropometrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anthropometry
     */
    omit?: AnthropometryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnthropometryInclude<ExtArgs> | null
  }


  /**
   * Model MealPlan
   */

  export type AggregateMealPlan = {
    _count: MealPlanCountAggregateOutputType | null
    _min: MealPlanMinAggregateOutputType | null
    _max: MealPlanMaxAggregateOutputType | null
  }

  export type MealPlanMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    appointmentId: string | null
    content: string | null
    fileUrl: string | null
    fileName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MealPlanMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    appointmentId: string | null
    content: string | null
    fileUrl: string | null
    fileName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MealPlanCountAggregateOutputType = {
    id: number
    patientId: number
    appointmentId: number
    content: number
    fileUrl: number
    fileName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MealPlanMinAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    content?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MealPlanMaxAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    content?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MealPlanCountAggregateInputType = {
    id?: true
    patientId?: true
    appointmentId?: true
    content?: true
    fileUrl?: true
    fileName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MealPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MealPlan to aggregate.
     */
    where?: MealPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealPlans to fetch.
     */
    orderBy?: MealPlanOrderByWithRelationInput | MealPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MealPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MealPlans
    **/
    _count?: true | MealPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MealPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MealPlanMaxAggregateInputType
  }

  export type GetMealPlanAggregateType<T extends MealPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateMealPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMealPlan[P]>
      : GetScalarType<T[P], AggregateMealPlan[P]>
  }




  export type MealPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MealPlanWhereInput
    orderBy?: MealPlanOrderByWithAggregationInput | MealPlanOrderByWithAggregationInput[]
    by: MealPlanScalarFieldEnum[] | MealPlanScalarFieldEnum
    having?: MealPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MealPlanCountAggregateInputType | true
    _min?: MealPlanMinAggregateInputType
    _max?: MealPlanMaxAggregateInputType
  }

  export type MealPlanGroupByOutputType = {
    id: string
    patientId: string
    appointmentId: string
    content: string | null
    fileUrl: string | null
    fileName: string | null
    createdAt: Date
    updatedAt: Date
    _count: MealPlanCountAggregateOutputType | null
    _min: MealPlanMinAggregateOutputType | null
    _max: MealPlanMaxAggregateOutputType | null
  }

  type GetMealPlanGroupByPayload<T extends MealPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MealPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MealPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MealPlanGroupByOutputType[P]>
            : GetScalarType<T[P], MealPlanGroupByOutputType[P]>
        }
      >
    >


  export type MealPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    content?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealPlan"]>

  export type MealPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    content?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealPlan"]>

  export type MealPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    content?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mealPlan"]>

  export type MealPlanSelectScalar = {
    id?: boolean
    patientId?: boolean
    appointmentId?: boolean
    content?: boolean
    fileUrl?: boolean
    fileName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MealPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "appointmentId" | "content" | "fileUrl" | "fileName" | "createdAt" | "updatedAt", ExtArgs["result"]["mealPlan"]>
  export type MealPlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }
  export type MealPlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }
  export type MealPlanIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    appointment?: boolean | AppointmentDefaultArgs<ExtArgs>
  }

  export type $MealPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MealPlan"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
      appointment: Prisma.$AppointmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      appointmentId: string
      content: string | null
      fileUrl: string | null
      fileName: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["mealPlan"]>
    composites: {}
  }

  type MealPlanGetPayload<S extends boolean | null | undefined | MealPlanDefaultArgs> = $Result.GetResult<Prisma.$MealPlanPayload, S>

  type MealPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MealPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MealPlanCountAggregateInputType | true
    }

  export interface MealPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MealPlan'], meta: { name: 'MealPlan' } }
    /**
     * Find zero or one MealPlan that matches the filter.
     * @param {MealPlanFindUniqueArgs} args - Arguments to find a MealPlan
     * @example
     * // Get one MealPlan
     * const mealPlan = await prisma.mealPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MealPlanFindUniqueArgs>(args: SelectSubset<T, MealPlanFindUniqueArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MealPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MealPlanFindUniqueOrThrowArgs} args - Arguments to find a MealPlan
     * @example
     * // Get one MealPlan
     * const mealPlan = await prisma.mealPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MealPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, MealPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MealPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanFindFirstArgs} args - Arguments to find a MealPlan
     * @example
     * // Get one MealPlan
     * const mealPlan = await prisma.mealPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MealPlanFindFirstArgs>(args?: SelectSubset<T, MealPlanFindFirstArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MealPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanFindFirstOrThrowArgs} args - Arguments to find a MealPlan
     * @example
     * // Get one MealPlan
     * const mealPlan = await prisma.mealPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MealPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, MealPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MealPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MealPlans
     * const mealPlans = await prisma.mealPlan.findMany()
     * 
     * // Get first 10 MealPlans
     * const mealPlans = await prisma.mealPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mealPlanWithIdOnly = await prisma.mealPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MealPlanFindManyArgs>(args?: SelectSubset<T, MealPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MealPlan.
     * @param {MealPlanCreateArgs} args - Arguments to create a MealPlan.
     * @example
     * // Create one MealPlan
     * const MealPlan = await prisma.mealPlan.create({
     *   data: {
     *     // ... data to create a MealPlan
     *   }
     * })
     * 
     */
    create<T extends MealPlanCreateArgs>(args: SelectSubset<T, MealPlanCreateArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MealPlans.
     * @param {MealPlanCreateManyArgs} args - Arguments to create many MealPlans.
     * @example
     * // Create many MealPlans
     * const mealPlan = await prisma.mealPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MealPlanCreateManyArgs>(args?: SelectSubset<T, MealPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MealPlans and returns the data saved in the database.
     * @param {MealPlanCreateManyAndReturnArgs} args - Arguments to create many MealPlans.
     * @example
     * // Create many MealPlans
     * const mealPlan = await prisma.mealPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MealPlans and only return the `id`
     * const mealPlanWithIdOnly = await prisma.mealPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MealPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, MealPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MealPlan.
     * @param {MealPlanDeleteArgs} args - Arguments to delete one MealPlan.
     * @example
     * // Delete one MealPlan
     * const MealPlan = await prisma.mealPlan.delete({
     *   where: {
     *     // ... filter to delete one MealPlan
     *   }
     * })
     * 
     */
    delete<T extends MealPlanDeleteArgs>(args: SelectSubset<T, MealPlanDeleteArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MealPlan.
     * @param {MealPlanUpdateArgs} args - Arguments to update one MealPlan.
     * @example
     * // Update one MealPlan
     * const mealPlan = await prisma.mealPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MealPlanUpdateArgs>(args: SelectSubset<T, MealPlanUpdateArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MealPlans.
     * @param {MealPlanDeleteManyArgs} args - Arguments to filter MealPlans to delete.
     * @example
     * // Delete a few MealPlans
     * const { count } = await prisma.mealPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MealPlanDeleteManyArgs>(args?: SelectSubset<T, MealPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MealPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MealPlans
     * const mealPlan = await prisma.mealPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MealPlanUpdateManyArgs>(args: SelectSubset<T, MealPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MealPlans and returns the data updated in the database.
     * @param {MealPlanUpdateManyAndReturnArgs} args - Arguments to update many MealPlans.
     * @example
     * // Update many MealPlans
     * const mealPlan = await prisma.mealPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MealPlans and only return the `id`
     * const mealPlanWithIdOnly = await prisma.mealPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MealPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, MealPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MealPlan.
     * @param {MealPlanUpsertArgs} args - Arguments to update or create a MealPlan.
     * @example
     * // Update or create a MealPlan
     * const mealPlan = await prisma.mealPlan.upsert({
     *   create: {
     *     // ... data to create a MealPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MealPlan we want to update
     *   }
     * })
     */
    upsert<T extends MealPlanUpsertArgs>(args: SelectSubset<T, MealPlanUpsertArgs<ExtArgs>>): Prisma__MealPlanClient<$Result.GetResult<Prisma.$MealPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MealPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanCountArgs} args - Arguments to filter MealPlans to count.
     * @example
     * // Count the number of MealPlans
     * const count = await prisma.mealPlan.count({
     *   where: {
     *     // ... the filter for the MealPlans we want to count
     *   }
     * })
    **/
    count<T extends MealPlanCountArgs>(
      args?: Subset<T, MealPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MealPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MealPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MealPlanAggregateArgs>(args: Subset<T, MealPlanAggregateArgs>): Prisma.PrismaPromise<GetMealPlanAggregateType<T>>

    /**
     * Group by MealPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MealPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MealPlanGroupByArgs['orderBy'] }
        : { orderBy?: MealPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MealPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMealPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MealPlan model
   */
  readonly fields: MealPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MealPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MealPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    appointment<T extends AppointmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AppointmentDefaultArgs<ExtArgs>>): Prisma__AppointmentClient<$Result.GetResult<Prisma.$AppointmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MealPlan model
   */
  interface MealPlanFieldRefs {
    readonly id: FieldRef<"MealPlan", 'String'>
    readonly patientId: FieldRef<"MealPlan", 'String'>
    readonly appointmentId: FieldRef<"MealPlan", 'String'>
    readonly content: FieldRef<"MealPlan", 'String'>
    readonly fileUrl: FieldRef<"MealPlan", 'String'>
    readonly fileName: FieldRef<"MealPlan", 'String'>
    readonly createdAt: FieldRef<"MealPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"MealPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MealPlan findUnique
   */
  export type MealPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter, which MealPlan to fetch.
     */
    where: MealPlanWhereUniqueInput
  }

  /**
   * MealPlan findUniqueOrThrow
   */
  export type MealPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter, which MealPlan to fetch.
     */
    where: MealPlanWhereUniqueInput
  }

  /**
   * MealPlan findFirst
   */
  export type MealPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter, which MealPlan to fetch.
     */
    where?: MealPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealPlans to fetch.
     */
    orderBy?: MealPlanOrderByWithRelationInput | MealPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MealPlans.
     */
    cursor?: MealPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MealPlans.
     */
    distinct?: MealPlanScalarFieldEnum | MealPlanScalarFieldEnum[]
  }

  /**
   * MealPlan findFirstOrThrow
   */
  export type MealPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter, which MealPlan to fetch.
     */
    where?: MealPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealPlans to fetch.
     */
    orderBy?: MealPlanOrderByWithRelationInput | MealPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MealPlans.
     */
    cursor?: MealPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MealPlans.
     */
    distinct?: MealPlanScalarFieldEnum | MealPlanScalarFieldEnum[]
  }

  /**
   * MealPlan findMany
   */
  export type MealPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter, which MealPlans to fetch.
     */
    where?: MealPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MealPlans to fetch.
     */
    orderBy?: MealPlanOrderByWithRelationInput | MealPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MealPlans.
     */
    cursor?: MealPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MealPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MealPlans.
     */
    skip?: number
    distinct?: MealPlanScalarFieldEnum | MealPlanScalarFieldEnum[]
  }

  /**
   * MealPlan create
   */
  export type MealPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * The data needed to create a MealPlan.
     */
    data: XOR<MealPlanCreateInput, MealPlanUncheckedCreateInput>
  }

  /**
   * MealPlan createMany
   */
  export type MealPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MealPlans.
     */
    data: MealPlanCreateManyInput | MealPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MealPlan createManyAndReturn
   */
  export type MealPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * The data used to create many MealPlans.
     */
    data: MealPlanCreateManyInput | MealPlanCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MealPlan update
   */
  export type MealPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * The data needed to update a MealPlan.
     */
    data: XOR<MealPlanUpdateInput, MealPlanUncheckedUpdateInput>
    /**
     * Choose, which MealPlan to update.
     */
    where: MealPlanWhereUniqueInput
  }

  /**
   * MealPlan updateMany
   */
  export type MealPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MealPlans.
     */
    data: XOR<MealPlanUpdateManyMutationInput, MealPlanUncheckedUpdateManyInput>
    /**
     * Filter which MealPlans to update
     */
    where?: MealPlanWhereInput
    /**
     * Limit how many MealPlans to update.
     */
    limit?: number
  }

  /**
   * MealPlan updateManyAndReturn
   */
  export type MealPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * The data used to update MealPlans.
     */
    data: XOR<MealPlanUpdateManyMutationInput, MealPlanUncheckedUpdateManyInput>
    /**
     * Filter which MealPlans to update
     */
    where?: MealPlanWhereInput
    /**
     * Limit how many MealPlans to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MealPlan upsert
   */
  export type MealPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * The filter to search for the MealPlan to update in case it exists.
     */
    where: MealPlanWhereUniqueInput
    /**
     * In case the MealPlan found by the `where` argument doesn't exist, create a new MealPlan with this data.
     */
    create: XOR<MealPlanCreateInput, MealPlanUncheckedCreateInput>
    /**
     * In case the MealPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MealPlanUpdateInput, MealPlanUncheckedUpdateInput>
  }

  /**
   * MealPlan delete
   */
  export type MealPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
    /**
     * Filter which MealPlan to delete.
     */
    where: MealPlanWhereUniqueInput
  }

  /**
   * MealPlan deleteMany
   */
  export type MealPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MealPlans to delete
     */
    where?: MealPlanWhereInput
    /**
     * Limit how many MealPlans to delete.
     */
    limit?: number
  }

  /**
   * MealPlan without action
   */
  export type MealPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealPlan
     */
    select?: MealPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MealPlan
     */
    omit?: MealPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MealPlanInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ClinicianProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    licenseNumber: 'licenseNumber',
    currency: 'currency',
    sessionDefaultDuration: 'sessionDefaultDuration',
    sessionDefaultPrice: 'sessionDefaultPrice',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ClinicianProfileScalarFieldEnum = (typeof ClinicianProfileScalarFieldEnum)[keyof typeof ClinicianProfileScalarFieldEnum]


  export const PatientScalarFieldEnum: {
    id: 'id',
    clinicianId: 'clinicianId',
    fullName: 'fullName',
    dateOfBirth: 'dateOfBirth',
    diagnosis: 'diagnosis',
    clinicalContext: 'clinicalContext',
    status: 'status',
    contactPhone: 'contactPhone',
    emergencyContact: 'emergencyContact',
    treatmentGoals: 'treatmentGoals',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PatientScalarFieldEnum = (typeof PatientScalarFieldEnum)[keyof typeof PatientScalarFieldEnum]


  export const AppointmentScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    clinicianId: 'clinicianId',
    startTime: 'startTime',
    endTime: 'endTime',
    type: 'type',
    reason: 'reason',
    status: 'status',
    paymentStatus: 'paymentStatus',
    paymentMethod: 'paymentMethod',
    price: 'price',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AppointmentScalarFieldEnum = (typeof AppointmentScalarFieldEnum)[keyof typeof AppointmentScalarFieldEnum]


  export const PsychNoteScalarFieldEnum: {
    id: 'id',
    appointmentId: 'appointmentId',
    patientId: 'patientId',
    templateType: 'templateType',
    content: 'content',
    moodRating: 'moodRating',
    privateNotes: 'privateNotes',
    isPinned: 'isPinned',
    tags: 'tags',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PsychNoteScalarFieldEnum = (typeof PsychNoteScalarFieldEnum)[keyof typeof PsychNoteScalarFieldEnum]


  export const TaskScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    description: 'description',
    isCompleted: 'isCompleted',
    dueDate: 'dueDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum]


  export const AccessLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    patientId: 'patientId',
    action: 'action',
    resource: 'resource',
    details: 'details',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt'
  };

  export type AccessLogScalarFieldEnum = (typeof AccessLogScalarFieldEnum)[keyof typeof AccessLogScalarFieldEnum]


  export const FinanceTransactionScalarFieldEnum: {
    id: 'id',
    clinicianId: 'clinicianId',
    appointmentId: 'appointmentId',
    type: 'type',
    category: 'category',
    amount: 'amount',
    description: 'description',
    date: 'date',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FinanceTransactionScalarFieldEnum = (typeof FinanceTransactionScalarFieldEnum)[keyof typeof FinanceTransactionScalarFieldEnum]


  export const AnthropometryScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    appointmentId: 'appointmentId',
    weight: 'weight',
    height: 'height',
    bodyFat: 'bodyFat',
    waist: 'waist',
    hip: 'hip',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AnthropometryScalarFieldEnum = (typeof AnthropometryScalarFieldEnum)[keyof typeof AnthropometryScalarFieldEnum]


  export const MealPlanScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    appointmentId: 'appointmentId',
    content: 'content',
    fileUrl: 'fileUrl',
    fileName: 'fileName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MealPlanScalarFieldEnum = (typeof MealPlanScalarFieldEnum)[keyof typeof MealPlanScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ClinicianType'
   */
  export type EnumClinicianTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClinicianType'>
    


  /**
   * Reference to a field of type 'ClinicianType[]'
   */
  export type ListEnumClinicianTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClinicianType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'PatientStatus'
   */
  export type EnumPatientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PatientStatus'>
    


  /**
   * Reference to a field of type 'PatientStatus[]'
   */
  export type ListEnumPatientStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PatientStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'AppointmentType'
   */
  export type EnumAppointmentTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentType'>
    


  /**
   * Reference to a field of type 'AppointmentType[]'
   */
  export type ListEnumAppointmentTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentType[]'>
    


  /**
   * Reference to a field of type 'AppointmentStatus'
   */
  export type EnumAppointmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentStatus'>
    


  /**
   * Reference to a field of type 'AppointmentStatus[]'
   */
  export type ListEnumAppointmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AppointmentStatus[]'>
    


  /**
   * Reference to a field of type 'PaymentStatus'
   */
  export type EnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus'>
    


  /**
   * Reference to a field of type 'PaymentStatus[]'
   */
  export type ListEnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus[]'>
    


  /**
   * Reference to a field of type 'PaymentMethod'
   */
  export type EnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod'>
    


  /**
   * Reference to a field of type 'PaymentMethod[]'
   */
  export type ListEnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod[]'>
    


  /**
   * Reference to a field of type 'NoteTemplateType'
   */
  export type EnumNoteTemplateTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NoteTemplateType'>
    


  /**
   * Reference to a field of type 'NoteTemplateType[]'
   */
  export type ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NoteTemplateType[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'TransactionType'
   */
  export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>
    


  /**
   * Reference to a field of type 'TransactionType[]'
   */
  export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    profile?: XOR<ClinicianProfileNullableScalarRelationFilter, ClinicianProfileWhereInput> | null
    accessLogs?: AccessLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    profile?: ClinicianProfileOrderByWithRelationInput
    accessLogs?: AccessLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    profile?: XOR<ClinicianProfileNullableScalarRelationFilter, ClinicianProfileWhereInput> | null
    accessLogs?: AccessLogListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ClinicianProfileWhereInput = {
    AND?: ClinicianProfileWhereInput | ClinicianProfileWhereInput[]
    OR?: ClinicianProfileWhereInput[]
    NOT?: ClinicianProfileWhereInput | ClinicianProfileWhereInput[]
    id?: UuidFilter<"ClinicianProfile"> | string
    userId?: UuidFilter<"ClinicianProfile"> | string
    type?: EnumClinicianTypeFilter<"ClinicianProfile"> | $Enums.ClinicianType
    licenseNumber?: StringNullableFilter<"ClinicianProfile"> | string | null
    currency?: StringFilter<"ClinicianProfile"> | string
    sessionDefaultDuration?: IntFilter<"ClinicianProfile"> | number
    sessionDefaultPrice?: DecimalFilter<"ClinicianProfile"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ClinicianProfile"> | Date | string
    updatedAt?: DateTimeFilter<"ClinicianProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    patients?: PatientListRelationFilter
    appointments?: AppointmentListRelationFilter
    transactions?: FinanceTransactionListRelationFilter
  }

  export type ClinicianProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    licenseNumber?: SortOrderInput | SortOrder
    currency?: SortOrder
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    patients?: PatientOrderByRelationAggregateInput
    appointments?: AppointmentOrderByRelationAggregateInput
    transactions?: FinanceTransactionOrderByRelationAggregateInput
  }

  export type ClinicianProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: ClinicianProfileWhereInput | ClinicianProfileWhereInput[]
    OR?: ClinicianProfileWhereInput[]
    NOT?: ClinicianProfileWhereInput | ClinicianProfileWhereInput[]
    type?: EnumClinicianTypeFilter<"ClinicianProfile"> | $Enums.ClinicianType
    licenseNumber?: StringNullableFilter<"ClinicianProfile"> | string | null
    currency?: StringFilter<"ClinicianProfile"> | string
    sessionDefaultDuration?: IntFilter<"ClinicianProfile"> | number
    sessionDefaultPrice?: DecimalFilter<"ClinicianProfile"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ClinicianProfile"> | Date | string
    updatedAt?: DateTimeFilter<"ClinicianProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    patients?: PatientListRelationFilter
    appointments?: AppointmentListRelationFilter
    transactions?: FinanceTransactionListRelationFilter
  }, "id" | "userId">

  export type ClinicianProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    licenseNumber?: SortOrderInput | SortOrder
    currency?: SortOrder
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClinicianProfileCountOrderByAggregateInput
    _avg?: ClinicianProfileAvgOrderByAggregateInput
    _max?: ClinicianProfileMaxOrderByAggregateInput
    _min?: ClinicianProfileMinOrderByAggregateInput
    _sum?: ClinicianProfileSumOrderByAggregateInput
  }

  export type ClinicianProfileScalarWhereWithAggregatesInput = {
    AND?: ClinicianProfileScalarWhereWithAggregatesInput | ClinicianProfileScalarWhereWithAggregatesInput[]
    OR?: ClinicianProfileScalarWhereWithAggregatesInput[]
    NOT?: ClinicianProfileScalarWhereWithAggregatesInput | ClinicianProfileScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ClinicianProfile"> | string
    userId?: UuidWithAggregatesFilter<"ClinicianProfile"> | string
    type?: EnumClinicianTypeWithAggregatesFilter<"ClinicianProfile"> | $Enums.ClinicianType
    licenseNumber?: StringNullableWithAggregatesFilter<"ClinicianProfile"> | string | null
    currency?: StringWithAggregatesFilter<"ClinicianProfile"> | string
    sessionDefaultDuration?: IntWithAggregatesFilter<"ClinicianProfile"> | number
    sessionDefaultPrice?: DecimalWithAggregatesFilter<"ClinicianProfile"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"ClinicianProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ClinicianProfile"> | Date | string
  }

  export type PatientWhereInput = {
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    id?: UuidFilter<"Patient"> | string
    clinicianId?: UuidFilter<"Patient"> | string
    fullName?: StringFilter<"Patient"> | string
    dateOfBirth?: DateTimeNullableFilter<"Patient"> | Date | string | null
    diagnosis?: StringNullableFilter<"Patient"> | string | null
    clinicalContext?: StringNullableFilter<"Patient"> | string | null
    status?: EnumPatientStatusFilter<"Patient"> | $Enums.PatientStatus
    contactPhone?: StringNullableFilter<"Patient"> | string | null
    emergencyContact?: JsonNullableFilter<"Patient">
    treatmentGoals?: StringNullableListFilter<"Patient">
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    updatedAt?: DateTimeFilter<"Patient"> | Date | string
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    appointments?: AppointmentListRelationFilter
    psychNotes?: PsychNoteListRelationFilter
    accessLogs?: AccessLogListRelationFilter
    tasks?: TaskListRelationFilter
    anthropometries?: AnthropometryListRelationFilter
    mealPlans?: MealPlanListRelationFilter
  }

  export type PatientOrderByWithRelationInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    diagnosis?: SortOrderInput | SortOrder
    clinicalContext?: SortOrderInput | SortOrder
    status?: SortOrder
    contactPhone?: SortOrderInput | SortOrder
    emergencyContact?: SortOrderInput | SortOrder
    treatmentGoals?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinician?: ClinicianProfileOrderByWithRelationInput
    appointments?: AppointmentOrderByRelationAggregateInput
    psychNotes?: PsychNoteOrderByRelationAggregateInput
    accessLogs?: AccessLogOrderByRelationAggregateInput
    tasks?: TaskOrderByRelationAggregateInput
    anthropometries?: AnthropometryOrderByRelationAggregateInput
    mealPlans?: MealPlanOrderByRelationAggregateInput
  }

  export type PatientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    clinicianId?: UuidFilter<"Patient"> | string
    fullName?: StringFilter<"Patient"> | string
    dateOfBirth?: DateTimeNullableFilter<"Patient"> | Date | string | null
    diagnosis?: StringNullableFilter<"Patient"> | string | null
    clinicalContext?: StringNullableFilter<"Patient"> | string | null
    status?: EnumPatientStatusFilter<"Patient"> | $Enums.PatientStatus
    contactPhone?: StringNullableFilter<"Patient"> | string | null
    emergencyContact?: JsonNullableFilter<"Patient">
    treatmentGoals?: StringNullableListFilter<"Patient">
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    updatedAt?: DateTimeFilter<"Patient"> | Date | string
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    appointments?: AppointmentListRelationFilter
    psychNotes?: PsychNoteListRelationFilter
    accessLogs?: AccessLogListRelationFilter
    tasks?: TaskListRelationFilter
    anthropometries?: AnthropometryListRelationFilter
    mealPlans?: MealPlanListRelationFilter
  }, "id">

  export type PatientOrderByWithAggregationInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrderInput | SortOrder
    diagnosis?: SortOrderInput | SortOrder
    clinicalContext?: SortOrderInput | SortOrder
    status?: SortOrder
    contactPhone?: SortOrderInput | SortOrder
    emergencyContact?: SortOrderInput | SortOrder
    treatmentGoals?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PatientCountOrderByAggregateInput
    _max?: PatientMaxOrderByAggregateInput
    _min?: PatientMinOrderByAggregateInput
  }

  export type PatientScalarWhereWithAggregatesInput = {
    AND?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    OR?: PatientScalarWhereWithAggregatesInput[]
    NOT?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Patient"> | string
    clinicianId?: UuidWithAggregatesFilter<"Patient"> | string
    fullName?: StringWithAggregatesFilter<"Patient"> | string
    dateOfBirth?: DateTimeNullableWithAggregatesFilter<"Patient"> | Date | string | null
    diagnosis?: StringNullableWithAggregatesFilter<"Patient"> | string | null
    clinicalContext?: StringNullableWithAggregatesFilter<"Patient"> | string | null
    status?: EnumPatientStatusWithAggregatesFilter<"Patient"> | $Enums.PatientStatus
    contactPhone?: StringNullableWithAggregatesFilter<"Patient"> | string | null
    emergencyContact?: JsonNullableWithAggregatesFilter<"Patient">
    treatmentGoals?: StringNullableListFilter<"Patient">
    createdAt?: DateTimeWithAggregatesFilter<"Patient"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Patient"> | Date | string
  }

  export type AppointmentWhereInput = {
    AND?: AppointmentWhereInput | AppointmentWhereInput[]
    OR?: AppointmentWhereInput[]
    NOT?: AppointmentWhereInput | AppointmentWhereInput[]
    id?: UuidFilter<"Appointment"> | string
    patientId?: UuidFilter<"Appointment"> | string
    clinicianId?: UuidFilter<"Appointment"> | string
    startTime?: DateTimeFilter<"Appointment"> | Date | string
    endTime?: DateTimeFilter<"Appointment"> | Date | string
    type?: EnumAppointmentTypeFilter<"Appointment"> | $Enums.AppointmentType
    reason?: StringNullableFilter<"Appointment"> | string | null
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFilter<"Appointment"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableFilter<"Appointment"> | $Enums.PaymentMethod | null
    price?: DecimalFilter<"Appointment"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
    updatedAt?: DateTimeFilter<"Appointment"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    psychNote?: XOR<PsychNoteNullableScalarRelationFilter, PsychNoteWhereInput> | null
    transaction?: XOR<FinanceTransactionNullableScalarRelationFilter, FinanceTransactionWhereInput> | null
    anthropometry?: XOR<AnthropometryNullableScalarRelationFilter, AnthropometryWhereInput> | null
    mealPlan?: XOR<MealPlanNullableScalarRelationFilter, MealPlanWhereInput> | null
  }

  export type AppointmentOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    clinicianId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    type?: SortOrder
    reason?: SortOrderInput | SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    price?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    patient?: PatientOrderByWithRelationInput
    clinician?: ClinicianProfileOrderByWithRelationInput
    psychNote?: PsychNoteOrderByWithRelationInput
    transaction?: FinanceTransactionOrderByWithRelationInput
    anthropometry?: AnthropometryOrderByWithRelationInput
    mealPlan?: MealPlanOrderByWithRelationInput
  }

  export type AppointmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AppointmentWhereInput | AppointmentWhereInput[]
    OR?: AppointmentWhereInput[]
    NOT?: AppointmentWhereInput | AppointmentWhereInput[]
    patientId?: UuidFilter<"Appointment"> | string
    clinicianId?: UuidFilter<"Appointment"> | string
    startTime?: DateTimeFilter<"Appointment"> | Date | string
    endTime?: DateTimeFilter<"Appointment"> | Date | string
    type?: EnumAppointmentTypeFilter<"Appointment"> | $Enums.AppointmentType
    reason?: StringNullableFilter<"Appointment"> | string | null
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFilter<"Appointment"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableFilter<"Appointment"> | $Enums.PaymentMethod | null
    price?: DecimalFilter<"Appointment"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
    updatedAt?: DateTimeFilter<"Appointment"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    psychNote?: XOR<PsychNoteNullableScalarRelationFilter, PsychNoteWhereInput> | null
    transaction?: XOR<FinanceTransactionNullableScalarRelationFilter, FinanceTransactionWhereInput> | null
    anthropometry?: XOR<AnthropometryNullableScalarRelationFilter, AnthropometryWhereInput> | null
    mealPlan?: XOR<MealPlanNullableScalarRelationFilter, MealPlanWhereInput> | null
  }, "id">

  export type AppointmentOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    clinicianId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    type?: SortOrder
    reason?: SortOrderInput | SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    price?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AppointmentCountOrderByAggregateInput
    _avg?: AppointmentAvgOrderByAggregateInput
    _max?: AppointmentMaxOrderByAggregateInput
    _min?: AppointmentMinOrderByAggregateInput
    _sum?: AppointmentSumOrderByAggregateInput
  }

  export type AppointmentScalarWhereWithAggregatesInput = {
    AND?: AppointmentScalarWhereWithAggregatesInput | AppointmentScalarWhereWithAggregatesInput[]
    OR?: AppointmentScalarWhereWithAggregatesInput[]
    NOT?: AppointmentScalarWhereWithAggregatesInput | AppointmentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Appointment"> | string
    patientId?: UuidWithAggregatesFilter<"Appointment"> | string
    clinicianId?: UuidWithAggregatesFilter<"Appointment"> | string
    startTime?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
    endTime?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
    type?: EnumAppointmentTypeWithAggregatesFilter<"Appointment"> | $Enums.AppointmentType
    reason?: StringNullableWithAggregatesFilter<"Appointment"> | string | null
    status?: EnumAppointmentStatusWithAggregatesFilter<"Appointment"> | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusWithAggregatesFilter<"Appointment"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableWithAggregatesFilter<"Appointment"> | $Enums.PaymentMethod | null
    price?: DecimalWithAggregatesFilter<"Appointment"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableWithAggregatesFilter<"Appointment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Appointment"> | Date | string
  }

  export type PsychNoteWhereInput = {
    AND?: PsychNoteWhereInput | PsychNoteWhereInput[]
    OR?: PsychNoteWhereInput[]
    NOT?: PsychNoteWhereInput | PsychNoteWhereInput[]
    id?: UuidFilter<"PsychNote"> | string
    appointmentId?: UuidFilter<"PsychNote"> | string
    patientId?: UuidFilter<"PsychNote"> | string
    templateType?: EnumNoteTemplateTypeFilter<"PsychNote"> | $Enums.NoteTemplateType
    content?: JsonFilter<"PsychNote">
    moodRating?: IntNullableFilter<"PsychNote"> | number | null
    privateNotes?: StringNullableFilter<"PsychNote"> | string | null
    isPinned?: BoolFilter<"PsychNote"> | boolean
    tags?: StringNullableListFilter<"PsychNote">
    createdAt?: DateTimeFilter<"PsychNote"> | Date | string
    updatedAt?: DateTimeFilter<"PsychNote"> | Date | string
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
  }

  export type PsychNoteOrderByWithRelationInput = {
    id?: SortOrder
    appointmentId?: SortOrder
    patientId?: SortOrder
    templateType?: SortOrder
    content?: SortOrder
    moodRating?: SortOrderInput | SortOrder
    privateNotes?: SortOrderInput | SortOrder
    isPinned?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appointment?: AppointmentOrderByWithRelationInput
    patient?: PatientOrderByWithRelationInput
  }

  export type PsychNoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    appointmentId?: string
    AND?: PsychNoteWhereInput | PsychNoteWhereInput[]
    OR?: PsychNoteWhereInput[]
    NOT?: PsychNoteWhereInput | PsychNoteWhereInput[]
    patientId?: UuidFilter<"PsychNote"> | string
    templateType?: EnumNoteTemplateTypeFilter<"PsychNote"> | $Enums.NoteTemplateType
    content?: JsonFilter<"PsychNote">
    moodRating?: IntNullableFilter<"PsychNote"> | number | null
    privateNotes?: StringNullableFilter<"PsychNote"> | string | null
    isPinned?: BoolFilter<"PsychNote"> | boolean
    tags?: StringNullableListFilter<"PsychNote">
    createdAt?: DateTimeFilter<"PsychNote"> | Date | string
    updatedAt?: DateTimeFilter<"PsychNote"> | Date | string
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
  }, "id" | "appointmentId">

  export type PsychNoteOrderByWithAggregationInput = {
    id?: SortOrder
    appointmentId?: SortOrder
    patientId?: SortOrder
    templateType?: SortOrder
    content?: SortOrder
    moodRating?: SortOrderInput | SortOrder
    privateNotes?: SortOrderInput | SortOrder
    isPinned?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PsychNoteCountOrderByAggregateInput
    _avg?: PsychNoteAvgOrderByAggregateInput
    _max?: PsychNoteMaxOrderByAggregateInput
    _min?: PsychNoteMinOrderByAggregateInput
    _sum?: PsychNoteSumOrderByAggregateInput
  }

  export type PsychNoteScalarWhereWithAggregatesInput = {
    AND?: PsychNoteScalarWhereWithAggregatesInput | PsychNoteScalarWhereWithAggregatesInput[]
    OR?: PsychNoteScalarWhereWithAggregatesInput[]
    NOT?: PsychNoteScalarWhereWithAggregatesInput | PsychNoteScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"PsychNote"> | string
    appointmentId?: UuidWithAggregatesFilter<"PsychNote"> | string
    patientId?: UuidWithAggregatesFilter<"PsychNote"> | string
    templateType?: EnumNoteTemplateTypeWithAggregatesFilter<"PsychNote"> | $Enums.NoteTemplateType
    content?: JsonWithAggregatesFilter<"PsychNote">
    moodRating?: IntNullableWithAggregatesFilter<"PsychNote"> | number | null
    privateNotes?: StringNullableWithAggregatesFilter<"PsychNote"> | string | null
    isPinned?: BoolWithAggregatesFilter<"PsychNote"> | boolean
    tags?: StringNullableListFilter<"PsychNote">
    createdAt?: DateTimeWithAggregatesFilter<"PsychNote"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PsychNote"> | Date | string
  }

  export type TaskWhereInput = {
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    id?: UuidFilter<"Task"> | string
    patientId?: UuidFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    isCompleted?: BoolFilter<"Task"> | boolean
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
  }

  export type TaskOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    isCompleted?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    patient?: PatientOrderByWithRelationInput
  }

  export type TaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    patientId?: UuidFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    isCompleted?: BoolFilter<"Task"> | boolean
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
  }, "id">

  export type TaskOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    isCompleted?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TaskCountOrderByAggregateInput
    _max?: TaskMaxOrderByAggregateInput
    _min?: TaskMinOrderByAggregateInput
  }

  export type TaskScalarWhereWithAggregatesInput = {
    AND?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    OR?: TaskScalarWhereWithAggregatesInput[]
    NOT?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Task"> | string
    patientId?: UuidWithAggregatesFilter<"Task"> | string
    description?: StringWithAggregatesFilter<"Task"> | string
    isCompleted?: BoolWithAggregatesFilter<"Task"> | boolean
    dueDate?: DateTimeNullableWithAggregatesFilter<"Task"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
  }

  export type AccessLogWhereInput = {
    AND?: AccessLogWhereInput | AccessLogWhereInput[]
    OR?: AccessLogWhereInput[]
    NOT?: AccessLogWhereInput | AccessLogWhereInput[]
    id?: UuidFilter<"AccessLog"> | string
    userId?: UuidFilter<"AccessLog"> | string
    patientId?: UuidNullableFilter<"AccessLog"> | string | null
    action?: StringFilter<"AccessLog"> | string
    resource?: StringFilter<"AccessLog"> | string
    details?: StringNullableFilter<"AccessLog"> | string | null
    ipAddress?: StringNullableFilter<"AccessLog"> | string | null
    userAgent?: StringNullableFilter<"AccessLog"> | string | null
    createdAt?: DateTimeFilter<"AccessLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    patient?: XOR<PatientNullableScalarRelationFilter, PatientWhereInput> | null
  }

  export type AccessLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    patientId?: SortOrderInput | SortOrder
    action?: SortOrder
    resource?: SortOrder
    details?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    patient?: PatientOrderByWithRelationInput
  }

  export type AccessLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AccessLogWhereInput | AccessLogWhereInput[]
    OR?: AccessLogWhereInput[]
    NOT?: AccessLogWhereInput | AccessLogWhereInput[]
    userId?: UuidFilter<"AccessLog"> | string
    patientId?: UuidNullableFilter<"AccessLog"> | string | null
    action?: StringFilter<"AccessLog"> | string
    resource?: StringFilter<"AccessLog"> | string
    details?: StringNullableFilter<"AccessLog"> | string | null
    ipAddress?: StringNullableFilter<"AccessLog"> | string | null
    userAgent?: StringNullableFilter<"AccessLog"> | string | null
    createdAt?: DateTimeFilter<"AccessLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    patient?: XOR<PatientNullableScalarRelationFilter, PatientWhereInput> | null
  }, "id">

  export type AccessLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    patientId?: SortOrderInput | SortOrder
    action?: SortOrder
    resource?: SortOrder
    details?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AccessLogCountOrderByAggregateInput
    _max?: AccessLogMaxOrderByAggregateInput
    _min?: AccessLogMinOrderByAggregateInput
  }

  export type AccessLogScalarWhereWithAggregatesInput = {
    AND?: AccessLogScalarWhereWithAggregatesInput | AccessLogScalarWhereWithAggregatesInput[]
    OR?: AccessLogScalarWhereWithAggregatesInput[]
    NOT?: AccessLogScalarWhereWithAggregatesInput | AccessLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AccessLog"> | string
    userId?: UuidWithAggregatesFilter<"AccessLog"> | string
    patientId?: UuidNullableWithAggregatesFilter<"AccessLog"> | string | null
    action?: StringWithAggregatesFilter<"AccessLog"> | string
    resource?: StringWithAggregatesFilter<"AccessLog"> | string
    details?: StringNullableWithAggregatesFilter<"AccessLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AccessLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AccessLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AccessLog"> | Date | string
  }

  export type FinanceTransactionWhereInput = {
    AND?: FinanceTransactionWhereInput | FinanceTransactionWhereInput[]
    OR?: FinanceTransactionWhereInput[]
    NOT?: FinanceTransactionWhereInput | FinanceTransactionWhereInput[]
    id?: UuidFilter<"FinanceTransaction"> | string
    clinicianId?: UuidFilter<"FinanceTransaction"> | string
    appointmentId?: UuidNullableFilter<"FinanceTransaction"> | string | null
    type?: EnumTransactionTypeFilter<"FinanceTransaction"> | $Enums.TransactionType
    category?: StringFilter<"FinanceTransaction"> | string
    amount?: DecimalFilter<"FinanceTransaction"> | Decimal | DecimalJsLike | number | string
    description?: StringNullableFilter<"FinanceTransaction"> | string | null
    date?: DateTimeFilter<"FinanceTransaction"> | Date | string
    createdAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
    updatedAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    appointment?: XOR<AppointmentNullableScalarRelationFilter, AppointmentWhereInput> | null
  }

  export type FinanceTransactionOrderByWithRelationInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    appointmentId?: SortOrderInput | SortOrder
    type?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clinician?: ClinicianProfileOrderByWithRelationInput
    appointment?: AppointmentOrderByWithRelationInput
  }

  export type FinanceTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    appointmentId?: string
    AND?: FinanceTransactionWhereInput | FinanceTransactionWhereInput[]
    OR?: FinanceTransactionWhereInput[]
    NOT?: FinanceTransactionWhereInput | FinanceTransactionWhereInput[]
    clinicianId?: UuidFilter<"FinanceTransaction"> | string
    type?: EnumTransactionTypeFilter<"FinanceTransaction"> | $Enums.TransactionType
    category?: StringFilter<"FinanceTransaction"> | string
    amount?: DecimalFilter<"FinanceTransaction"> | Decimal | DecimalJsLike | number | string
    description?: StringNullableFilter<"FinanceTransaction"> | string | null
    date?: DateTimeFilter<"FinanceTransaction"> | Date | string
    createdAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
    updatedAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
    clinician?: XOR<ClinicianProfileScalarRelationFilter, ClinicianProfileWhereInput>
    appointment?: XOR<AppointmentNullableScalarRelationFilter, AppointmentWhereInput> | null
  }, "id" | "appointmentId">

  export type FinanceTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    appointmentId?: SortOrderInput | SortOrder
    type?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FinanceTransactionCountOrderByAggregateInput
    _avg?: FinanceTransactionAvgOrderByAggregateInput
    _max?: FinanceTransactionMaxOrderByAggregateInput
    _min?: FinanceTransactionMinOrderByAggregateInput
    _sum?: FinanceTransactionSumOrderByAggregateInput
  }

  export type FinanceTransactionScalarWhereWithAggregatesInput = {
    AND?: FinanceTransactionScalarWhereWithAggregatesInput | FinanceTransactionScalarWhereWithAggregatesInput[]
    OR?: FinanceTransactionScalarWhereWithAggregatesInput[]
    NOT?: FinanceTransactionScalarWhereWithAggregatesInput | FinanceTransactionScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"FinanceTransaction"> | string
    clinicianId?: UuidWithAggregatesFilter<"FinanceTransaction"> | string
    appointmentId?: UuidNullableWithAggregatesFilter<"FinanceTransaction"> | string | null
    type?: EnumTransactionTypeWithAggregatesFilter<"FinanceTransaction"> | $Enums.TransactionType
    category?: StringWithAggregatesFilter<"FinanceTransaction"> | string
    amount?: DecimalWithAggregatesFilter<"FinanceTransaction"> | Decimal | DecimalJsLike | number | string
    description?: StringNullableWithAggregatesFilter<"FinanceTransaction"> | string | null
    date?: DateTimeWithAggregatesFilter<"FinanceTransaction"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"FinanceTransaction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FinanceTransaction"> | Date | string
  }

  export type AnthropometryWhereInput = {
    AND?: AnthropometryWhereInput | AnthropometryWhereInput[]
    OR?: AnthropometryWhereInput[]
    NOT?: AnthropometryWhereInput | AnthropometryWhereInput[]
    id?: UuidFilter<"Anthropometry"> | string
    patientId?: UuidFilter<"Anthropometry"> | string
    appointmentId?: UuidFilter<"Anthropometry"> | string
    weight?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    height?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    bodyFat?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    waist?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    hip?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"Anthropometry"> | Date | string
    updatedAt?: DateTimeFilter<"Anthropometry"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
  }

  export type AnthropometryOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrderInput | SortOrder
    waist?: SortOrderInput | SortOrder
    hip?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    patient?: PatientOrderByWithRelationInput
    appointment?: AppointmentOrderByWithRelationInput
  }

  export type AnthropometryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    appointmentId?: string
    AND?: AnthropometryWhereInput | AnthropometryWhereInput[]
    OR?: AnthropometryWhereInput[]
    NOT?: AnthropometryWhereInput | AnthropometryWhereInput[]
    patientId?: UuidFilter<"Anthropometry"> | string
    weight?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    height?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    bodyFat?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    waist?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    hip?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"Anthropometry"> | Date | string
    updatedAt?: DateTimeFilter<"Anthropometry"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
  }, "id" | "appointmentId">

  export type AnthropometryOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrderInput | SortOrder
    waist?: SortOrderInput | SortOrder
    hip?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AnthropometryCountOrderByAggregateInput
    _avg?: AnthropometryAvgOrderByAggregateInput
    _max?: AnthropometryMaxOrderByAggregateInput
    _min?: AnthropometryMinOrderByAggregateInput
    _sum?: AnthropometrySumOrderByAggregateInput
  }

  export type AnthropometryScalarWhereWithAggregatesInput = {
    AND?: AnthropometryScalarWhereWithAggregatesInput | AnthropometryScalarWhereWithAggregatesInput[]
    OR?: AnthropometryScalarWhereWithAggregatesInput[]
    NOT?: AnthropometryScalarWhereWithAggregatesInput | AnthropometryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Anthropometry"> | string
    patientId?: UuidWithAggregatesFilter<"Anthropometry"> | string
    appointmentId?: UuidWithAggregatesFilter<"Anthropometry"> | string
    weight?: DecimalWithAggregatesFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    height?: DecimalWithAggregatesFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    bodyFat?: DecimalNullableWithAggregatesFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    waist?: DecimalNullableWithAggregatesFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    hip?: DecimalNullableWithAggregatesFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Anthropometry"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Anthropometry"> | Date | string
  }

  export type MealPlanWhereInput = {
    AND?: MealPlanWhereInput | MealPlanWhereInput[]
    OR?: MealPlanWhereInput[]
    NOT?: MealPlanWhereInput | MealPlanWhereInput[]
    id?: UuidFilter<"MealPlan"> | string
    patientId?: UuidFilter<"MealPlan"> | string
    appointmentId?: UuidFilter<"MealPlan"> | string
    content?: StringNullableFilter<"MealPlan"> | string | null
    fileUrl?: StringNullableFilter<"MealPlan"> | string | null
    fileName?: StringNullableFilter<"MealPlan"> | string | null
    createdAt?: DateTimeFilter<"MealPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MealPlan"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
  }

  export type MealPlanOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    content?: SortOrderInput | SortOrder
    fileUrl?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    patient?: PatientOrderByWithRelationInput
    appointment?: AppointmentOrderByWithRelationInput
  }

  export type MealPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    appointmentId?: string
    AND?: MealPlanWhereInput | MealPlanWhereInput[]
    OR?: MealPlanWhereInput[]
    NOT?: MealPlanWhereInput | MealPlanWhereInput[]
    patientId?: UuidFilter<"MealPlan"> | string
    content?: StringNullableFilter<"MealPlan"> | string | null
    fileUrl?: StringNullableFilter<"MealPlan"> | string | null
    fileName?: StringNullableFilter<"MealPlan"> | string | null
    createdAt?: DateTimeFilter<"MealPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MealPlan"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    appointment?: XOR<AppointmentScalarRelationFilter, AppointmentWhereInput>
  }, "id" | "appointmentId">

  export type MealPlanOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    content?: SortOrderInput | SortOrder
    fileUrl?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MealPlanCountOrderByAggregateInput
    _max?: MealPlanMaxOrderByAggregateInput
    _min?: MealPlanMinOrderByAggregateInput
  }

  export type MealPlanScalarWhereWithAggregatesInput = {
    AND?: MealPlanScalarWhereWithAggregatesInput | MealPlanScalarWhereWithAggregatesInput[]
    OR?: MealPlanScalarWhereWithAggregatesInput[]
    NOT?: MealPlanScalarWhereWithAggregatesInput | MealPlanScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MealPlan"> | string
    patientId?: UuidWithAggregatesFilter<"MealPlan"> | string
    appointmentId?: UuidWithAggregatesFilter<"MealPlan"> | string
    content?: StringNullableWithAggregatesFilter<"MealPlan"> | string | null
    fileUrl?: StringNullableWithAggregatesFilter<"MealPlan"> | string | null
    fileName?: StringNullableWithAggregatesFilter<"MealPlan"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MealPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MealPlan"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: ClinicianProfileCreateNestedOneWithoutUserInput
    accessLogs?: AccessLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: ClinicianProfileUncheckedCreateNestedOneWithoutUserInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ClinicianProfileUpdateOneWithoutUserNestedInput
    accessLogs?: AccessLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ClinicianProfileUncheckedUpdateOneWithoutUserNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClinicianProfileCreateInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
    patients?: PatientCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUncheckedCreateInput = {
    id?: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    patients?: PatientUncheckedCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentUncheckedCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionUncheckedCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
    patients?: PatientUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patients?: PatientUncheckedUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUncheckedUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUncheckedUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileCreateManyInput = {
    id?: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClinicianProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClinicianProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientCreateInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type PatientCreateManyInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PatientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentCreateManyInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppointmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PsychNoteCreateInput = {
    id?: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointment: AppointmentCreateNestedOneWithoutPsychNoteInput
    patient: PatientCreateNestedOneWithoutPsychNotesInput
  }

  export type PsychNoteUncheckedCreateInput = {
    id?: string
    appointmentId: string
    patientId: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PsychNoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointment?: AppointmentUpdateOneRequiredWithoutPsychNoteNestedInput
    patient?: PatientUpdateOneRequiredWithoutPsychNotesNestedInput
  }

  export type PsychNoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PsychNoteCreateManyInput = {
    id?: string
    appointmentId: string
    patientId: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PsychNoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PsychNoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateInput = {
    id?: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutTasksInput
  }

  export type TaskUncheckedCreateInput = {
    id?: string
    patientId: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutTasksNestedInput
  }

  export type TaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateManyInput = {
    id?: string
    patientId: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogCreateInput = {
    id?: string
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAccessLogsInput
    patient?: PatientCreateNestedOneWithoutAccessLogsInput
  }

  export type AccessLogUncheckedCreateInput = {
    id?: string
    userId: string
    patientId?: string | null
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AccessLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccessLogsNestedInput
    patient?: PatientUpdateOneWithoutAccessLogsNestedInput
  }

  export type AccessLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogCreateManyInput = {
    id?: string
    userId: string
    patientId?: string | null
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AccessLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionCreateInput = {
    id?: string
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutTransactionsInput
    appointment?: AppointmentCreateNestedOneWithoutTransactionInput
  }

  export type FinanceTransactionUncheckedCreateInput = {
    id?: string
    clinicianId: string
    appointmentId?: string | null
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinanceTransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutTransactionsNestedInput
    appointment?: AppointmentUpdateOneWithoutTransactionNestedInput
  }

  export type FinanceTransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionCreateManyInput = {
    id?: string
    clinicianId: string
    appointmentId?: string | null
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinanceTransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryCreateInput = {
    id?: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAnthropometriesInput
    appointment: AppointmentCreateNestedOneWithoutAnthropometryInput
  }

  export type AnthropometryUncheckedCreateInput = {
    id?: string
    patientId: string
    appointmentId: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnthropometryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAnthropometriesNestedInput
    appointment?: AppointmentUpdateOneRequiredWithoutAnthropometryNestedInput
  }

  export type AnthropometryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryCreateManyInput = {
    id?: string
    patientId: string
    appointmentId: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnthropometryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanCreateInput = {
    id?: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutMealPlansInput
    appointment: AppointmentCreateNestedOneWithoutMealPlanInput
  }

  export type MealPlanUncheckedCreateInput = {
    id?: string
    patientId: string
    appointmentId: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MealPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutMealPlansNestedInput
    appointment?: AppointmentUpdateOneRequiredWithoutMealPlanNestedInput
  }

  export type MealPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanCreateManyInput = {
    id?: string
    patientId: string
    appointmentId: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MealPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ClinicianProfileNullableScalarRelationFilter = {
    is?: ClinicianProfileWhereInput | null
    isNot?: ClinicianProfileWhereInput | null
  }

  export type AccessLogListRelationFilter = {
    every?: AccessLogWhereInput
    some?: AccessLogWhereInput
    none?: AccessLogWhereInput
  }

  export type AccessLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumClinicianTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ClinicianType | EnumClinicianTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumClinicianTypeFilter<$PrismaModel> | $Enums.ClinicianType
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PatientListRelationFilter = {
    every?: PatientWhereInput
    some?: PatientWhereInput
    none?: PatientWhereInput
  }

  export type AppointmentListRelationFilter = {
    every?: AppointmentWhereInput
    some?: AppointmentWhereInput
    none?: AppointmentWhereInput
  }

  export type FinanceTransactionListRelationFilter = {
    every?: FinanceTransactionWhereInput
    some?: FinanceTransactionWhereInput
    none?: FinanceTransactionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PatientOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AppointmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FinanceTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClinicianProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    licenseNumber?: SortOrder
    currency?: SortOrder
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicianProfileAvgOrderByAggregateInput = {
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
  }

  export type ClinicianProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    licenseNumber?: SortOrder
    currency?: SortOrder
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicianProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    licenseNumber?: SortOrder
    currency?: SortOrder
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicianProfileSumOrderByAggregateInput = {
    sessionDefaultDuration?: SortOrder
    sessionDefaultPrice?: SortOrder
  }

  export type EnumClinicianTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ClinicianType | EnumClinicianTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumClinicianTypeWithAggregatesFilter<$PrismaModel> | $Enums.ClinicianType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClinicianTypeFilter<$PrismaModel>
    _max?: NestedEnumClinicianTypeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumPatientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PatientStatus | EnumPatientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPatientStatusFilter<$PrismaModel> | $Enums.PatientStatus
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ClinicianProfileScalarRelationFilter = {
    is?: ClinicianProfileWhereInput
    isNot?: ClinicianProfileWhereInput
  }

  export type PsychNoteListRelationFilter = {
    every?: PsychNoteWhereInput
    some?: PsychNoteWhereInput
    none?: PsychNoteWhereInput
  }

  export type TaskListRelationFilter = {
    every?: TaskWhereInput
    some?: TaskWhereInput
    none?: TaskWhereInput
  }

  export type AnthropometryListRelationFilter = {
    every?: AnthropometryWhereInput
    some?: AnthropometryWhereInput
    none?: AnthropometryWhereInput
  }

  export type MealPlanListRelationFilter = {
    every?: MealPlanWhereInput
    some?: MealPlanWhereInput
    none?: MealPlanWhereInput
  }

  export type PsychNoteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnthropometryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MealPlanOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PatientCountOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    diagnosis?: SortOrder
    clinicalContext?: SortOrder
    status?: SortOrder
    contactPhone?: SortOrder
    emergencyContact?: SortOrder
    treatmentGoals?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientMaxOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    diagnosis?: SortOrder
    clinicalContext?: SortOrder
    status?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientMinOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    fullName?: SortOrder
    dateOfBirth?: SortOrder
    diagnosis?: SortOrder
    clinicalContext?: SortOrder
    status?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumPatientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PatientStatus | EnumPatientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPatientStatusWithAggregatesFilter<$PrismaModel> | $Enums.PatientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPatientStatusFilter<$PrismaModel>
    _max?: NestedEnumPatientStatusFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumAppointmentTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentType | EnumAppointmentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentTypeFilter<$PrismaModel> | $Enums.AppointmentType
  }

  export type EnumAppointmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusFilter<$PrismaModel> | $Enums.AppointmentStatus
  }

  export type EnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type EnumPaymentMethodNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableFilter<$PrismaModel> | $Enums.PaymentMethod | null
  }

  export type PatientScalarRelationFilter = {
    is?: PatientWhereInput
    isNot?: PatientWhereInput
  }

  export type PsychNoteNullableScalarRelationFilter = {
    is?: PsychNoteWhereInput | null
    isNot?: PsychNoteWhereInput | null
  }

  export type FinanceTransactionNullableScalarRelationFilter = {
    is?: FinanceTransactionWhereInput | null
    isNot?: FinanceTransactionWhereInput | null
  }

  export type AnthropometryNullableScalarRelationFilter = {
    is?: AnthropometryWhereInput | null
    isNot?: AnthropometryWhereInput | null
  }

  export type MealPlanNullableScalarRelationFilter = {
    is?: MealPlanWhereInput | null
    isNot?: MealPlanWhereInput | null
  }

  export type AppointmentCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    clinicianId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    price?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppointmentAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type AppointmentMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    clinicianId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    price?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppointmentMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    clinicianId?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    type?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    price?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppointmentSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type EnumAppointmentTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentType | EnumAppointmentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentTypeWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentTypeFilter<$PrismaModel>
    _max?: NestedEnumAppointmentTypeFilter<$PrismaModel>
  }

  export type EnumAppointmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAppointmentStatusFilter<$PrismaModel>
  }

  export type EnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type EnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
  }

  export type EnumNoteTemplateTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NoteTemplateType | EnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNoteTemplateTypeFilter<$PrismaModel> | $Enums.NoteTemplateType
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AppointmentScalarRelationFilter = {
    is?: AppointmentWhereInput
    isNot?: AppointmentWhereInput
  }

  export type PsychNoteCountOrderByAggregateInput = {
    id?: SortOrder
    appointmentId?: SortOrder
    patientId?: SortOrder
    templateType?: SortOrder
    content?: SortOrder
    moodRating?: SortOrder
    privateNotes?: SortOrder
    isPinned?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PsychNoteAvgOrderByAggregateInput = {
    moodRating?: SortOrder
  }

  export type PsychNoteMaxOrderByAggregateInput = {
    id?: SortOrder
    appointmentId?: SortOrder
    patientId?: SortOrder
    templateType?: SortOrder
    moodRating?: SortOrder
    privateNotes?: SortOrder
    isPinned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PsychNoteMinOrderByAggregateInput = {
    id?: SortOrder
    appointmentId?: SortOrder
    patientId?: SortOrder
    templateType?: SortOrder
    moodRating?: SortOrder
    privateNotes?: SortOrder
    isPinned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PsychNoteSumOrderByAggregateInput = {
    moodRating?: SortOrder
  }

  export type EnumNoteTemplateTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NoteTemplateType | EnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNoteTemplateTypeWithAggregatesFilter<$PrismaModel> | $Enums.NoteTemplateType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNoteTemplateTypeFilter<$PrismaModel>
    _max?: NestedEnumNoteTemplateTypeFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TaskCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    isCompleted?: SortOrder
    dueDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    isCompleted?: SortOrder
    dueDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    isCompleted?: SortOrder
    dueDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type PatientNullableScalarRelationFilter = {
    is?: PatientWhereInput | null
    isNot?: PatientWhereInput | null
  }

  export type AccessLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    patientId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AccessLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    patientId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AccessLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    patientId?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type AppointmentNullableScalarRelationFilter = {
    is?: AppointmentWhereInput | null
    isNot?: AppointmentWhereInput | null
  }

  export type FinanceTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    appointmentId?: SortOrder
    type?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinanceTransactionAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type FinanceTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    appointmentId?: SortOrder
    type?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinanceTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    clinicianId?: SortOrder
    appointmentId?: SortOrder
    type?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinanceTransactionSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type AnthropometryCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrder
    waist?: SortOrder
    hip?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnthropometryAvgOrderByAggregateInput = {
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrder
    waist?: SortOrder
    hip?: SortOrder
  }

  export type AnthropometryMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrder
    waist?: SortOrder
    hip?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnthropometryMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrder
    waist?: SortOrder
    hip?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnthropometrySumOrderByAggregateInput = {
    weight?: SortOrder
    height?: SortOrder
    bodyFat?: SortOrder
    waist?: SortOrder
    hip?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type MealPlanCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    content?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MealPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    content?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MealPlanMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    appointmentId?: SortOrder
    content?: SortOrder
    fileUrl?: SortOrder
    fileName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClinicianProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutUserInput
    connect?: ClinicianProfileWhereUniqueInput
  }

  export type AccessLogCreateNestedManyWithoutUserInput = {
    create?: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput> | AccessLogCreateWithoutUserInput[] | AccessLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutUserInput | AccessLogCreateOrConnectWithoutUserInput[]
    createMany?: AccessLogCreateManyUserInputEnvelope
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
  }

  export type ClinicianProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutUserInput
    connect?: ClinicianProfileWhereUniqueInput
  }

  export type AccessLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput> | AccessLogCreateWithoutUserInput[] | AccessLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutUserInput | AccessLogCreateOrConnectWithoutUserInput[]
    createMany?: AccessLogCreateManyUserInputEnvelope
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ClinicianProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutUserInput
    upsert?: ClinicianProfileUpsertWithoutUserInput
    disconnect?: ClinicianProfileWhereInput | boolean
    delete?: ClinicianProfileWhereInput | boolean
    connect?: ClinicianProfileWhereUniqueInput
    update?: XOR<XOR<ClinicianProfileUpdateToOneWithWhereWithoutUserInput, ClinicianProfileUpdateWithoutUserInput>, ClinicianProfileUncheckedUpdateWithoutUserInput>
  }

  export type AccessLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput> | AccessLogCreateWithoutUserInput[] | AccessLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutUserInput | AccessLogCreateOrConnectWithoutUserInput[]
    upsert?: AccessLogUpsertWithWhereUniqueWithoutUserInput | AccessLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccessLogCreateManyUserInputEnvelope
    set?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    disconnect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    delete?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    update?: AccessLogUpdateWithWhereUniqueWithoutUserInput | AccessLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccessLogUpdateManyWithWhereWithoutUserInput | AccessLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
  }

  export type ClinicianProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutUserInput
    upsert?: ClinicianProfileUpsertWithoutUserInput
    disconnect?: ClinicianProfileWhereInput | boolean
    delete?: ClinicianProfileWhereInput | boolean
    connect?: ClinicianProfileWhereUniqueInput
    update?: XOR<XOR<ClinicianProfileUpdateToOneWithWhereWithoutUserInput, ClinicianProfileUpdateWithoutUserInput>, ClinicianProfileUncheckedUpdateWithoutUserInput>
  }

  export type AccessLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput> | AccessLogCreateWithoutUserInput[] | AccessLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutUserInput | AccessLogCreateOrConnectWithoutUserInput[]
    upsert?: AccessLogUpsertWithWhereUniqueWithoutUserInput | AccessLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccessLogCreateManyUserInputEnvelope
    set?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    disconnect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    delete?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    update?: AccessLogUpdateWithWhereUniqueWithoutUserInput | AccessLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccessLogUpdateManyWithWhereWithoutUserInput | AccessLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type PatientCreateNestedManyWithoutClinicianInput = {
    create?: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput> | PatientCreateWithoutClinicianInput[] | PatientUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: PatientCreateOrConnectWithoutClinicianInput | PatientCreateOrConnectWithoutClinicianInput[]
    createMany?: PatientCreateManyClinicianInputEnvelope
    connect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
  }

  export type AppointmentCreateNestedManyWithoutClinicianInput = {
    create?: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput> | AppointmentCreateWithoutClinicianInput[] | AppointmentUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutClinicianInput | AppointmentCreateOrConnectWithoutClinicianInput[]
    createMany?: AppointmentCreateManyClinicianInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type FinanceTransactionCreateNestedManyWithoutClinicianInput = {
    create?: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput> | FinanceTransactionCreateWithoutClinicianInput[] | FinanceTransactionUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutClinicianInput | FinanceTransactionCreateOrConnectWithoutClinicianInput[]
    createMany?: FinanceTransactionCreateManyClinicianInputEnvelope
    connect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
  }

  export type PatientUncheckedCreateNestedManyWithoutClinicianInput = {
    create?: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput> | PatientCreateWithoutClinicianInput[] | PatientUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: PatientCreateOrConnectWithoutClinicianInput | PatientCreateOrConnectWithoutClinicianInput[]
    createMany?: PatientCreateManyClinicianInputEnvelope
    connect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
  }

  export type AppointmentUncheckedCreateNestedManyWithoutClinicianInput = {
    create?: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput> | AppointmentCreateWithoutClinicianInput[] | AppointmentUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutClinicianInput | AppointmentCreateOrConnectWithoutClinicianInput[]
    createMany?: AppointmentCreateManyClinicianInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type FinanceTransactionUncheckedCreateNestedManyWithoutClinicianInput = {
    create?: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput> | FinanceTransactionCreateWithoutClinicianInput[] | FinanceTransactionUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutClinicianInput | FinanceTransactionCreateOrConnectWithoutClinicianInput[]
    createMany?: FinanceTransactionCreateManyClinicianInputEnvelope
    connect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
  }

  export type EnumClinicianTypeFieldUpdateOperationsInput = {
    set?: $Enums.ClinicianType
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type PatientUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput> | PatientCreateWithoutClinicianInput[] | PatientUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: PatientCreateOrConnectWithoutClinicianInput | PatientCreateOrConnectWithoutClinicianInput[]
    upsert?: PatientUpsertWithWhereUniqueWithoutClinicianInput | PatientUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: PatientCreateManyClinicianInputEnvelope
    set?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    disconnect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    delete?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    connect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    update?: PatientUpdateWithWhereUniqueWithoutClinicianInput | PatientUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: PatientUpdateManyWithWhereWithoutClinicianInput | PatientUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: PatientScalarWhereInput | PatientScalarWhereInput[]
  }

  export type AppointmentUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput> | AppointmentCreateWithoutClinicianInput[] | AppointmentUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutClinicianInput | AppointmentCreateOrConnectWithoutClinicianInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutClinicianInput | AppointmentUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: AppointmentCreateManyClinicianInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutClinicianInput | AppointmentUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutClinicianInput | AppointmentUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type FinanceTransactionUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput> | FinanceTransactionCreateWithoutClinicianInput[] | FinanceTransactionUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutClinicianInput | FinanceTransactionCreateOrConnectWithoutClinicianInput[]
    upsert?: FinanceTransactionUpsertWithWhereUniqueWithoutClinicianInput | FinanceTransactionUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: FinanceTransactionCreateManyClinicianInputEnvelope
    set?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    disconnect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    delete?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    connect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    update?: FinanceTransactionUpdateWithWhereUniqueWithoutClinicianInput | FinanceTransactionUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: FinanceTransactionUpdateManyWithWhereWithoutClinicianInput | FinanceTransactionUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: FinanceTransactionScalarWhereInput | FinanceTransactionScalarWhereInput[]
  }

  export type PatientUncheckedUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput> | PatientCreateWithoutClinicianInput[] | PatientUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: PatientCreateOrConnectWithoutClinicianInput | PatientCreateOrConnectWithoutClinicianInput[]
    upsert?: PatientUpsertWithWhereUniqueWithoutClinicianInput | PatientUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: PatientCreateManyClinicianInputEnvelope
    set?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    disconnect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    delete?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    connect?: PatientWhereUniqueInput | PatientWhereUniqueInput[]
    update?: PatientUpdateWithWhereUniqueWithoutClinicianInput | PatientUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: PatientUpdateManyWithWhereWithoutClinicianInput | PatientUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: PatientScalarWhereInput | PatientScalarWhereInput[]
  }

  export type AppointmentUncheckedUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput> | AppointmentCreateWithoutClinicianInput[] | AppointmentUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutClinicianInput | AppointmentCreateOrConnectWithoutClinicianInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutClinicianInput | AppointmentUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: AppointmentCreateManyClinicianInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutClinicianInput | AppointmentUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutClinicianInput | AppointmentUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type FinanceTransactionUncheckedUpdateManyWithoutClinicianNestedInput = {
    create?: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput> | FinanceTransactionCreateWithoutClinicianInput[] | FinanceTransactionUncheckedCreateWithoutClinicianInput[]
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutClinicianInput | FinanceTransactionCreateOrConnectWithoutClinicianInput[]
    upsert?: FinanceTransactionUpsertWithWhereUniqueWithoutClinicianInput | FinanceTransactionUpsertWithWhereUniqueWithoutClinicianInput[]
    createMany?: FinanceTransactionCreateManyClinicianInputEnvelope
    set?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    disconnect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    delete?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    connect?: FinanceTransactionWhereUniqueInput | FinanceTransactionWhereUniqueInput[]
    update?: FinanceTransactionUpdateWithWhereUniqueWithoutClinicianInput | FinanceTransactionUpdateWithWhereUniqueWithoutClinicianInput[]
    updateMany?: FinanceTransactionUpdateManyWithWhereWithoutClinicianInput | FinanceTransactionUpdateManyWithWhereWithoutClinicianInput[]
    deleteMany?: FinanceTransactionScalarWhereInput | FinanceTransactionScalarWhereInput[]
  }

  export type PatientCreatetreatmentGoalsInput = {
    set: string[]
  }

  export type ClinicianProfileCreateNestedOneWithoutPatientsInput = {
    create?: XOR<ClinicianProfileCreateWithoutPatientsInput, ClinicianProfileUncheckedCreateWithoutPatientsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutPatientsInput
    connect?: ClinicianProfileWhereUniqueInput
  }

  export type AppointmentCreateNestedManyWithoutPatientInput = {
    create?: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput> | AppointmentCreateWithoutPatientInput[] | AppointmentUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPatientInput | AppointmentCreateOrConnectWithoutPatientInput[]
    createMany?: AppointmentCreateManyPatientInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type PsychNoteCreateNestedManyWithoutPatientInput = {
    create?: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput> | PsychNoteCreateWithoutPatientInput[] | PsychNoteUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: PsychNoteCreateOrConnectWithoutPatientInput | PsychNoteCreateOrConnectWithoutPatientInput[]
    createMany?: PsychNoteCreateManyPatientInputEnvelope
    connect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
  }

  export type AccessLogCreateNestedManyWithoutPatientInput = {
    create?: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput> | AccessLogCreateWithoutPatientInput[] | AccessLogUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutPatientInput | AccessLogCreateOrConnectWithoutPatientInput[]
    createMany?: AccessLogCreateManyPatientInputEnvelope
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
  }

  export type TaskCreateNestedManyWithoutPatientInput = {
    create?: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput> | TaskCreateWithoutPatientInput[] | TaskUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutPatientInput | TaskCreateOrConnectWithoutPatientInput[]
    createMany?: TaskCreateManyPatientInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type AnthropometryCreateNestedManyWithoutPatientInput = {
    create?: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput> | AnthropometryCreateWithoutPatientInput[] | AnthropometryUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AnthropometryCreateOrConnectWithoutPatientInput | AnthropometryCreateOrConnectWithoutPatientInput[]
    createMany?: AnthropometryCreateManyPatientInputEnvelope
    connect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
  }

  export type MealPlanCreateNestedManyWithoutPatientInput = {
    create?: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput> | MealPlanCreateWithoutPatientInput[] | MealPlanUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: MealPlanCreateOrConnectWithoutPatientInput | MealPlanCreateOrConnectWithoutPatientInput[]
    createMany?: MealPlanCreateManyPatientInputEnvelope
    connect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
  }

  export type AppointmentUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput> | AppointmentCreateWithoutPatientInput[] | AppointmentUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPatientInput | AppointmentCreateOrConnectWithoutPatientInput[]
    createMany?: AppointmentCreateManyPatientInputEnvelope
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
  }

  export type PsychNoteUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput> | PsychNoteCreateWithoutPatientInput[] | PsychNoteUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: PsychNoteCreateOrConnectWithoutPatientInput | PsychNoteCreateOrConnectWithoutPatientInput[]
    createMany?: PsychNoteCreateManyPatientInputEnvelope
    connect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
  }

  export type AccessLogUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput> | AccessLogCreateWithoutPatientInput[] | AccessLogUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutPatientInput | AccessLogCreateOrConnectWithoutPatientInput[]
    createMany?: AccessLogCreateManyPatientInputEnvelope
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput> | TaskCreateWithoutPatientInput[] | TaskUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutPatientInput | TaskCreateOrConnectWithoutPatientInput[]
    createMany?: TaskCreateManyPatientInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type AnthropometryUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput> | AnthropometryCreateWithoutPatientInput[] | AnthropometryUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AnthropometryCreateOrConnectWithoutPatientInput | AnthropometryCreateOrConnectWithoutPatientInput[]
    createMany?: AnthropometryCreateManyPatientInputEnvelope
    connect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
  }

  export type MealPlanUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput> | MealPlanCreateWithoutPatientInput[] | MealPlanUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: MealPlanCreateOrConnectWithoutPatientInput | MealPlanCreateOrConnectWithoutPatientInput[]
    createMany?: MealPlanCreateManyPatientInputEnvelope
    connect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumPatientStatusFieldUpdateOperationsInput = {
    set?: $Enums.PatientStatus
  }

  export type PatientUpdatetreatmentGoalsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput = {
    create?: XOR<ClinicianProfileCreateWithoutPatientsInput, ClinicianProfileUncheckedCreateWithoutPatientsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutPatientsInput
    upsert?: ClinicianProfileUpsertWithoutPatientsInput
    connect?: ClinicianProfileWhereUniqueInput
    update?: XOR<XOR<ClinicianProfileUpdateToOneWithWhereWithoutPatientsInput, ClinicianProfileUpdateWithoutPatientsInput>, ClinicianProfileUncheckedUpdateWithoutPatientsInput>
  }

  export type AppointmentUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput> | AppointmentCreateWithoutPatientInput[] | AppointmentUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPatientInput | AppointmentCreateOrConnectWithoutPatientInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutPatientInput | AppointmentUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AppointmentCreateManyPatientInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutPatientInput | AppointmentUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutPatientInput | AppointmentUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type PsychNoteUpdateManyWithoutPatientNestedInput = {
    create?: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput> | PsychNoteCreateWithoutPatientInput[] | PsychNoteUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: PsychNoteCreateOrConnectWithoutPatientInput | PsychNoteCreateOrConnectWithoutPatientInput[]
    upsert?: PsychNoteUpsertWithWhereUniqueWithoutPatientInput | PsychNoteUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: PsychNoteCreateManyPatientInputEnvelope
    set?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    disconnect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    delete?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    connect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    update?: PsychNoteUpdateWithWhereUniqueWithoutPatientInput | PsychNoteUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: PsychNoteUpdateManyWithWhereWithoutPatientInput | PsychNoteUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: PsychNoteScalarWhereInput | PsychNoteScalarWhereInput[]
  }

  export type AccessLogUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput> | AccessLogCreateWithoutPatientInput[] | AccessLogUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutPatientInput | AccessLogCreateOrConnectWithoutPatientInput[]
    upsert?: AccessLogUpsertWithWhereUniqueWithoutPatientInput | AccessLogUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AccessLogCreateManyPatientInputEnvelope
    set?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    disconnect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    delete?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    update?: AccessLogUpdateWithWhereUniqueWithoutPatientInput | AccessLogUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AccessLogUpdateManyWithWhereWithoutPatientInput | AccessLogUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
  }

  export type TaskUpdateManyWithoutPatientNestedInput = {
    create?: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput> | TaskCreateWithoutPatientInput[] | TaskUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutPatientInput | TaskCreateOrConnectWithoutPatientInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutPatientInput | TaskUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: TaskCreateManyPatientInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutPatientInput | TaskUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutPatientInput | TaskUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type AnthropometryUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput> | AnthropometryCreateWithoutPatientInput[] | AnthropometryUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AnthropometryCreateOrConnectWithoutPatientInput | AnthropometryCreateOrConnectWithoutPatientInput[]
    upsert?: AnthropometryUpsertWithWhereUniqueWithoutPatientInput | AnthropometryUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AnthropometryCreateManyPatientInputEnvelope
    set?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    disconnect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    delete?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    connect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    update?: AnthropometryUpdateWithWhereUniqueWithoutPatientInput | AnthropometryUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AnthropometryUpdateManyWithWhereWithoutPatientInput | AnthropometryUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AnthropometryScalarWhereInput | AnthropometryScalarWhereInput[]
  }

  export type MealPlanUpdateManyWithoutPatientNestedInput = {
    create?: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput> | MealPlanCreateWithoutPatientInput[] | MealPlanUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: MealPlanCreateOrConnectWithoutPatientInput | MealPlanCreateOrConnectWithoutPatientInput[]
    upsert?: MealPlanUpsertWithWhereUniqueWithoutPatientInput | MealPlanUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: MealPlanCreateManyPatientInputEnvelope
    set?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    disconnect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    delete?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    connect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    update?: MealPlanUpdateWithWhereUniqueWithoutPatientInput | MealPlanUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: MealPlanUpdateManyWithWhereWithoutPatientInput | MealPlanUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: MealPlanScalarWhereInput | MealPlanScalarWhereInput[]
  }

  export type AppointmentUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput> | AppointmentCreateWithoutPatientInput[] | AppointmentUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AppointmentCreateOrConnectWithoutPatientInput | AppointmentCreateOrConnectWithoutPatientInput[]
    upsert?: AppointmentUpsertWithWhereUniqueWithoutPatientInput | AppointmentUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AppointmentCreateManyPatientInputEnvelope
    set?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    disconnect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    delete?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    connect?: AppointmentWhereUniqueInput | AppointmentWhereUniqueInput[]
    update?: AppointmentUpdateWithWhereUniqueWithoutPatientInput | AppointmentUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AppointmentUpdateManyWithWhereWithoutPatientInput | AppointmentUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
  }

  export type PsychNoteUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput> | PsychNoteCreateWithoutPatientInput[] | PsychNoteUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: PsychNoteCreateOrConnectWithoutPatientInput | PsychNoteCreateOrConnectWithoutPatientInput[]
    upsert?: PsychNoteUpsertWithWhereUniqueWithoutPatientInput | PsychNoteUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: PsychNoteCreateManyPatientInputEnvelope
    set?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    disconnect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    delete?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    connect?: PsychNoteWhereUniqueInput | PsychNoteWhereUniqueInput[]
    update?: PsychNoteUpdateWithWhereUniqueWithoutPatientInput | PsychNoteUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: PsychNoteUpdateManyWithWhereWithoutPatientInput | PsychNoteUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: PsychNoteScalarWhereInput | PsychNoteScalarWhereInput[]
  }

  export type AccessLogUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput> | AccessLogCreateWithoutPatientInput[] | AccessLogUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AccessLogCreateOrConnectWithoutPatientInput | AccessLogCreateOrConnectWithoutPatientInput[]
    upsert?: AccessLogUpsertWithWhereUniqueWithoutPatientInput | AccessLogUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AccessLogCreateManyPatientInputEnvelope
    set?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    disconnect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    delete?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    connect?: AccessLogWhereUniqueInput | AccessLogWhereUniqueInput[]
    update?: AccessLogUpdateWithWhereUniqueWithoutPatientInput | AccessLogUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AccessLogUpdateManyWithWhereWithoutPatientInput | AccessLogUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput> | TaskCreateWithoutPatientInput[] | TaskUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutPatientInput | TaskCreateOrConnectWithoutPatientInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutPatientInput | TaskUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: TaskCreateManyPatientInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutPatientInput | TaskUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutPatientInput | TaskUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type AnthropometryUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput> | AnthropometryCreateWithoutPatientInput[] | AnthropometryUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AnthropometryCreateOrConnectWithoutPatientInput | AnthropometryCreateOrConnectWithoutPatientInput[]
    upsert?: AnthropometryUpsertWithWhereUniqueWithoutPatientInput | AnthropometryUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AnthropometryCreateManyPatientInputEnvelope
    set?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    disconnect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    delete?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    connect?: AnthropometryWhereUniqueInput | AnthropometryWhereUniqueInput[]
    update?: AnthropometryUpdateWithWhereUniqueWithoutPatientInput | AnthropometryUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AnthropometryUpdateManyWithWhereWithoutPatientInput | AnthropometryUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AnthropometryScalarWhereInput | AnthropometryScalarWhereInput[]
  }

  export type MealPlanUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput> | MealPlanCreateWithoutPatientInput[] | MealPlanUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: MealPlanCreateOrConnectWithoutPatientInput | MealPlanCreateOrConnectWithoutPatientInput[]
    upsert?: MealPlanUpsertWithWhereUniqueWithoutPatientInput | MealPlanUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: MealPlanCreateManyPatientInputEnvelope
    set?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    disconnect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    delete?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    connect?: MealPlanWhereUniqueInput | MealPlanWhereUniqueInput[]
    update?: MealPlanUpdateWithWhereUniqueWithoutPatientInput | MealPlanUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: MealPlanUpdateManyWithWhereWithoutPatientInput | MealPlanUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: MealPlanScalarWhereInput | MealPlanScalarWhereInput[]
  }

  export type PatientCreateNestedOneWithoutAppointmentsInput = {
    create?: XOR<PatientCreateWithoutAppointmentsInput, PatientUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAppointmentsInput
    connect?: PatientWhereUniqueInput
  }

  export type ClinicianProfileCreateNestedOneWithoutAppointmentsInput = {
    create?: XOR<ClinicianProfileCreateWithoutAppointmentsInput, ClinicianProfileUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutAppointmentsInput
    connect?: ClinicianProfileWhereUniqueInput
  }

  export type PsychNoteCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: PsychNoteCreateOrConnectWithoutAppointmentInput
    connect?: PsychNoteWhereUniqueInput
  }

  export type FinanceTransactionCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutAppointmentInput
    connect?: FinanceTransactionWhereUniqueInput
  }

  export type AnthropometryCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: AnthropometryCreateOrConnectWithoutAppointmentInput
    connect?: AnthropometryWhereUniqueInput
  }

  export type MealPlanCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: MealPlanCreateOrConnectWithoutAppointmentInput
    connect?: MealPlanWhereUniqueInput
  }

  export type PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: PsychNoteCreateOrConnectWithoutAppointmentInput
    connect?: PsychNoteWhereUniqueInput
  }

  export type FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutAppointmentInput
    connect?: FinanceTransactionWhereUniqueInput
  }

  export type AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: AnthropometryCreateOrConnectWithoutAppointmentInput
    connect?: AnthropometryWhereUniqueInput
  }

  export type MealPlanUncheckedCreateNestedOneWithoutAppointmentInput = {
    create?: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: MealPlanCreateOrConnectWithoutAppointmentInput
    connect?: MealPlanWhereUniqueInput
  }

  export type EnumAppointmentTypeFieldUpdateOperationsInput = {
    set?: $Enums.AppointmentType
  }

  export type EnumAppointmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.AppointmentStatus
  }

  export type EnumPaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.PaymentStatus
  }

  export type NullableEnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod | null
  }

  export type PatientUpdateOneRequiredWithoutAppointmentsNestedInput = {
    create?: XOR<PatientCreateWithoutAppointmentsInput, PatientUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAppointmentsInput
    upsert?: PatientUpsertWithoutAppointmentsInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutAppointmentsInput, PatientUpdateWithoutAppointmentsInput>, PatientUncheckedUpdateWithoutAppointmentsInput>
  }

  export type ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput = {
    create?: XOR<ClinicianProfileCreateWithoutAppointmentsInput, ClinicianProfileUncheckedCreateWithoutAppointmentsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutAppointmentsInput
    upsert?: ClinicianProfileUpsertWithoutAppointmentsInput
    connect?: ClinicianProfileWhereUniqueInput
    update?: XOR<XOR<ClinicianProfileUpdateToOneWithWhereWithoutAppointmentsInput, ClinicianProfileUpdateWithoutAppointmentsInput>, ClinicianProfileUncheckedUpdateWithoutAppointmentsInput>
  }

  export type PsychNoteUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: PsychNoteCreateOrConnectWithoutAppointmentInput
    upsert?: PsychNoteUpsertWithoutAppointmentInput
    disconnect?: PsychNoteWhereInput | boolean
    delete?: PsychNoteWhereInput | boolean
    connect?: PsychNoteWhereUniqueInput
    update?: XOR<XOR<PsychNoteUpdateToOneWithWhereWithoutAppointmentInput, PsychNoteUpdateWithoutAppointmentInput>, PsychNoteUncheckedUpdateWithoutAppointmentInput>
  }

  export type FinanceTransactionUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutAppointmentInput
    upsert?: FinanceTransactionUpsertWithoutAppointmentInput
    disconnect?: FinanceTransactionWhereInput | boolean
    delete?: FinanceTransactionWhereInput | boolean
    connect?: FinanceTransactionWhereUniqueInput
    update?: XOR<XOR<FinanceTransactionUpdateToOneWithWhereWithoutAppointmentInput, FinanceTransactionUpdateWithoutAppointmentInput>, FinanceTransactionUncheckedUpdateWithoutAppointmentInput>
  }

  export type AnthropometryUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: AnthropometryCreateOrConnectWithoutAppointmentInput
    upsert?: AnthropometryUpsertWithoutAppointmentInput
    disconnect?: AnthropometryWhereInput | boolean
    delete?: AnthropometryWhereInput | boolean
    connect?: AnthropometryWhereUniqueInput
    update?: XOR<XOR<AnthropometryUpdateToOneWithWhereWithoutAppointmentInput, AnthropometryUpdateWithoutAppointmentInput>, AnthropometryUncheckedUpdateWithoutAppointmentInput>
  }

  export type MealPlanUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: MealPlanCreateOrConnectWithoutAppointmentInput
    upsert?: MealPlanUpsertWithoutAppointmentInput
    disconnect?: MealPlanWhereInput | boolean
    delete?: MealPlanWhereInput | boolean
    connect?: MealPlanWhereUniqueInput
    update?: XOR<XOR<MealPlanUpdateToOneWithWhereWithoutAppointmentInput, MealPlanUpdateWithoutAppointmentInput>, MealPlanUncheckedUpdateWithoutAppointmentInput>
  }

  export type PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: PsychNoteCreateOrConnectWithoutAppointmentInput
    upsert?: PsychNoteUpsertWithoutAppointmentInput
    disconnect?: PsychNoteWhereInput | boolean
    delete?: PsychNoteWhereInput | boolean
    connect?: PsychNoteWhereUniqueInput
    update?: XOR<XOR<PsychNoteUpdateToOneWithWhereWithoutAppointmentInput, PsychNoteUpdateWithoutAppointmentInput>, PsychNoteUncheckedUpdateWithoutAppointmentInput>
  }

  export type FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: FinanceTransactionCreateOrConnectWithoutAppointmentInput
    upsert?: FinanceTransactionUpsertWithoutAppointmentInput
    disconnect?: FinanceTransactionWhereInput | boolean
    delete?: FinanceTransactionWhereInput | boolean
    connect?: FinanceTransactionWhereUniqueInput
    update?: XOR<XOR<FinanceTransactionUpdateToOneWithWhereWithoutAppointmentInput, FinanceTransactionUpdateWithoutAppointmentInput>, FinanceTransactionUncheckedUpdateWithoutAppointmentInput>
  }

  export type AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: AnthropometryCreateOrConnectWithoutAppointmentInput
    upsert?: AnthropometryUpsertWithoutAppointmentInput
    disconnect?: AnthropometryWhereInput | boolean
    delete?: AnthropometryWhereInput | boolean
    connect?: AnthropometryWhereUniqueInput
    update?: XOR<XOR<AnthropometryUpdateToOneWithWhereWithoutAppointmentInput, AnthropometryUpdateWithoutAppointmentInput>, AnthropometryUncheckedUpdateWithoutAppointmentInput>
  }

  export type MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput = {
    create?: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
    connectOrCreate?: MealPlanCreateOrConnectWithoutAppointmentInput
    upsert?: MealPlanUpsertWithoutAppointmentInput
    disconnect?: MealPlanWhereInput | boolean
    delete?: MealPlanWhereInput | boolean
    connect?: MealPlanWhereUniqueInput
    update?: XOR<XOR<MealPlanUpdateToOneWithWhereWithoutAppointmentInput, MealPlanUpdateWithoutAppointmentInput>, MealPlanUncheckedUpdateWithoutAppointmentInput>
  }

  export type PsychNoteCreatetagsInput = {
    set: string[]
  }

  export type AppointmentCreateNestedOneWithoutPsychNoteInput = {
    create?: XOR<AppointmentCreateWithoutPsychNoteInput, AppointmentUncheckedCreateWithoutPsychNoteInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutPsychNoteInput
    connect?: AppointmentWhereUniqueInput
  }

  export type PatientCreateNestedOneWithoutPsychNotesInput = {
    create?: XOR<PatientCreateWithoutPsychNotesInput, PatientUncheckedCreateWithoutPsychNotesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutPsychNotesInput
    connect?: PatientWhereUniqueInput
  }

  export type EnumNoteTemplateTypeFieldUpdateOperationsInput = {
    set?: $Enums.NoteTemplateType
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type PsychNoteUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type AppointmentUpdateOneRequiredWithoutPsychNoteNestedInput = {
    create?: XOR<AppointmentCreateWithoutPsychNoteInput, AppointmentUncheckedCreateWithoutPsychNoteInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutPsychNoteInput
    upsert?: AppointmentUpsertWithoutPsychNoteInput
    connect?: AppointmentWhereUniqueInput
    update?: XOR<XOR<AppointmentUpdateToOneWithWhereWithoutPsychNoteInput, AppointmentUpdateWithoutPsychNoteInput>, AppointmentUncheckedUpdateWithoutPsychNoteInput>
  }

  export type PatientUpdateOneRequiredWithoutPsychNotesNestedInput = {
    create?: XOR<PatientCreateWithoutPsychNotesInput, PatientUncheckedCreateWithoutPsychNotesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutPsychNotesInput
    upsert?: PatientUpsertWithoutPsychNotesInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutPsychNotesInput, PatientUpdateWithoutPsychNotesInput>, PatientUncheckedUpdateWithoutPsychNotesInput>
  }

  export type PatientCreateNestedOneWithoutTasksInput = {
    create?: XOR<PatientCreateWithoutTasksInput, PatientUncheckedCreateWithoutTasksInput>
    connectOrCreate?: PatientCreateOrConnectWithoutTasksInput
    connect?: PatientWhereUniqueInput
  }

  export type PatientUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<PatientCreateWithoutTasksInput, PatientUncheckedCreateWithoutTasksInput>
    connectOrCreate?: PatientCreateOrConnectWithoutTasksInput
    upsert?: PatientUpsertWithoutTasksInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutTasksInput, PatientUpdateWithoutTasksInput>, PatientUncheckedUpdateWithoutTasksInput>
  }

  export type UserCreateNestedOneWithoutAccessLogsInput = {
    create?: XOR<UserCreateWithoutAccessLogsInput, UserUncheckedCreateWithoutAccessLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccessLogsInput
    connect?: UserWhereUniqueInput
  }

  export type PatientCreateNestedOneWithoutAccessLogsInput = {
    create?: XOR<PatientCreateWithoutAccessLogsInput, PatientUncheckedCreateWithoutAccessLogsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAccessLogsInput
    connect?: PatientWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAccessLogsNestedInput = {
    create?: XOR<UserCreateWithoutAccessLogsInput, UserUncheckedCreateWithoutAccessLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccessLogsInput
    upsert?: UserUpsertWithoutAccessLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccessLogsInput, UserUpdateWithoutAccessLogsInput>, UserUncheckedUpdateWithoutAccessLogsInput>
  }

  export type PatientUpdateOneWithoutAccessLogsNestedInput = {
    create?: XOR<PatientCreateWithoutAccessLogsInput, PatientUncheckedCreateWithoutAccessLogsInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAccessLogsInput
    upsert?: PatientUpsertWithoutAccessLogsInput
    disconnect?: PatientWhereInput | boolean
    delete?: PatientWhereInput | boolean
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutAccessLogsInput, PatientUpdateWithoutAccessLogsInput>, PatientUncheckedUpdateWithoutAccessLogsInput>
  }

  export type ClinicianProfileCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<ClinicianProfileCreateWithoutTransactionsInput, ClinicianProfileUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutTransactionsInput
    connect?: ClinicianProfileWhereUniqueInput
  }

  export type AppointmentCreateNestedOneWithoutTransactionInput = {
    create?: XOR<AppointmentCreateWithoutTransactionInput, AppointmentUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutTransactionInput
    connect?: AppointmentWhereUniqueInput
  }

  export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType
  }

  export type ClinicianProfileUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<ClinicianProfileCreateWithoutTransactionsInput, ClinicianProfileUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: ClinicianProfileCreateOrConnectWithoutTransactionsInput
    upsert?: ClinicianProfileUpsertWithoutTransactionsInput
    connect?: ClinicianProfileWhereUniqueInput
    update?: XOR<XOR<ClinicianProfileUpdateToOneWithWhereWithoutTransactionsInput, ClinicianProfileUpdateWithoutTransactionsInput>, ClinicianProfileUncheckedUpdateWithoutTransactionsInput>
  }

  export type AppointmentUpdateOneWithoutTransactionNestedInput = {
    create?: XOR<AppointmentCreateWithoutTransactionInput, AppointmentUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutTransactionInput
    upsert?: AppointmentUpsertWithoutTransactionInput
    disconnect?: AppointmentWhereInput | boolean
    delete?: AppointmentWhereInput | boolean
    connect?: AppointmentWhereUniqueInput
    update?: XOR<XOR<AppointmentUpdateToOneWithWhereWithoutTransactionInput, AppointmentUpdateWithoutTransactionInput>, AppointmentUncheckedUpdateWithoutTransactionInput>
  }

  export type PatientCreateNestedOneWithoutAnthropometriesInput = {
    create?: XOR<PatientCreateWithoutAnthropometriesInput, PatientUncheckedCreateWithoutAnthropometriesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAnthropometriesInput
    connect?: PatientWhereUniqueInput
  }

  export type AppointmentCreateNestedOneWithoutAnthropometryInput = {
    create?: XOR<AppointmentCreateWithoutAnthropometryInput, AppointmentUncheckedCreateWithoutAnthropometryInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutAnthropometryInput
    connect?: AppointmentWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type PatientUpdateOneRequiredWithoutAnthropometriesNestedInput = {
    create?: XOR<PatientCreateWithoutAnthropometriesInput, PatientUncheckedCreateWithoutAnthropometriesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAnthropometriesInput
    upsert?: PatientUpsertWithoutAnthropometriesInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutAnthropometriesInput, PatientUpdateWithoutAnthropometriesInput>, PatientUncheckedUpdateWithoutAnthropometriesInput>
  }

  export type AppointmentUpdateOneRequiredWithoutAnthropometryNestedInput = {
    create?: XOR<AppointmentCreateWithoutAnthropometryInput, AppointmentUncheckedCreateWithoutAnthropometryInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutAnthropometryInput
    upsert?: AppointmentUpsertWithoutAnthropometryInput
    connect?: AppointmentWhereUniqueInput
    update?: XOR<XOR<AppointmentUpdateToOneWithWhereWithoutAnthropometryInput, AppointmentUpdateWithoutAnthropometryInput>, AppointmentUncheckedUpdateWithoutAnthropometryInput>
  }

  export type PatientCreateNestedOneWithoutMealPlansInput = {
    create?: XOR<PatientCreateWithoutMealPlansInput, PatientUncheckedCreateWithoutMealPlansInput>
    connectOrCreate?: PatientCreateOrConnectWithoutMealPlansInput
    connect?: PatientWhereUniqueInput
  }

  export type AppointmentCreateNestedOneWithoutMealPlanInput = {
    create?: XOR<AppointmentCreateWithoutMealPlanInput, AppointmentUncheckedCreateWithoutMealPlanInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutMealPlanInput
    connect?: AppointmentWhereUniqueInput
  }

  export type PatientUpdateOneRequiredWithoutMealPlansNestedInput = {
    create?: XOR<PatientCreateWithoutMealPlansInput, PatientUncheckedCreateWithoutMealPlansInput>
    connectOrCreate?: PatientCreateOrConnectWithoutMealPlansInput
    upsert?: PatientUpsertWithoutMealPlansInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutMealPlansInput, PatientUpdateWithoutMealPlansInput>, PatientUncheckedUpdateWithoutMealPlansInput>
  }

  export type AppointmentUpdateOneRequiredWithoutMealPlanNestedInput = {
    create?: XOR<AppointmentCreateWithoutMealPlanInput, AppointmentUncheckedCreateWithoutMealPlanInput>
    connectOrCreate?: AppointmentCreateOrConnectWithoutMealPlanInput
    upsert?: AppointmentUpsertWithoutMealPlanInput
    connect?: AppointmentWhereUniqueInput
    update?: XOR<XOR<AppointmentUpdateToOneWithWhereWithoutMealPlanInput, AppointmentUpdateWithoutMealPlanInput>, AppointmentUncheckedUpdateWithoutMealPlanInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumClinicianTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ClinicianType | EnumClinicianTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumClinicianTypeFilter<$PrismaModel> | $Enums.ClinicianType
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedEnumClinicianTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ClinicianType | EnumClinicianTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ClinicianType[] | ListEnumClinicianTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumClinicianTypeWithAggregatesFilter<$PrismaModel> | $Enums.ClinicianType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClinicianTypeFilter<$PrismaModel>
    _max?: NestedEnumClinicianTypeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPatientStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PatientStatus | EnumPatientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPatientStatusFilter<$PrismaModel> | $Enums.PatientStatus
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumPatientStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PatientStatus | EnumPatientStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PatientStatus[] | ListEnumPatientStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPatientStatusWithAggregatesFilter<$PrismaModel> | $Enums.PatientStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPatientStatusFilter<$PrismaModel>
    _max?: NestedEnumPatientStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumAppointmentTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentType | EnumAppointmentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentTypeFilter<$PrismaModel> | $Enums.AppointmentType
  }

  export type NestedEnumAppointmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusFilter<$PrismaModel> | $Enums.AppointmentStatus
  }

  export type NestedEnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type NestedEnumPaymentMethodNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableFilter<$PrismaModel> | $Enums.PaymentMethod | null
  }

  export type NestedEnumAppointmentTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentType | EnumAppointmentTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentType[] | ListEnumAppointmentTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentTypeWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentTypeFilter<$PrismaModel>
    _max?: NestedEnumAppointmentTypeFilter<$PrismaModel>
  }

  export type NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AppointmentStatus | EnumAppointmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AppointmentStatus[] | ListEnumAppointmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAppointmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AppointmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAppointmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAppointmentStatusFilter<$PrismaModel>
  }

  export type NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
  }

  export type NestedEnumNoteTemplateTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NoteTemplateType | EnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNoteTemplateTypeFilter<$PrismaModel> | $Enums.NoteTemplateType
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumNoteTemplateTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NoteTemplateType | EnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NoteTemplateType[] | ListEnumNoteTemplateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNoteTemplateTypeWithAggregatesFilter<$PrismaModel> | $Enums.NoteTemplateType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNoteTemplateTypeFilter<$PrismaModel>
    _max?: NestedEnumNoteTemplateTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type ClinicianProfileCreateWithoutUserInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    patients?: PatientCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUncheckedCreateWithoutUserInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    patients?: PatientUncheckedCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentUncheckedCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionUncheckedCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileCreateOrConnectWithoutUserInput = {
    where: ClinicianProfileWhereUniqueInput
    create: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
  }

  export type AccessLogCreateWithoutUserInput = {
    id?: string
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    patient?: PatientCreateNestedOneWithoutAccessLogsInput
  }

  export type AccessLogUncheckedCreateWithoutUserInput = {
    id?: string
    patientId?: string | null
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AccessLogCreateOrConnectWithoutUserInput = {
    where: AccessLogWhereUniqueInput
    create: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput>
  }

  export type AccessLogCreateManyUserInputEnvelope = {
    data: AccessLogCreateManyUserInput | AccessLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ClinicianProfileUpsertWithoutUserInput = {
    update: XOR<ClinicianProfileUpdateWithoutUserInput, ClinicianProfileUncheckedUpdateWithoutUserInput>
    create: XOR<ClinicianProfileCreateWithoutUserInput, ClinicianProfileUncheckedCreateWithoutUserInput>
    where?: ClinicianProfileWhereInput
  }

  export type ClinicianProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: ClinicianProfileWhereInput
    data: XOR<ClinicianProfileUpdateWithoutUserInput, ClinicianProfileUncheckedUpdateWithoutUserInput>
  }

  export type ClinicianProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patients?: PatientUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patients?: PatientUncheckedUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUncheckedUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUncheckedUpdateManyWithoutClinicianNestedInput
  }

  export type AccessLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AccessLogWhereUniqueInput
    update: XOR<AccessLogUpdateWithoutUserInput, AccessLogUncheckedUpdateWithoutUserInput>
    create: XOR<AccessLogCreateWithoutUserInput, AccessLogUncheckedCreateWithoutUserInput>
  }

  export type AccessLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AccessLogWhereUniqueInput
    data: XOR<AccessLogUpdateWithoutUserInput, AccessLogUncheckedUpdateWithoutUserInput>
  }

  export type AccessLogUpdateManyWithWhereWithoutUserInput = {
    where: AccessLogScalarWhereInput
    data: XOR<AccessLogUpdateManyMutationInput, AccessLogUncheckedUpdateManyWithoutUserInput>
  }

  export type AccessLogScalarWhereInput = {
    AND?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
    OR?: AccessLogScalarWhereInput[]
    NOT?: AccessLogScalarWhereInput | AccessLogScalarWhereInput[]
    id?: UuidFilter<"AccessLog"> | string
    userId?: UuidFilter<"AccessLog"> | string
    patientId?: UuidNullableFilter<"AccessLog"> | string | null
    action?: StringFilter<"AccessLog"> | string
    resource?: StringFilter<"AccessLog"> | string
    details?: StringNullableFilter<"AccessLog"> | string | null
    ipAddress?: StringNullableFilter<"AccessLog"> | string | null
    userAgent?: StringNullableFilter<"AccessLog"> | string | null
    createdAt?: DateTimeFilter<"AccessLog"> | Date | string
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    accessLogs?: AccessLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type PatientCreateWithoutClinicianInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutClinicianInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutClinicianInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput>
  }

  export type PatientCreateManyClinicianInputEnvelope = {
    data: PatientCreateManyClinicianInput | PatientCreateManyClinicianInput[]
    skipDuplicates?: boolean
  }

  export type AppointmentCreateWithoutClinicianInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutClinicianInput = {
    id?: string
    patientId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutClinicianInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput>
  }

  export type AppointmentCreateManyClinicianInputEnvelope = {
    data: AppointmentCreateManyClinicianInput | AppointmentCreateManyClinicianInput[]
    skipDuplicates?: boolean
  }

  export type FinanceTransactionCreateWithoutClinicianInput = {
    id?: string
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    appointment?: AppointmentCreateNestedOneWithoutTransactionInput
  }

  export type FinanceTransactionUncheckedCreateWithoutClinicianInput = {
    id?: string
    appointmentId?: string | null
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinanceTransactionCreateOrConnectWithoutClinicianInput = {
    where: FinanceTransactionWhereUniqueInput
    create: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput>
  }

  export type FinanceTransactionCreateManyClinicianInputEnvelope = {
    data: FinanceTransactionCreateManyClinicianInput | FinanceTransactionCreateManyClinicianInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accessLogs?: AccessLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accessLogs?: AccessLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PatientUpsertWithWhereUniqueWithoutClinicianInput = {
    where: PatientWhereUniqueInput
    update: XOR<PatientUpdateWithoutClinicianInput, PatientUncheckedUpdateWithoutClinicianInput>
    create: XOR<PatientCreateWithoutClinicianInput, PatientUncheckedCreateWithoutClinicianInput>
  }

  export type PatientUpdateWithWhereUniqueWithoutClinicianInput = {
    where: PatientWhereUniqueInput
    data: XOR<PatientUpdateWithoutClinicianInput, PatientUncheckedUpdateWithoutClinicianInput>
  }

  export type PatientUpdateManyWithWhereWithoutClinicianInput = {
    where: PatientScalarWhereInput
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyWithoutClinicianInput>
  }

  export type PatientScalarWhereInput = {
    AND?: PatientScalarWhereInput | PatientScalarWhereInput[]
    OR?: PatientScalarWhereInput[]
    NOT?: PatientScalarWhereInput | PatientScalarWhereInput[]
    id?: UuidFilter<"Patient"> | string
    clinicianId?: UuidFilter<"Patient"> | string
    fullName?: StringFilter<"Patient"> | string
    dateOfBirth?: DateTimeNullableFilter<"Patient"> | Date | string | null
    diagnosis?: StringNullableFilter<"Patient"> | string | null
    clinicalContext?: StringNullableFilter<"Patient"> | string | null
    status?: EnumPatientStatusFilter<"Patient"> | $Enums.PatientStatus
    contactPhone?: StringNullableFilter<"Patient"> | string | null
    emergencyContact?: JsonNullableFilter<"Patient">
    treatmentGoals?: StringNullableListFilter<"Patient">
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    updatedAt?: DateTimeFilter<"Patient"> | Date | string
  }

  export type AppointmentUpsertWithWhereUniqueWithoutClinicianInput = {
    where: AppointmentWhereUniqueInput
    update: XOR<AppointmentUpdateWithoutClinicianInput, AppointmentUncheckedUpdateWithoutClinicianInput>
    create: XOR<AppointmentCreateWithoutClinicianInput, AppointmentUncheckedCreateWithoutClinicianInput>
  }

  export type AppointmentUpdateWithWhereUniqueWithoutClinicianInput = {
    where: AppointmentWhereUniqueInput
    data: XOR<AppointmentUpdateWithoutClinicianInput, AppointmentUncheckedUpdateWithoutClinicianInput>
  }

  export type AppointmentUpdateManyWithWhereWithoutClinicianInput = {
    where: AppointmentScalarWhereInput
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyWithoutClinicianInput>
  }

  export type AppointmentScalarWhereInput = {
    AND?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
    OR?: AppointmentScalarWhereInput[]
    NOT?: AppointmentScalarWhereInput | AppointmentScalarWhereInput[]
    id?: UuidFilter<"Appointment"> | string
    patientId?: UuidFilter<"Appointment"> | string
    clinicianId?: UuidFilter<"Appointment"> | string
    startTime?: DateTimeFilter<"Appointment"> | Date | string
    endTime?: DateTimeFilter<"Appointment"> | Date | string
    type?: EnumAppointmentTypeFilter<"Appointment"> | $Enums.AppointmentType
    reason?: StringNullableFilter<"Appointment"> | string | null
    status?: EnumAppointmentStatusFilter<"Appointment"> | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFilter<"Appointment"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableFilter<"Appointment"> | $Enums.PaymentMethod | null
    price?: DecimalFilter<"Appointment"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Appointment"> | string | null
    createdAt?: DateTimeFilter<"Appointment"> | Date | string
    updatedAt?: DateTimeFilter<"Appointment"> | Date | string
  }

  export type FinanceTransactionUpsertWithWhereUniqueWithoutClinicianInput = {
    where: FinanceTransactionWhereUniqueInput
    update: XOR<FinanceTransactionUpdateWithoutClinicianInput, FinanceTransactionUncheckedUpdateWithoutClinicianInput>
    create: XOR<FinanceTransactionCreateWithoutClinicianInput, FinanceTransactionUncheckedCreateWithoutClinicianInput>
  }

  export type FinanceTransactionUpdateWithWhereUniqueWithoutClinicianInput = {
    where: FinanceTransactionWhereUniqueInput
    data: XOR<FinanceTransactionUpdateWithoutClinicianInput, FinanceTransactionUncheckedUpdateWithoutClinicianInput>
  }

  export type FinanceTransactionUpdateManyWithWhereWithoutClinicianInput = {
    where: FinanceTransactionScalarWhereInput
    data: XOR<FinanceTransactionUpdateManyMutationInput, FinanceTransactionUncheckedUpdateManyWithoutClinicianInput>
  }

  export type FinanceTransactionScalarWhereInput = {
    AND?: FinanceTransactionScalarWhereInput | FinanceTransactionScalarWhereInput[]
    OR?: FinanceTransactionScalarWhereInput[]
    NOT?: FinanceTransactionScalarWhereInput | FinanceTransactionScalarWhereInput[]
    id?: UuidFilter<"FinanceTransaction"> | string
    clinicianId?: UuidFilter<"FinanceTransaction"> | string
    appointmentId?: UuidNullableFilter<"FinanceTransaction"> | string | null
    type?: EnumTransactionTypeFilter<"FinanceTransaction"> | $Enums.TransactionType
    category?: StringFilter<"FinanceTransaction"> | string
    amount?: DecimalFilter<"FinanceTransaction"> | Decimal | DecimalJsLike | number | string
    description?: StringNullableFilter<"FinanceTransaction"> | string | null
    date?: DateTimeFilter<"FinanceTransaction"> | Date | string
    createdAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
    updatedAt?: DateTimeFilter<"FinanceTransaction"> | Date | string
  }

  export type ClinicianProfileCreateWithoutPatientsInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
    appointments?: AppointmentCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUncheckedCreateWithoutPatientsInput = {
    id?: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionUncheckedCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileCreateOrConnectWithoutPatientsInput = {
    where: ClinicianProfileWhereUniqueInput
    create: XOR<ClinicianProfileCreateWithoutPatientsInput, ClinicianProfileUncheckedCreateWithoutPatientsInput>
  }

  export type AppointmentCreateWithoutPatientInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutPatientInput = {
    id?: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutPatientInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput>
  }

  export type AppointmentCreateManyPatientInputEnvelope = {
    data: AppointmentCreateManyPatientInput | AppointmentCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type PsychNoteCreateWithoutPatientInput = {
    id?: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointment: AppointmentCreateNestedOneWithoutPsychNoteInput
  }

  export type PsychNoteUncheckedCreateWithoutPatientInput = {
    id?: string
    appointmentId: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PsychNoteCreateOrConnectWithoutPatientInput = {
    where: PsychNoteWhereUniqueInput
    create: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput>
  }

  export type PsychNoteCreateManyPatientInputEnvelope = {
    data: PsychNoteCreateManyPatientInput | PsychNoteCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type AccessLogCreateWithoutPatientInput = {
    id?: string
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAccessLogsInput
  }

  export type AccessLogUncheckedCreateWithoutPatientInput = {
    id?: string
    userId: string
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AccessLogCreateOrConnectWithoutPatientInput = {
    where: AccessLogWhereUniqueInput
    create: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput>
  }

  export type AccessLogCreateManyPatientInputEnvelope = {
    data: AccessLogCreateManyPatientInput | AccessLogCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type TaskCreateWithoutPatientInput = {
    id?: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUncheckedCreateWithoutPatientInput = {
    id?: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskCreateOrConnectWithoutPatientInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput>
  }

  export type TaskCreateManyPatientInputEnvelope = {
    data: TaskCreateManyPatientInput | TaskCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type AnthropometryCreateWithoutPatientInput = {
    id?: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    appointment: AppointmentCreateNestedOneWithoutAnthropometryInput
  }

  export type AnthropometryUncheckedCreateWithoutPatientInput = {
    id?: string
    appointmentId: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnthropometryCreateOrConnectWithoutPatientInput = {
    where: AnthropometryWhereUniqueInput
    create: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput>
  }

  export type AnthropometryCreateManyPatientInputEnvelope = {
    data: AnthropometryCreateManyPatientInput | AnthropometryCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type MealPlanCreateWithoutPatientInput = {
    id?: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    appointment: AppointmentCreateNestedOneWithoutMealPlanInput
  }

  export type MealPlanUncheckedCreateWithoutPatientInput = {
    id?: string
    appointmentId: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MealPlanCreateOrConnectWithoutPatientInput = {
    where: MealPlanWhereUniqueInput
    create: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput>
  }

  export type MealPlanCreateManyPatientInputEnvelope = {
    data: MealPlanCreateManyPatientInput | MealPlanCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type ClinicianProfileUpsertWithoutPatientsInput = {
    update: XOR<ClinicianProfileUpdateWithoutPatientsInput, ClinicianProfileUncheckedUpdateWithoutPatientsInput>
    create: XOR<ClinicianProfileCreateWithoutPatientsInput, ClinicianProfileUncheckedCreateWithoutPatientsInput>
    where?: ClinicianProfileWhereInput
  }

  export type ClinicianProfileUpdateToOneWithWhereWithoutPatientsInput = {
    where?: ClinicianProfileWhereInput
    data: XOR<ClinicianProfileUpdateWithoutPatientsInput, ClinicianProfileUncheckedUpdateWithoutPatientsInput>
  }

  export type ClinicianProfileUpdateWithoutPatientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
    appointments?: AppointmentUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileUncheckedUpdateWithoutPatientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUncheckedUpdateManyWithoutClinicianNestedInput
  }

  export type AppointmentUpsertWithWhereUniqueWithoutPatientInput = {
    where: AppointmentWhereUniqueInput
    update: XOR<AppointmentUpdateWithoutPatientInput, AppointmentUncheckedUpdateWithoutPatientInput>
    create: XOR<AppointmentCreateWithoutPatientInput, AppointmentUncheckedCreateWithoutPatientInput>
  }

  export type AppointmentUpdateWithWhereUniqueWithoutPatientInput = {
    where: AppointmentWhereUniqueInput
    data: XOR<AppointmentUpdateWithoutPatientInput, AppointmentUncheckedUpdateWithoutPatientInput>
  }

  export type AppointmentUpdateManyWithWhereWithoutPatientInput = {
    where: AppointmentScalarWhereInput
    data: XOR<AppointmentUpdateManyMutationInput, AppointmentUncheckedUpdateManyWithoutPatientInput>
  }

  export type PsychNoteUpsertWithWhereUniqueWithoutPatientInput = {
    where: PsychNoteWhereUniqueInput
    update: XOR<PsychNoteUpdateWithoutPatientInput, PsychNoteUncheckedUpdateWithoutPatientInput>
    create: XOR<PsychNoteCreateWithoutPatientInput, PsychNoteUncheckedCreateWithoutPatientInput>
  }

  export type PsychNoteUpdateWithWhereUniqueWithoutPatientInput = {
    where: PsychNoteWhereUniqueInput
    data: XOR<PsychNoteUpdateWithoutPatientInput, PsychNoteUncheckedUpdateWithoutPatientInput>
  }

  export type PsychNoteUpdateManyWithWhereWithoutPatientInput = {
    where: PsychNoteScalarWhereInput
    data: XOR<PsychNoteUpdateManyMutationInput, PsychNoteUncheckedUpdateManyWithoutPatientInput>
  }

  export type PsychNoteScalarWhereInput = {
    AND?: PsychNoteScalarWhereInput | PsychNoteScalarWhereInput[]
    OR?: PsychNoteScalarWhereInput[]
    NOT?: PsychNoteScalarWhereInput | PsychNoteScalarWhereInput[]
    id?: UuidFilter<"PsychNote"> | string
    appointmentId?: UuidFilter<"PsychNote"> | string
    patientId?: UuidFilter<"PsychNote"> | string
    templateType?: EnumNoteTemplateTypeFilter<"PsychNote"> | $Enums.NoteTemplateType
    content?: JsonFilter<"PsychNote">
    moodRating?: IntNullableFilter<"PsychNote"> | number | null
    privateNotes?: StringNullableFilter<"PsychNote"> | string | null
    isPinned?: BoolFilter<"PsychNote"> | boolean
    tags?: StringNullableListFilter<"PsychNote">
    createdAt?: DateTimeFilter<"PsychNote"> | Date | string
    updatedAt?: DateTimeFilter<"PsychNote"> | Date | string
  }

  export type AccessLogUpsertWithWhereUniqueWithoutPatientInput = {
    where: AccessLogWhereUniqueInput
    update: XOR<AccessLogUpdateWithoutPatientInput, AccessLogUncheckedUpdateWithoutPatientInput>
    create: XOR<AccessLogCreateWithoutPatientInput, AccessLogUncheckedCreateWithoutPatientInput>
  }

  export type AccessLogUpdateWithWhereUniqueWithoutPatientInput = {
    where: AccessLogWhereUniqueInput
    data: XOR<AccessLogUpdateWithoutPatientInput, AccessLogUncheckedUpdateWithoutPatientInput>
  }

  export type AccessLogUpdateManyWithWhereWithoutPatientInput = {
    where: AccessLogScalarWhereInput
    data: XOR<AccessLogUpdateManyMutationInput, AccessLogUncheckedUpdateManyWithoutPatientInput>
  }

  export type TaskUpsertWithWhereUniqueWithoutPatientInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutPatientInput, TaskUncheckedUpdateWithoutPatientInput>
    create: XOR<TaskCreateWithoutPatientInput, TaskUncheckedCreateWithoutPatientInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutPatientInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutPatientInput, TaskUncheckedUpdateWithoutPatientInput>
  }

  export type TaskUpdateManyWithWhereWithoutPatientInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutPatientInput>
  }

  export type TaskScalarWhereInput = {
    AND?: TaskScalarWhereInput | TaskScalarWhereInput[]
    OR?: TaskScalarWhereInput[]
    NOT?: TaskScalarWhereInput | TaskScalarWhereInput[]
    id?: UuidFilter<"Task"> | string
    patientId?: UuidFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    isCompleted?: BoolFilter<"Task"> | boolean
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
  }

  export type AnthropometryUpsertWithWhereUniqueWithoutPatientInput = {
    where: AnthropometryWhereUniqueInput
    update: XOR<AnthropometryUpdateWithoutPatientInput, AnthropometryUncheckedUpdateWithoutPatientInput>
    create: XOR<AnthropometryCreateWithoutPatientInput, AnthropometryUncheckedCreateWithoutPatientInput>
  }

  export type AnthropometryUpdateWithWhereUniqueWithoutPatientInput = {
    where: AnthropometryWhereUniqueInput
    data: XOR<AnthropometryUpdateWithoutPatientInput, AnthropometryUncheckedUpdateWithoutPatientInput>
  }

  export type AnthropometryUpdateManyWithWhereWithoutPatientInput = {
    where: AnthropometryScalarWhereInput
    data: XOR<AnthropometryUpdateManyMutationInput, AnthropometryUncheckedUpdateManyWithoutPatientInput>
  }

  export type AnthropometryScalarWhereInput = {
    AND?: AnthropometryScalarWhereInput | AnthropometryScalarWhereInput[]
    OR?: AnthropometryScalarWhereInput[]
    NOT?: AnthropometryScalarWhereInput | AnthropometryScalarWhereInput[]
    id?: UuidFilter<"Anthropometry"> | string
    patientId?: UuidFilter<"Anthropometry"> | string
    appointmentId?: UuidFilter<"Anthropometry"> | string
    weight?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    height?: DecimalFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string
    bodyFat?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    waist?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    hip?: DecimalNullableFilter<"Anthropometry"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"Anthropometry"> | Date | string
    updatedAt?: DateTimeFilter<"Anthropometry"> | Date | string
  }

  export type MealPlanUpsertWithWhereUniqueWithoutPatientInput = {
    where: MealPlanWhereUniqueInput
    update: XOR<MealPlanUpdateWithoutPatientInput, MealPlanUncheckedUpdateWithoutPatientInput>
    create: XOR<MealPlanCreateWithoutPatientInput, MealPlanUncheckedCreateWithoutPatientInput>
  }

  export type MealPlanUpdateWithWhereUniqueWithoutPatientInput = {
    where: MealPlanWhereUniqueInput
    data: XOR<MealPlanUpdateWithoutPatientInput, MealPlanUncheckedUpdateWithoutPatientInput>
  }

  export type MealPlanUpdateManyWithWhereWithoutPatientInput = {
    where: MealPlanScalarWhereInput
    data: XOR<MealPlanUpdateManyMutationInput, MealPlanUncheckedUpdateManyWithoutPatientInput>
  }

  export type MealPlanScalarWhereInput = {
    AND?: MealPlanScalarWhereInput | MealPlanScalarWhereInput[]
    OR?: MealPlanScalarWhereInput[]
    NOT?: MealPlanScalarWhereInput | MealPlanScalarWhereInput[]
    id?: UuidFilter<"MealPlan"> | string
    patientId?: UuidFilter<"MealPlan"> | string
    appointmentId?: UuidFilter<"MealPlan"> | string
    content?: StringNullableFilter<"MealPlan"> | string | null
    fileUrl?: StringNullableFilter<"MealPlan"> | string | null
    fileName?: StringNullableFilter<"MealPlan"> | string | null
    createdAt?: DateTimeFilter<"MealPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MealPlan"> | Date | string
  }

  export type PatientCreateWithoutAppointmentsInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutAppointmentsInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutAppointmentsInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutAppointmentsInput, PatientUncheckedCreateWithoutAppointmentsInput>
  }

  export type ClinicianProfileCreateWithoutAppointmentsInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
    patients?: PatientCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUncheckedCreateWithoutAppointmentsInput = {
    id?: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    patients?: PatientUncheckedCreateNestedManyWithoutClinicianInput
    transactions?: FinanceTransactionUncheckedCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileCreateOrConnectWithoutAppointmentsInput = {
    where: ClinicianProfileWhereUniqueInput
    create: XOR<ClinicianProfileCreateWithoutAppointmentsInput, ClinicianProfileUncheckedCreateWithoutAppointmentsInput>
  }

  export type PsychNoteCreateWithoutAppointmentInput = {
    id?: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutPsychNotesInput
  }

  export type PsychNoteUncheckedCreateWithoutAppointmentInput = {
    id?: string
    patientId: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PsychNoteCreateOrConnectWithoutAppointmentInput = {
    where: PsychNoteWhereUniqueInput
    create: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
  }

  export type FinanceTransactionCreateWithoutAppointmentInput = {
    id?: string
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutTransactionsInput
  }

  export type FinanceTransactionUncheckedCreateWithoutAppointmentInput = {
    id?: string
    clinicianId: string
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinanceTransactionCreateOrConnectWithoutAppointmentInput = {
    where: FinanceTransactionWhereUniqueInput
    create: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
  }

  export type AnthropometryCreateWithoutAppointmentInput = {
    id?: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAnthropometriesInput
  }

  export type AnthropometryUncheckedCreateWithoutAppointmentInput = {
    id?: string
    patientId: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnthropometryCreateOrConnectWithoutAppointmentInput = {
    where: AnthropometryWhereUniqueInput
    create: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
  }

  export type MealPlanCreateWithoutAppointmentInput = {
    id?: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutMealPlansInput
  }

  export type MealPlanUncheckedCreateWithoutAppointmentInput = {
    id?: string
    patientId: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MealPlanCreateOrConnectWithoutAppointmentInput = {
    where: MealPlanWhereUniqueInput
    create: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
  }

  export type PatientUpsertWithoutAppointmentsInput = {
    update: XOR<PatientUpdateWithoutAppointmentsInput, PatientUncheckedUpdateWithoutAppointmentsInput>
    create: XOR<PatientCreateWithoutAppointmentsInput, PatientUncheckedCreateWithoutAppointmentsInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutAppointmentsInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutAppointmentsInput, PatientUncheckedUpdateWithoutAppointmentsInput>
  }

  export type PatientUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type ClinicianProfileUpsertWithoutAppointmentsInput = {
    update: XOR<ClinicianProfileUpdateWithoutAppointmentsInput, ClinicianProfileUncheckedUpdateWithoutAppointmentsInput>
    create: XOR<ClinicianProfileCreateWithoutAppointmentsInput, ClinicianProfileUncheckedCreateWithoutAppointmentsInput>
    where?: ClinicianProfileWhereInput
  }

  export type ClinicianProfileUpdateToOneWithWhereWithoutAppointmentsInput = {
    where?: ClinicianProfileWhereInput
    data: XOR<ClinicianProfileUpdateWithoutAppointmentsInput, ClinicianProfileUncheckedUpdateWithoutAppointmentsInput>
  }

  export type ClinicianProfileUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
    patients?: PatientUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileUncheckedUpdateWithoutAppointmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patients?: PatientUncheckedUpdateManyWithoutClinicianNestedInput
    transactions?: FinanceTransactionUncheckedUpdateManyWithoutClinicianNestedInput
  }

  export type PsychNoteUpsertWithoutAppointmentInput = {
    update: XOR<PsychNoteUpdateWithoutAppointmentInput, PsychNoteUncheckedUpdateWithoutAppointmentInput>
    create: XOR<PsychNoteCreateWithoutAppointmentInput, PsychNoteUncheckedCreateWithoutAppointmentInput>
    where?: PsychNoteWhereInput
  }

  export type PsychNoteUpdateToOneWithWhereWithoutAppointmentInput = {
    where?: PsychNoteWhereInput
    data: XOR<PsychNoteUpdateWithoutAppointmentInput, PsychNoteUncheckedUpdateWithoutAppointmentInput>
  }

  export type PsychNoteUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutPsychNotesNestedInput
  }

  export type PsychNoteUncheckedUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionUpsertWithoutAppointmentInput = {
    update: XOR<FinanceTransactionUpdateWithoutAppointmentInput, FinanceTransactionUncheckedUpdateWithoutAppointmentInput>
    create: XOR<FinanceTransactionCreateWithoutAppointmentInput, FinanceTransactionUncheckedCreateWithoutAppointmentInput>
    where?: FinanceTransactionWhereInput
  }

  export type FinanceTransactionUpdateToOneWithWhereWithoutAppointmentInput = {
    where?: FinanceTransactionWhereInput
    data: XOR<FinanceTransactionUpdateWithoutAppointmentInput, FinanceTransactionUncheckedUpdateWithoutAppointmentInput>
  }

  export type FinanceTransactionUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type FinanceTransactionUncheckedUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryUpsertWithoutAppointmentInput = {
    update: XOR<AnthropometryUpdateWithoutAppointmentInput, AnthropometryUncheckedUpdateWithoutAppointmentInput>
    create: XOR<AnthropometryCreateWithoutAppointmentInput, AnthropometryUncheckedCreateWithoutAppointmentInput>
    where?: AnthropometryWhereInput
  }

  export type AnthropometryUpdateToOneWithWhereWithoutAppointmentInput = {
    where?: AnthropometryWhereInput
    data: XOR<AnthropometryUpdateWithoutAppointmentInput, AnthropometryUncheckedUpdateWithoutAppointmentInput>
  }

  export type AnthropometryUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAnthropometriesNestedInput
  }

  export type AnthropometryUncheckedUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanUpsertWithoutAppointmentInput = {
    update: XOR<MealPlanUpdateWithoutAppointmentInput, MealPlanUncheckedUpdateWithoutAppointmentInput>
    create: XOR<MealPlanCreateWithoutAppointmentInput, MealPlanUncheckedCreateWithoutAppointmentInput>
    where?: MealPlanWhereInput
  }

  export type MealPlanUpdateToOneWithWhereWithoutAppointmentInput = {
    where?: MealPlanWhereInput
    data: XOR<MealPlanUpdateWithoutAppointmentInput, MealPlanUncheckedUpdateWithoutAppointmentInput>
  }

  export type MealPlanUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutMealPlansNestedInput
  }

  export type MealPlanUncheckedUpdateWithoutAppointmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateWithoutPsychNoteInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutPsychNoteInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutPsychNoteInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutPsychNoteInput, AppointmentUncheckedCreateWithoutPsychNoteInput>
  }

  export type PatientCreateWithoutPsychNotesInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutPsychNotesInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutPsychNotesInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutPsychNotesInput, PatientUncheckedCreateWithoutPsychNotesInput>
  }

  export type AppointmentUpsertWithoutPsychNoteInput = {
    update: XOR<AppointmentUpdateWithoutPsychNoteInput, AppointmentUncheckedUpdateWithoutPsychNoteInput>
    create: XOR<AppointmentCreateWithoutPsychNoteInput, AppointmentUncheckedCreateWithoutPsychNoteInput>
    where?: AppointmentWhereInput
  }

  export type AppointmentUpdateToOneWithWhereWithoutPsychNoteInput = {
    where?: AppointmentWhereInput
    data: XOR<AppointmentUpdateWithoutPsychNoteInput, AppointmentUncheckedUpdateWithoutPsychNoteInput>
  }

  export type AppointmentUpdateWithoutPsychNoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutPsychNoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type PatientUpsertWithoutPsychNotesInput = {
    update: XOR<PatientUpdateWithoutPsychNotesInput, PatientUncheckedUpdateWithoutPsychNotesInput>
    create: XOR<PatientCreateWithoutPsychNotesInput, PatientUncheckedCreateWithoutPsychNotesInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutPsychNotesInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutPsychNotesInput, PatientUncheckedUpdateWithoutPsychNotesInput>
  }

  export type PatientUpdateWithoutPsychNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutPsychNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type PatientCreateWithoutTasksInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutTasksInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutTasksInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutTasksInput, PatientUncheckedCreateWithoutTasksInput>
  }

  export type PatientUpsertWithoutTasksInput = {
    update: XOR<PatientUpdateWithoutTasksInput, PatientUncheckedUpdateWithoutTasksInput>
    create: XOR<PatientCreateWithoutTasksInput, PatientUncheckedCreateWithoutTasksInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutTasksInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutTasksInput, PatientUncheckedUpdateWithoutTasksInput>
  }

  export type PatientUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type UserCreateWithoutAccessLogsInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: ClinicianProfileCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAccessLogsInput = {
    id?: string
    email: string
    passwordHash: string
    role: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: ClinicianProfileUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAccessLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccessLogsInput, UserUncheckedCreateWithoutAccessLogsInput>
  }

  export type PatientCreateWithoutAccessLogsInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutAccessLogsInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutAccessLogsInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutAccessLogsInput, PatientUncheckedCreateWithoutAccessLogsInput>
  }

  export type UserUpsertWithoutAccessLogsInput = {
    update: XOR<UserUpdateWithoutAccessLogsInput, UserUncheckedUpdateWithoutAccessLogsInput>
    create: XOR<UserCreateWithoutAccessLogsInput, UserUncheckedCreateWithoutAccessLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccessLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccessLogsInput, UserUncheckedUpdateWithoutAccessLogsInput>
  }

  export type UserUpdateWithoutAccessLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ClinicianProfileUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAccessLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ClinicianProfileUncheckedUpdateOneWithoutUserNestedInput
  }

  export type PatientUpsertWithoutAccessLogsInput = {
    update: XOR<PatientUpdateWithoutAccessLogsInput, PatientUncheckedUpdateWithoutAccessLogsInput>
    create: XOR<PatientCreateWithoutAccessLogsInput, PatientUncheckedCreateWithoutAccessLogsInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutAccessLogsInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutAccessLogsInput, PatientUncheckedUpdateWithoutAccessLogsInput>
  }

  export type PatientUpdateWithoutAccessLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutAccessLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type ClinicianProfileCreateWithoutTransactionsInput = {
    id?: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
    patients?: PatientCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileUncheckedCreateWithoutTransactionsInput = {
    id?: string
    userId: string
    type: $Enums.ClinicianType
    licenseNumber?: string | null
    currency?: string
    sessionDefaultDuration?: number
    sessionDefaultPrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    patients?: PatientUncheckedCreateNestedManyWithoutClinicianInput
    appointments?: AppointmentUncheckedCreateNestedManyWithoutClinicianInput
  }

  export type ClinicianProfileCreateOrConnectWithoutTransactionsInput = {
    where: ClinicianProfileWhereUniqueInput
    create: XOR<ClinicianProfileCreateWithoutTransactionsInput, ClinicianProfileUncheckedCreateWithoutTransactionsInput>
  }

  export type AppointmentCreateWithoutTransactionInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutTransactionInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutTransactionInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutTransactionInput, AppointmentUncheckedCreateWithoutTransactionInput>
  }

  export type ClinicianProfileUpsertWithoutTransactionsInput = {
    update: XOR<ClinicianProfileUpdateWithoutTransactionsInput, ClinicianProfileUncheckedUpdateWithoutTransactionsInput>
    create: XOR<ClinicianProfileCreateWithoutTransactionsInput, ClinicianProfileUncheckedCreateWithoutTransactionsInput>
    where?: ClinicianProfileWhereInput
  }

  export type ClinicianProfileUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: ClinicianProfileWhereInput
    data: XOR<ClinicianProfileUpdateWithoutTransactionsInput, ClinicianProfileUncheckedUpdateWithoutTransactionsInput>
  }

  export type ClinicianProfileUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
    patients?: PatientUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUpdateManyWithoutClinicianNestedInput
  }

  export type ClinicianProfileUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumClinicianTypeFieldUpdateOperationsInput | $Enums.ClinicianType
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null
    currency?: StringFieldUpdateOperationsInput | string
    sessionDefaultDuration?: IntFieldUpdateOperationsInput | number
    sessionDefaultPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patients?: PatientUncheckedUpdateManyWithoutClinicianNestedInput
    appointments?: AppointmentUncheckedUpdateManyWithoutClinicianNestedInput
  }

  export type AppointmentUpsertWithoutTransactionInput = {
    update: XOR<AppointmentUpdateWithoutTransactionInput, AppointmentUncheckedUpdateWithoutTransactionInput>
    create: XOR<AppointmentCreateWithoutTransactionInput, AppointmentUncheckedCreateWithoutTransactionInput>
    where?: AppointmentWhereInput
  }

  export type AppointmentUpdateToOneWithWhereWithoutTransactionInput = {
    where?: AppointmentWhereInput
    data: XOR<AppointmentUpdateWithoutTransactionInput, AppointmentUncheckedUpdateWithoutTransactionInput>
  }

  export type AppointmentUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type PatientCreateWithoutAnthropometriesInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutAnthropometriesInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    mealPlans?: MealPlanUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutAnthropometriesInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutAnthropometriesInput, PatientUncheckedCreateWithoutAnthropometriesInput>
  }

  export type AppointmentCreateWithoutAnthropometryInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutAnthropometryInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    mealPlan?: MealPlanUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutAnthropometryInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutAnthropometryInput, AppointmentUncheckedCreateWithoutAnthropometryInput>
  }

  export type PatientUpsertWithoutAnthropometriesInput = {
    update: XOR<PatientUpdateWithoutAnthropometriesInput, PatientUncheckedUpdateWithoutAnthropometriesInput>
    create: XOR<PatientCreateWithoutAnthropometriesInput, PatientUncheckedCreateWithoutAnthropometriesInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutAnthropometriesInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutAnthropometriesInput, PatientUncheckedUpdateWithoutAnthropometriesInput>
  }

  export type PatientUpdateWithoutAnthropometriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutAnthropometriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type AppointmentUpsertWithoutAnthropometryInput = {
    update: XOR<AppointmentUpdateWithoutAnthropometryInput, AppointmentUncheckedUpdateWithoutAnthropometryInput>
    create: XOR<AppointmentCreateWithoutAnthropometryInput, AppointmentUncheckedCreateWithoutAnthropometryInput>
    where?: AppointmentWhereInput
  }

  export type AppointmentUpdateToOneWithWhereWithoutAnthropometryInput = {
    where?: AppointmentWhereInput
    data: XOR<AppointmentUpdateWithoutAnthropometryInput, AppointmentUncheckedUpdateWithoutAnthropometryInput>
  }

  export type AppointmentUpdateWithoutAnthropometryInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutAnthropometryInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type PatientCreateWithoutMealPlansInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    clinician: ClinicianProfileCreateNestedOneWithoutPatientsInput
    appointments?: AppointmentCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogCreateNestedManyWithoutPatientInput
    tasks?: TaskCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutMealPlansInput = {
    id?: string
    clinicianId: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    appointments?: AppointmentUncheckedCreateNestedManyWithoutPatientInput
    psychNotes?: PsychNoteUncheckedCreateNestedManyWithoutPatientInput
    accessLogs?: AccessLogUncheckedCreateNestedManyWithoutPatientInput
    tasks?: TaskUncheckedCreateNestedManyWithoutPatientInput
    anthropometries?: AnthropometryUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutMealPlansInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutMealPlansInput, PatientUncheckedCreateWithoutMealPlansInput>
  }

  export type AppointmentCreateWithoutMealPlanInput = {
    id?: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutAppointmentsInput
    clinician: ClinicianProfileCreateNestedOneWithoutAppointmentsInput
    psychNote?: PsychNoteCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentUncheckedCreateWithoutMealPlanInput = {
    id?: string
    patientId: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    psychNote?: PsychNoteUncheckedCreateNestedOneWithoutAppointmentInput
    transaction?: FinanceTransactionUncheckedCreateNestedOneWithoutAppointmentInput
    anthropometry?: AnthropometryUncheckedCreateNestedOneWithoutAppointmentInput
  }

  export type AppointmentCreateOrConnectWithoutMealPlanInput = {
    where: AppointmentWhereUniqueInput
    create: XOR<AppointmentCreateWithoutMealPlanInput, AppointmentUncheckedCreateWithoutMealPlanInput>
  }

  export type PatientUpsertWithoutMealPlansInput = {
    update: XOR<PatientUpdateWithoutMealPlansInput, PatientUncheckedUpdateWithoutMealPlansInput>
    create: XOR<PatientCreateWithoutMealPlansInput, PatientUncheckedCreateWithoutMealPlansInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutMealPlansInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutMealPlansInput, PatientUncheckedUpdateWithoutMealPlansInput>
  }

  export type PatientUpdateWithoutMealPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutPatientsNestedInput
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutMealPlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type AppointmentUpsertWithoutMealPlanInput = {
    update: XOR<AppointmentUpdateWithoutMealPlanInput, AppointmentUncheckedUpdateWithoutMealPlanInput>
    create: XOR<AppointmentCreateWithoutMealPlanInput, AppointmentUncheckedCreateWithoutMealPlanInput>
    where?: AppointmentWhereInput
  }

  export type AppointmentUpdateToOneWithWhereWithoutMealPlanInput = {
    where?: AppointmentWhereInput
    data: XOR<AppointmentUpdateWithoutMealPlanInput, AppointmentUncheckedUpdateWithoutMealPlanInput>
  }

  export type AppointmentUpdateWithoutMealPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutMealPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type AccessLogCreateManyUserInput = {
    id?: string
    patientId?: string | null
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AccessLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneWithoutAccessLogsNestedInput
  }

  export type AccessLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientCreateManyClinicianInput = {
    id?: string
    fullName: string
    dateOfBirth?: Date | string | null
    diagnosis?: string | null
    clinicalContext?: string | null
    status?: $Enums.PatientStatus
    contactPhone?: string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientCreatetreatmentGoalsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppointmentCreateManyClinicianInput = {
    id?: string
    patientId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinanceTransactionCreateManyClinicianInput = {
    id?: string
    appointmentId?: string | null
    type: $Enums.TransactionType
    category?: string
    amount: Decimal | DecimalJsLike | number | string
    description?: string | null
    date?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PatientUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUpdateManyWithoutPatientNestedInput
    tasks?: TaskUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointments?: AppointmentUncheckedUpdateManyWithoutPatientNestedInput
    psychNotes?: PsychNoteUncheckedUpdateManyWithoutPatientNestedInput
    accessLogs?: AccessLogUncheckedUpdateManyWithoutPatientNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutPatientNestedInput
    anthropometries?: AnthropometryUncheckedUpdateManyWithoutPatientNestedInput
    mealPlans?: MealPlanUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateManyWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    diagnosis?: NullableStringFieldUpdateOperationsInput | string | null
    clinicalContext?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPatientStatusFieldUpdateOperationsInput | $Enums.PatientStatus
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyContact?: NullableJsonNullValueInput | InputJsonValue
    treatmentGoals?: PatientUpdatetreatmentGoalsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateManyWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointment?: AppointmentUpdateOneWithoutTransactionNestedInput
  }

  export type FinanceTransactionUncheckedUpdateWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinanceTransactionUncheckedUpdateManyWithoutClinicianInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    category?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppointmentCreateManyPatientInput = {
    id?: string
    clinicianId: string
    startTime: Date | string
    endTime: Date | string
    type?: $Enums.AppointmentType
    reason?: string | null
    status?: $Enums.AppointmentStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    price: Decimal | DecimalJsLike | number | string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PsychNoteCreateManyPatientInput = {
    id?: string
    appointmentId: string
    templateType: $Enums.NoteTemplateType
    content: JsonNullValueInput | InputJsonValue
    moodRating?: number | null
    privateNotes?: string | null
    isPinned?: boolean
    tags?: PsychNoteCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccessLogCreateManyPatientInput = {
    id?: string
    userId: string
    action: string
    resource: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type TaskCreateManyPatientInput = {
    id?: string
    description: string
    isCompleted?: boolean
    dueDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnthropometryCreateManyPatientInput = {
    id?: string
    appointmentId: string
    weight: Decimal | DecimalJsLike | number | string
    height: Decimal | DecimalJsLike | number | string
    bodyFat?: Decimal | DecimalJsLike | number | string | null
    waist?: Decimal | DecimalJsLike | number | string | null
    hip?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MealPlanCreateManyPatientInput = {
    id?: string
    appointmentId: string
    content?: string | null
    fileUrl?: string | null
    fileName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppointmentUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clinician?: ClinicianProfileUpdateOneRequiredWithoutAppointmentsNestedInput
    psychNote?: PsychNoteUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    psychNote?: PsychNoteUncheckedUpdateOneWithoutAppointmentNestedInput
    transaction?: FinanceTransactionUncheckedUpdateOneWithoutAppointmentNestedInput
    anthropometry?: AnthropometryUncheckedUpdateOneWithoutAppointmentNestedInput
    mealPlan?: MealPlanUncheckedUpdateOneWithoutAppointmentNestedInput
  }

  export type AppointmentUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    clinicianId?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumAppointmentTypeFieldUpdateOperationsInput | $Enums.AppointmentType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAppointmentStatusFieldUpdateOperationsInput | $Enums.AppointmentStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PsychNoteUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointment?: AppointmentUpdateOneRequiredWithoutPsychNoteNestedInput
  }

  export type PsychNoteUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PsychNoteUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    templateType?: EnumNoteTemplateTypeFieldUpdateOperationsInput | $Enums.NoteTemplateType
    content?: JsonNullValueInput | InputJsonValue
    moodRating?: NullableIntFieldUpdateOperationsInput | number | null
    privateNotes?: NullableStringFieldUpdateOperationsInput | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    tags?: PsychNoteUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccessLogsNestedInput
  }

  export type AccessLogUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccessLogUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointment?: AppointmentUpdateOneRequiredWithoutAnthropometryNestedInput
  }

  export type AnthropometryUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnthropometryUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    weight?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    height?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bodyFat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    waist?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    hip?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointment?: AppointmentUpdateOneRequiredWithoutMealPlanNestedInput
  }

  export type MealPlanUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MealPlanUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    appointmentId?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}