import type { WorkoutDay } from '../types'
import { target } from './muscleGroups'

export const WORKOUT_PROGRAM: WorkoutDay[] = [
  {
    id: 'push',
    dayNumber: 1,
    name: 'Push Day',
    focus: 'Anterior & Extension',
    exercises: [
      {
        id: 'push-bench-press',
        name: 'Barbell Flat Bench Press',
        targets: [
          target('pec-sternocostal', 'Sternocostal Chest', 'chest'),
          target('lat-triceps', 'Lateral Triceps', 'triceps'),
        ],
        restSeconds: 180,
        defaultSets: 4,
      },
      {
        id: 'push-incline-db-press',
        name: 'Incline Dumbbell Press',
        targets: [target('pec-clavicular', 'Clavicular Chest', 'chest')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'push-lateral-raise',
        name: 'Standing Cable Lateral Raise',
        targets: [target('lat-delt', 'Lateral Deltoid', 'shoulders')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'push-shoulder-press',
        name: 'Seated Dumbbell Shoulder Press',
        targets: [target('ant-delt', 'Anterior Deltoid', 'shoulders')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'push-hi-lo-cable',
        name: 'High to Low Cable Flye',
        targets: [target('pec-stern-lower', 'Lower Pec Fibers', 'chest')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'push-cable-tricep-extension',
        name: 'Cable Tricep Extension',
        targets: [target('tri-long', 'Triceps Long Head', 'triceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'push-triceps-pushdown',
        name: 'Cable Triceps Pushdowns',
        targets: [
          target('tri-lat-med', 'Triceps Lateral & Medial Heads', 'triceps'),
        ],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
  {
    id: 'pull',
    dayNumber: 2,
    name: 'Pull Day',
    focus: 'Posterior & Flexion',
    exercises: [
      {
        id: 'pull-lat-pulldown',
        name: 'Wide-Grip Lat Pulldown',
        targets: [target('lats-thoracic', 'Thoracic Lats', 'back')],
        restSeconds: 120,
        defaultSets: 4,
      },
      {
        id: 'pull-chest-supported-db-row',
        name: 'Chest Supported Dumbbell Row',
        targets: [target('rhomboids', 'Rhomboids & Mid-Traps', 'back')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'pull-cable-row',
        name: 'Single-Arm Neutral Grip Cable Row',
        targets: [target('lats-iliac', 'Iliac/Lumbar Lats', 'back')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'pull-rear-delt-fly',
        name: 'Rear Delt Cable Flyes',
        targets: [target('post-delt', 'Posterior Deltoid', 'shoulders')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'pull-bayesian-curl',
        name: 'Bayesian Curl',
        targets: [target('bi-long', 'Biceps Long Head', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'pull-preacher-curl',
        name: 'Preacher Curl',
        targets: [target('bi-short', 'Biceps Short Head', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'pull-reverse-grip-curl',
        name: 'Reverse Grip Curl',
        targets: [target('brachioradialis', 'Brachioradialis & Brachialis', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
  {
    id: 'legs-abs',
    dayNumber: 3,
    name: 'Legs & Abs',
    focus: 'High-Efficiency Lower Body',
    exercises: [
      {
        id: 'legs-extensions',
        name: 'Seated Leg Extensions',
        targets: [target('rect-fem', 'Rectus Femoris Pre-Exhaust', 'quads')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'legs-hack-squat',
        name: 'Barbell Squat',
        targets: [
          target('total-quads-glutes-legs', 'Total Quads & Glutes', 'quads'),
          target('glute-squat', 'Gluteus Maximus', 'glutes'),
        ],
        restSeconds: 180,
        defaultSets: 3,
      },
      {
        id: 'legs-rdl',
        name: 'Romanian Deadlift',
        targets: [
          target('ham-semi', 'Hamstrings', 'hamstrings'),
          target('glute-rdl', 'Glutes', 'glutes'),
        ],
        restSeconds: 120,
        defaultSets: 3,
        alternateWeek: 'A',
      },
      {
        id: 'legs-hip-thrust',
        name: 'Barbell Hip Thrust',
        targets: [target('glute-max', 'Glutes', 'glutes')],
        restSeconds: 120,
        defaultSets: 3,
        alternateWeek: 'B',
      },
      {
        id: 'legs-seated-curl',
        name: 'Seated Leg Curl',
        targets: [target('ham-knee', 'Hamstring Knee Flexion', 'hamstrings')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'legs-calf-raise',
        name: 'Standing Calf Raises',
        targets: [target('gastro', 'Gastrocnemius', 'calves')],
        restSeconds: 60,
        defaultSets: 4,
      },
      {
        id: 'legs-cable-crunch',
        name: 'Weighted Rope Cable Crunches',
        targets: [target('abs-upper', 'Upper Rectus Abdominis', 'abs')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'legs-woodchopper',
        name: 'Cable Woodchopper',
        targets: [target('abs-oblique', 'Obliques & Transversus Abdominis', 'abs')],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
  {
    id: 'upper',
    dayNumber: 4,
    name: 'Upper Day',
    focus: 'Antagonist Compound Duels',
    exercises: [
      {
        id: 'upper-db-bench',
        name: 'Flat Dumbbell Bench Press',
        sectionLabel: 'Duel 1 · Horizontal',
        targets: [target('stern-chest', 'Sternocostal Chest', 'chest')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'upper-chest-supported-row',
        name: 'Chest-Supported Dumbbell Row',
        sectionLabel: 'Duel 1 · Horizontal',
        targets: [target('rhomboids-upper', 'Rhomboids & Mid-Traps', 'back')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'upper-shoulder-press',
        name: 'Seated Dumbbell or Smith Machine Shoulder Press',
        sectionLabel: 'Duel 2 · Vertical',
        targets: [target('ant-delt-upper', 'Anterior Deltoid', 'shoulders')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'upper-close-grip-pulldown',
        name: 'Close-Grip Neutral Lat Pulldown',
        sectionLabel: 'Duel 2 · Vertical',
        targets: [target('lower-lats', 'Lower Lats', 'back')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'upper-cable-lateral-raise',
        name: 'Cable Lateral Raise',
        sectionLabel: 'Finisher · Isolation',
        targets: [target('lat-delt-upper', 'Lateral Deltoid', 'shoulders')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'upper-cable-curl',
        name: 'Cable Bicep Curls',
        sectionLabel: 'Finisher · Isolation',
        targets: [target('bi-cable', 'Total Biceps', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'upper-cable-pushdown',
        name: 'Cable Triceps Pushdowns',
        sectionLabel: 'Finisher · Isolation',
        targets: [
          target('tri-lat-med-upper', 'Triceps Lateral & Medial Heads', 'triceps'),
        ],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
  {
    id: 'lower-abs',
    dayNumber: 5,
    name: 'Lower Day & Abs',
    focus: 'Heavy Axial Loading',
    exercises: [
      {
        id: 'lower-back-squat',
        name: 'Barbell Back Squat',
        targets: [target('total-quads-glutes', 'Total Quads & Glutes', 'quads')],
        restSeconds: 180,
        defaultSets: 4,
      },
      {
        id: 'lower-leg-press',
        name: 'Leg Press (Full Depth)',
        targets: [target('quads-overload', 'Quad Overload', 'quads')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'lower-rdl',
        name: 'Romanian Deadlift',
        targets: [target('total-hams', 'Total Hamstrings', 'hamstrings')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'lower-seated-curl',
        name: 'Seated Leg Curl',
        targets: [target('ham-knee-flex', 'Hamstring Knee Flexion', 'hamstrings')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'lower-seated-calf',
        name: 'Seated Calf Raise',
        targets: [target('soleus', 'Soleus', 'calves')],
        restSeconds: 60,
        defaultSets: 4,
      },
      {
        id: 'lower-hanging-leg-raise',
        name: 'Hanging Leg Raises',
        targets: [
          target(
            'abs-lower',
            'Lower Rectus Abdominis & Transversus Abdominis',
            'abs',
          ),
        ],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'lower-cable-crunch',
        name: 'Cable Crunches',
        targets: [target('abs-upper-lower', 'Upper Rectus Abdominis', 'abs')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'lower-woodchopper',
        name: 'Cable Woodchopper',
        targets: [target('abs-oblique-lower', 'Obliques & Transversus Abdominis', 'abs')],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
]

export function getWorkoutDay(id: string): WorkoutDay | undefined {
  return WORKOUT_PROGRAM.find((d) => d.id === id)
}

export function getExercise(exerciseId: string) {
  for (const day of WORKOUT_PROGRAM) {
    const exercise = day.exercises.find((e) => e.id === exerciseId)
    if (exercise) return { exercise, day }
  }
  return undefined
}
