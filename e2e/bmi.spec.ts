import { expect, test } from '@playwright/test'
import { resetAppDatabase, setStepperByIncrease, setStepperToTarget } from './helpers'

test.describe('BMI and weight tracker', () => {
  test.beforeEach(async ({ page }) => {
    await resetAppDatabase(page)
  })

  test('completes setup and saves daily weight with BMI', async ({ page }) => {
    await page.goto('/weight')
    await page.getByTestId('bmi-setup').waitFor()

    await setStepperByIncrease(page, 'setup-weight-me', 75, 0.5)
    await setStepperByIncrease(page, 'setup-weight-partner', 58, 0.5)
    await page.getByRole('button', { name: 'Start BMI Tracking' }).click()

    await page.getByTestId('bmi-tracker').waitFor()
    await expect(page.getByText('BMI Tracker')).toBeVisible()
    await expect(page.getByTestId('bmi-value-me')).toHaveText('26')
    await expect(page.getByTestId('bmi-value-partner')).toHaveText('21.3')

    await setStepperToTarget(page, 'body-me', 74, 0.5)
    await page.getByTestId('save-weight').click()

    await expect(page.getByTestId('bmi-value-me')).toHaveText('25.6')
    await expect(page.getByTestId('bmi-value-partner')).toHaveText('21.3')
  })

  test('allows editing height and updates BMI', async ({ page }) => {
    await page.goto('/weight')

    await setStepperByIncrease(page, 'setup-weight-me', 80, 0.5)
    await setStepperByIncrease(page, 'setup-weight-partner', 60, 0.5)
    await page.getByRole('button', { name: 'Start BMI Tracking' }).click()
    await page.getByTestId('bmi-tracker').waitFor()

    await page.getByRole('button', { name: 'Edit height' }).click()
    await setStepperByIncrease(page, 'edit-height-me', 175, 1)
    await page.getByRole('button', { name: 'Save height' }).click()

    await expect(page.getByText('175 cm')).toBeVisible()
    await expect(page.getByTestId('bmi-value-me')).toHaveText('26.1')
  })
})
