import { describe, it, expect } from 'vitest'
import { restoreBracketTags } from './cloudflare-ai'

describe('restoreBracketTags', () => {
  it('restores a truncated multi-tag run', () => {
    const original = '[IMP][PersonnelCost]\n- conduct SIT tests'
    const summary = '[IMP]\n- Conduct SIT tests.'
    expect(restoreBracketTags(original, summary)).toBe('[IMP][PersonnelCost]\n- Conduct SIT tests.')
  })

  it('leaves an intact run untouched', () => {
    const original = '[INVX][CICD] deploy'
    const summary = '[INVX][CICD]\n- Deploy.'
    expect(restoreBracketTags(original, summary)).toBe('[INVX][CICD]\n- Deploy.')
  })

  it('does not touch body text or single tags that survived', () => {
    const original = '[INVX] update cluster'
    const summary = '[INVX]\n- Update innovest x cluster.'
    expect(restoreBracketTags(original, summary)).toBe('[INVX]\n- Update innovest x cluster.')
  })

  it('handles multiple runs independently', () => {
    const original = '[INVX]\n[IMP][PersonnelCost]'
    const summary = '[INVX]\n[IMP]'
    expect(restoreBracketTags(original, summary)).toBe('[INVX]\n[IMP][PersonnelCost]')
  })
})
