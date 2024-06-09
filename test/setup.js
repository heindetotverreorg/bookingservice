import { beforeAll, vi } from 'vitest'
import { ref } from 'vue'

beforeAll(() => {
  vi.stubGlobal('ref', ref)
})