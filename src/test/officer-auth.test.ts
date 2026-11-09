import { describe, it, expect } from 'vitest';
import { validateStationPasscode } from '../components/officer/SboSignInCard';
import { TCC_DEPARTMENTS } from '../types/student';

describe('SBO Station Passcode Validation', () => {
  it('accepts correct station-specific passcodes', () => {
    expect(validateStationPasscode('sbo1', 'SBO 1', 'CIT')).toBe(true);
    expect(validateStationPasscode('sbo2', 'SBO 2', 'CIT')).toBe(true);
    expect(validateStationPasscode('sbo3', 'SBO 3', 'CIT')).toBe(true);
    expect(validateStationPasscode('sbo4', 'SBO 4', 'CIT')).toBe(true);
  });

  it('accepts department-prefixed station passcodes', () => {
    expect(validateStationPasscode('cit-sbo1', 'SBO 1', 'CIT')).toBe(true);
    expect(validateStationPasscode('cba-sbo2', 'SBO 2', 'CBA')).toBe(true);
    expect(validateStationPasscode('ced-sbo3', 'SBO 3', 'CED')).toBe(true);
    expect(validateStationPasscode('cas-sbo4', 'SBO 4', 'CAS')).toBe(true);
  });

  it('rejects incorrect station passcodes', () => {
    // SBO 2 code used on SBO 1
    expect(validateStationPasscode('sbo2', 'SBO 1', 'CIT')).toBe(false);
    // Random student attempt
    expect(validateStationPasscode('password123', 'SBO 1', 'CIT')).toBe(false);
    expect(validateStationPasscode('', 'SBO 1', 'CIT')).toBe(false);
  });

  it('accepts universal master gate bypass codes', () => {
    expect(validateStationPasscode('sbo2026', 'SBO 1', 'CIT')).toBe(true);
    expect(validateStationPasscode('tcc-sbo-gate', 'SBO 3', 'CBA')).toBe(true);
    expect(validateStationPasscode('20261373', 'SBO 4', 'CED')).toBe(true);
  });
});

describe('TCC Academic Departments', () => {
  it('contains the 8 official TCC colleges', () => {
    expect(TCC_DEPARTMENTS).toHaveLength(8);
    const codes = TCC_DEPARTMENTS.map((d) => d.code);
    expect(codes).toContain('CIT');
    expect(codes).toContain('CBA');
    expect(codes).toContain('CED');
    expect(codes).toContain('CCJPS');
    expect(codes).toContain('CHM');
    expect(codes).toContain('CAS');
    expect(codes).toContain('COM');
    expect(codes).toContain('CLIS');
  });
});

describe('SBO Station Occupancy and Name Protection', () => {
  it('identifies occupied accounts as locked until duty ends', () => {
    const activeAccounts: Record<string, { officerName: string; status: string }> = {
      'CIT-SBO1': { officerName: 'Christian Motas', status: 'active' },
    };

    const isOccupied = (key: string) => Boolean(activeAccounts[key] && activeAccounts[key].status === 'active');
    expect(isOccupied('CIT-SBO1')).toBe(true);
    expect(isOccupied('CIT-SBO2')).toBe(false);

    // End shift releases the station
    delete activeAccounts['CIT-SBO1'];
    expect(isOccupied('CIT-SBO1')).toBe(false);
  });
});


