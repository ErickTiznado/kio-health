import { useParams } from 'react-router-dom';
import { usePatient } from '../hooks/use-patients';
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

export default function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id || '');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-600">
          Error loading patient details.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Profile */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900">{patient.fullName}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Status: <span className={`font-semibold ${patient.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>{patient.status}</span>
              </p>
            </div>
            <div className="flex space-x-3">
              {patient.contactPhone && (
                <>
                  <a
                    href={`tel:${patient.contactPhone}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${patient.contactPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.contactPhone || '-'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.diagnosis || 'No diagnosis recorded'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Clinical Context</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.clinicalContext || 'No context recorded'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Emergency Contact Widget */}
        {patient.emergencyContact && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Emergency Contact Information</h3>
                <div className="mt-2 text-sm text-red-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <p><span className="font-semibold">Name:</span> {patient.emergencyContact.name}</p>
                  <p><span className="font-semibold">Relation:</span> {patient.emergencyContact.relation || 'N/A'}</p>
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${patient.emergencyContact.phone}`} className="underline hover:text-red-900">
                      {patient.emergencyContact.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Payment History Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Historial de Pagos</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Estado financiero de las sesiones. Deuda total: <span className={Number(patient.totalDebt) > 0 ? 'text-red-600 font-bold' : 'text-gray-900'}>${Number(patient.totalDebt || 0)}</span>
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {patient.appointments && patient.appointments.length > 0 ? (
              patient.appointments.map((app) => {
                const isPaid = app.paymentStatus === 'PAID';
                const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                const methodLabels: Record<string, string> = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia' };
                const statusLabels: Record<string, string> = {
                  SCHEDULED: 'Agendada',
                  IN_PROGRESS: 'En curso',
                  COMPLETED: 'Completada',
                  CANCELLED: 'Cancelada',
                  NO_SHOW: 'No asistió',
                };

                return (
                  <li key={app.id} className={`px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between ${isCancelled ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(app.startTime).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${app.price} · {statusLabels[app.status] || app.status}
                          {isPaid && app.paymentMethod ? ` · ${methodLabels[app.paymentMethod] || app.paymentMethod}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPaid ? 'Pagado' : isCancelled ? statusLabels[app.status] : 'Pendiente'}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">
                No hay sesiones registradas.
              </li>
            )}
          </ul>
        </div>

      </div>
    </DashboardLayout>
  );
}
