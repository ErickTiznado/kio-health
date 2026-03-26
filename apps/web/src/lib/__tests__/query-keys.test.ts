import { describe, it, expect } from 'vitest';
import { patientKeys, appointmentKeys, taskKeys, clinicKeys } from '../query-keys';

describe('patientKeys', () => {
  it('all es ["patients"]', () => {
    expect(patientKeys.all).toEqual(['patients']);
  });

  it('lists incluye all como prefijo', () => {
    expect(patientKeys.lists()).toEqual(['patients', 'list']);
  });

  it('list incluye los filtros', () => {
    const filters = { status: 'ACTIVE' };
    expect(patientKeys.list(filters)).toEqual(['patients', 'list', filters]);
  });

  it('detail incluye el id', () => {
    expect(patientKeys.detail('abc')).toEqual(['patients', 'detail', 'abc']);
  });

  it('timeline está anidada bajo detail', () => {
    expect(patientKeys.timeline('abc')).toEqual(['patients', 'detail', 'abc', 'timeline']);
  });

  it('documents está anidada bajo detail', () => {
    expect(patientKeys.documents('abc')).toEqual(['patients', 'detail', 'abc', 'documents']);
  });

  it('moodHistory está anidada bajo detail', () => {
    expect(patientKeys.moodHistory('abc')).toEqual(['patients', 'detail', 'abc', 'mood-history']);
  });

  it('lastNote está anidada bajo detail', () => {
    expect(patientKeys.lastNote('abc')).toEqual(['patients', 'detail', 'abc', 'last-note']);
  });

  it('scales está anidada bajo detail', () => {
    expect(patientKeys.scales('abc')).toEqual(['patients', 'detail', 'abc', 'scales']);
  });
});

describe('appointmentKeys', () => {
  it('all es ["appointments"]', () => {
    expect(appointmentKeys.all).toEqual(['appointments']);
  });

  it('next incluye el prefijo all', () => {
    expect(appointmentKeys.next()).toEqual(['appointments', 'next']);
  });

  it('detail incluye el id', () => {
    expect(appointmentKeys.detail('xyz')).toEqual(['appointments', 'detail', 'xyz']);
  });

  it('context está anidada bajo detail', () => {
    expect(appointmentKeys.context('xyz')).toEqual(['appointments', 'detail', 'xyz', 'context']);
  });

  it('notes está anidada bajo detail', () => {
    expect(appointmentKeys.notes('xyz')).toEqual(['appointments', 'detail', 'xyz', 'notes']);
  });

  it('daySummary incluye la fecha', () => {
    expect(appointmentKeys.daySummary('2026-03-13')).toEqual([
      'appointments',
      'day-summary',
      '2026-03-13',
    ]);
  });

  it('pendingNotes es estable', () => {
    expect(appointmentKeys.pendingNotes()).toEqual(['appointments', 'pending-notes']);
  });

  it('recentPatients es estable', () => {
    expect(appointmentKeys.recentPatients()).toEqual(['appointments', 'recent-patients']);
  });
});

describe('taskKeys', () => {
  it('all es ["tasks"]', () => {
    expect(taskKeys.all).toEqual(['tasks']);
  });

  it('list incluye el patientId', () => {
    expect(taskKeys.list('pat-1')).toEqual(['tasks', 'list', 'pat-1']);
  });
});

describe('clinicKeys', () => {
  it('all es ["clinic"]', () => {
    expect(clinicKeys.all).toEqual(['clinic']);
  });

  it('mine es estable', () => {
    expect(clinicKeys.mine()).toEqual(['clinic', 'mine']);
  });

  it('invitations es estable', () => {
    expect(clinicKeys.invitations()).toEqual(['clinic', 'invitations']);
  });

  it('patients es estable', () => {
    expect(clinicKeys.patients()).toEqual(['clinic', 'patients']);
  });

  it('finance incluye mes y año', () => {
    expect(clinicKeys.finance(3, 2026)).toEqual(['clinic', 'finance', 3, 2026]);
  });
});
