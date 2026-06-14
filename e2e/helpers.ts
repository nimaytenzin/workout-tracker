import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function resetAppDatabase(page: Page) {
  await page.goto('/')
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('WorkoutTrackerDB')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve()
    })
  })
  await page.reload()
}

export async function fillStepper(page: Page, id: string, value: string) {
  const input = page.locator(`#${id}`)
  await expect(input).toBeVisible()
  await input.click()
  await input.pressSequentially(value, { delay: 50 })
  await input.blur()
  await expect(input).toHaveValue(value)
}

export async function setStepperToTarget(
  page: Page,
  id: string,
  target: number,
  step: number,
) {
  const input = page.locator(`#${id}`)
  const group = page
    .locator('[data-slot="input-group"]')
    .filter({ has: input })
  const increase = group.getByRole('button', { name: 'Increase' })
  const decrease = group.getByRole('button', { name: 'Decrease' })

  for (let i = 0; i < 400; i++) {
    const current = parseFloat((await input.inputValue()) || '0')
    if (Math.abs(current - target) < 0.01) break
    if (current < target) await increase.click()
    else await decrease.click()
  }

  await expect
    .poll(async () => parseFloat((await input.inputValue()) || '0'))
    .toBeGreaterThanOrEqual(target - 0.01)
  await expect
    .poll(async () => parseFloat((await input.inputValue()) || '0'))
    .toBeLessThanOrEqual(target + 0.01)
}

/** @deprecated use setStepperToTarget */
export async function setStepperByIncrease(
  page: Page,
  id: string,
  target: number,
  step: number,
) {
  return setStepperToTarget(page, id, target, step)
}

export async function backdateRecoveryGroup(
  page: Page,
  recoveryGroup: string,
  hoursAgo: number,
) {
  await page.evaluate(
    async ({ recoveryGroup, hoursAgo }) => {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('WorkoutTrackerDB')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction('recoveryStates', 'readwrite')
          const store = tx.objectStore('recoveryStates')
          const getAll = store.getAll()
          getAll.onerror = () => reject(getAll.error)
          getAll.onsuccess = () => {
            const past = new Date(Date.now() - hoursAgo * 3_600_000).toISOString()
            for (const row of getAll.result as Array<Record<string, unknown>>) {
              if (row.recoveryGroup === recoveryGroup) {
                row.fatiguedAt = past
                store.put(row)
              }
            }
          }
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
      })
    },
    { recoveryGroup, hoursAgo },
  )
}

export async function logBenchSet(page: Page) {
  await setStepperByIncrease(page, 'weight-push-bench-press-me-1', 60, 2.5)
  await setStepperByIncrease(page, 'reps-push-bench-press-me-1', 8, 1)
  const logButton = page.getByRole('button', { name: 'Log set' })
  await expect(logButton).toBeEnabled({ timeout: 5000 })
  await logButton.click()
  await page.getByRole('button', { name: 'Undo set 1' }).waitFor()
}

export async function advanceToLastExercise(page: Page, steps: number) {
  for (let i = 0; i < steps; i++) {
    await page.getByRole('button', { name: 'Next', exact: true }).click()
  }
}
