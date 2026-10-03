import { test } from 'node:test'
import assert from 'node:assert/strict'
import { issueTicket, localDate, normalizeName, validateBooking } from '../src/lib/tarot.ts'
import { CATEGORY_CONFIG, type Category } from '../src/lib/tarot-data.ts'

const input = { name: '지우', year: '2000', month: '2', day: '29' }
const today = '2026-09-12'

test('empty input returns errors for both required fields', () => {
  assert.deepEqual(Object.keys(validateBooking({ name: ' ', year: '', month: '', day: '' }, today)), ['name', 'birth'])
})

test('Gregorian leap-year rules and nonexistent dates', () => {
  for (const [year, month, day, valid] of [
    ['2000', '2', '29', true], ['2004', '2', '29', true], ['1900', '2', '29', false],
    ['2001', '2', '29', false], ['2000', '2', '31', false], ['2000', '4', '31', false],
    ['2000', '12', '31', true], ['2000', '13', '1', false], ['2000', '0', '1', false],
    ['2000', '1', '0', false], ['2000', '1', '32', false], ['1899', '12', '31', false],
  ] as const) {
    assert.equal(!validateBooking({ ...input, year, month, day }, today).birth, valid, `${year}-${month}-${day}`)
  }
})

test('a birthday today is valid, a future birthday is rejected', () => {
  assert.deepEqual(validateBooking({ ...input, year: '2026', month: '9', day: '12' }, today), {})
  assert.ok(validateBooking({ ...input, year: '2026', month: '9', day: '13' }, today).birth)
  assert.ok(validateBooking({ ...input, year: '2027', month: '1', day: '1' }, today).birth)
})

test('malformed dates cannot silently pass through number conversion', () => {
  for (const year of ['NaN', '2e03', '2000x', '-200', 'Infinity']) assert.ok(validateBooking({ ...input, year }, today).birth)
  for (const month of ['2x', '1.2', ' 2', '-1']) assert.ok(validateBooking({ ...input, month }, today).birth)
})

test('the same person, category and day always issue the same entire ticket', () => {
  const ticket = issueTicket(input, '개발운', today)
  for (let i = 0; i < 10; i++) assert.deepEqual(issueTicket(input, '개발운', today), ticket)
})

test('whitespace, Korean Unicode normalization and date padding do not change a reading', () => {
  const samePerson = { ...input, name: '  지우  '.normalize('NFD'), month: '02', day: '29' }
  assert.deepEqual(issueTicket(samePerson, '개발운', today), issueTicket(input, '개발운', today))
  assert.equal(normalizeName('  Kim   Jiwoo  '), 'Kim Jiwoo')
})

test('all six categories produce complete readings with distinct ticket identities', () => {
  const tickets = CATEGORY_CONFIG.map(category => issueTicket(input, category.name, today))
  assert.equal(new Set(tickets.map(ticket => ticket.serial)).size, 6)
  for (const ticket of tickets) {
    assert.equal(ticket.date, today)
    assert.ok(Object.values(ticket.result).every(value => typeof value === 'string' && value.length > 0))
    assert.match(ticket.serial, /^TKT-20260912-[A-Z0-9]{7}$/)
    assert.equal('birth' in ticket, false)
    assert.equal('year' in ticket, false)
  }
})

test('crossing midnight changes the issuance date and serial without modifying the original', () => {
  const before = issueTicket(input, '오늘의 운세', today)
  const after = issueTicket(input, '오늘의 운세', '2026-09-13')
  assert.notEqual(before.serial, after.serial)
  assert.equal(before.date, today)
  assert.equal(after.date, '2026-09-13')
})

test('the service date always uses the Korean calendar, independent of browser timezone', () => {
  assert.equal(localDate(new Date('2026-09-11T15:00:00Z')), today)
  assert.equal(localDate(new Date('2026-09-12T14:59:59Z')), today)
  assert.equal(localDate(new Date('2026-09-12T15:00:00Z')), '2026-09-13')
})

test('valid long names remain intact; excessive and invisible names are rejected', () => {
  const name = '가'.repeat(24)
  assert.equal(issueTicket({ ...input, name }, '오늘의 운세', today).name, name)
  assert.ok(validateBooking({ ...input, name: '가'.repeat(25) }, today).name)
  assert.ok(validateBooking({ ...input, name: '\u200b' }, today).name)
})

test('invalid data and unknown categories fail safely', () => {
  assert.throws(() => issueTicket({ ...input, day: '31' }, '개발운', today))
  assert.throws(() => issueTicket(input, '__proto__' as Category, today))
})

test('a returned ticket cannot mutate the reading of a later ticket', () => {
  const original = issueTicket(input, '개발운', today)
  const changed = issueTicket(input, '개발운', today)
  changed.result.title = 'Changed title'
  assert.deepEqual(issueTicket(input, '개발운', today), original)
})
