import { expect, test } from '@playwright/test'
import {
  advanceToLastExercise,
  backdateRecoveryGroup,
  logBenchSet,
  resetAppDatabase,
} from './helpers'

test.describe('Muscle recovery heat map', () => {
  test.beforeEach(async ({ page }) => {
    await resetAppDatabase(page)
  })

  test('marks trained muscles fatigued after workout then cools to recovering', async ({
    page,
  }) => {
    await page.goto('/workout/push')
    await page.getByRole('heading', { name: 'Barbell Flat Bench Press' }).waitFor()

    await logBenchSet(page)
    await advanceToLastExercise(page, 6)
    await page.getByTestId('finish-workout').click()
    await page.getByText('Workout complete').waitFor()

    await page.goto('/analytics')
    await page.getByTestId('recovery-dashboard').waitFor()

    const chest = page.getByTestId('recovery-group-chest')
    await expect(chest).toHaveAttribute('data-status', 'fatigued')
    await expect(page.getByTestId('recovery-group-triceps')).toHaveAttribute(
      'data-status',
      'fatigued',
    )

    const tricepsBefore = await page.getByTestId('recovery-group-triceps').getAttribute('data-status')
    expect(['fatigued', 'recovering']).toContain(tricepsBefore)

    await backdateRecoveryGroup(page, 'chest', 8)
    await page.reload()
    await page.getByTestId('recovery-dashboard').waitFor()

    await expect(page.getByTestId('recovery-group-chest')).toHaveAttribute(
      'data-status',
      'recovering',
    )

    await backdateRecoveryGroup(page, 'chest', 40)
    await page.reload()
    await page.getByTestId('recovery-dashboard').waitFor()

    await expect(page.getByTestId('recovery-group-chest')).toHaveAttribute(
      'data-status',
      'recovered',
    )
  })

  test('home page shows recovery badges for upcoming workout', async ({ page }) => {
    await page.goto('/workout/push')
    await logBenchSet(page)
    await advanceToLastExercise(page, 6)
    await page.getByTestId('finish-workout').click()
    await page.getByText('Workout complete').waitFor()

    await page.goto('/')
    await expect(page.getByRole('link', { name: /Push Day/i })).toBeVisible()
    await expect(page.locator('text=Chest').first()).toBeVisible({ timeout: 10_000 })
  })
})
