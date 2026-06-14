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
          target('pec-sternocostal', 'Pectoralis Major - Sternocostal head', 'chest'),
          target('lat-triceps', 'Lateral Triceps', 'triceps'),
        ],
        restSeconds: 180,
        defaultSets: 4,
      },
      {
        id: 'push-incline-db-press',
        name: 'Incline DB Press',
        targets: [target('pec-clavicular', 'Pectoralis Major - Clavicular head', 'chest')],
        restSeconds: 120,
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
        id: 'push-lateral-raise',
        name: 'Standing Cable Lateral Raise',
        targets: [target('lat-delt', 'Lateral Deltoid', 'shoulders')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'push-hi-lo-cable',
        name: 'High to Low Cable',
        targets: [target('pec-stern-lower', 'Pectoralis Major - Lower fibers', 'chest')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'push-oh-triceps',
        name: 'Overhead Dumbbell Triceps Extension',
        targets: [target('tri-long', 'Triceps Brachii - Long head', 'triceps')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'push-triceps-pushdown',
        name: 'Cable Triceps Pushdowns',
        targets: [
          target('tri-lat-med', 'Triceps Brachii - Lateral & Medial heads', 'triceps'),
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
        targets: [target('lats-thoracic', 'Latissimus Dorsi - Thoracic fibers', 'back')],
        restSeconds: 120,
        defaultSets: 4,
      },
      {
        id: 'pull-cable-row',
        name: 'Single-Arm Neutral Grip Cable Row',
        targets: [target('lats-iliac', 'Latissimus Dorsi - Iliac/Lumbar fibers', 'back')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'pull-chest-supported-db-row',
        name: 'Chest Supported DB Row',
        targets: [target('rhomboids', 'Rhomboids & Mid-Trapezius', 'back')],
        restSeconds: 120,
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
        targets: [target('bi-long', 'Biceps Brachii - Long head', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'pull-preacher-curl',
        name: 'Preacher Curl',
        targets: [target('bi-short', 'Biceps Brachii - Short head', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'pull-hammer-curl',
        name: 'Dumbbell Hammer Curl',
        targets: [target('brachialis', 'Brachialis & Brachioradialis', 'biceps')],
        restSeconds: 60,
        defaultSets: 3,
      },
    ],
  },
  {
    id: 'legs-abs',
    dayNumber: 3,
    name: 'Legs & Abs',
    focus: 'Lower Body Isolation',
    exercises: [
      {
        id: 'legs-extensions',
        name: 'Seated Leg Extensions',
        targets: [target('rect-fem', 'Rectus Femoris', 'quads')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'legs-hack-squat',
        name: 'Hack Squat or Barbell Squat',
        targets: [
          target('vast-lat-int', 'Vastus Lateralis & Intermedius', 'quads'),
        ],
        restSeconds: 180,
        defaultSets: 4,
      },
      {
        id: 'legs-leg-press-low',
        name: 'Leg Press (Low Stance)',
        targets: [target('vast-med', 'Vastus Medialis - Teardrop', 'quads')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'legs-hip-thrust',
        name: 'Barbell Hip Thrust',
        targets: [target('glute-max', 'Gluteus Maximus', 'glutes')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'legs-rdl',
        name: 'Romanian Deadlift',
        targets: [target('ham-semi', 'Inner Hamstrings - Semitendinosus', 'hamstrings')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'legs-lying-curl',
        name: 'Lying Leg Curl',
        targets: [target('ham-bf', 'Outer Hamstrings - Biceps Femoris', 'hamstrings')],
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
        targets: [target('abs-upper', 'Rectus Abdominis - Upper Fibers', 'abs')],
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
        id: 'upper-barbell-row',
        name: 'Barbell Row',
        targets: [target('mid-back-lats', 'Mid-Back & Lats', 'back')],
        restSeconds: 120,
        defaultSets: 4,
      },
      {
        id: 'upper-db-bench',
        name: 'Flat Dumbbell Bench Press',
        targets: [target('stern-chest', 'Sternocostal Chest', 'chest')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'upper-lat-pulldown',
        name: 'Lat Pulldown',
        targets: [target('lower-lats', 'Lower Lats', 'back')],
        restSeconds: 90,
        defaultSets: 3,
      },
      {
        id: 'upper-oh-press',
        name: 'Standing Overhead Barbell Press',
        targets: [target('ant-delt-upper', 'Anterior Deltoid', 'shoulders')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'upper-lateral-raise',
        name: 'Dumbbell Lateral Raise',
        targets: [target('lat-delt-upper', 'Lateral Deltoid', 'shoulders')],
        restSeconds: 60,
        defaultSets: 3,
      },
      {
        id: 'upper-arm-superset',
        name: 'Bicep/Tricep Cable Superset',
        targets: [target('arms-overload', 'Arms Overload', 'biceps')],
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
        id: 'lower-rdl',
        name: 'Romanian Deadlift',
        targets: [target('total-hams', 'Total Hamstrings', 'hamstrings')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'lower-leg-press',
        name: 'Leg Press (Full Depth)',
        targets: [target('quads-overload', 'Quads Overload', 'quads')],
        restSeconds: 120,
        defaultSets: 3,
      },
      {
        id: 'lower-seated-curl',
        name: 'Seated Leg Curl',
        targets: [target('ham-knee-flex', 'Hamstring Knee-Flexion', 'hamstrings')],
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
            'Rectus Abdominis - Lower Fibers & Transversus Abdominis',
            'abs',
          ),
        ],
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
