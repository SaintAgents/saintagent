export const commandDemo = {
  objective: 'Launch a four-week community garden pilot that can supply a neighborhood food pantry.',
  recommendation: 'Start with one garden and one pantry. Confirm their capacity before scheduling volunteers.',
  steps: ['Confirm a host garden and agree on a weekly pickup window with the pantry.', 'Recruit four volunteers and assign one person to log each delivery.', 'Complete four weekly deliveries and review the logs with the pantry.'],
  sources: [
    { kind: 'demo', id: 'garden', title: 'Sample garden inventory' },
    { kind: 'demo', id: 'pantry', title: 'Sample pantry intake notes' },
    { kind: 'demo', id: 'volunteers', title: 'Sample volunteer availability survey' },
  ],
  evidence: [
    { finding: 'The garden has two beds available, and the pantry can receive produce on Thursdays.', citations: [1, 2] },
    { finding: 'Four volunteers indicated Thursday availability, but none has committed to a shift.', citations: [3] },
  ],
  questions: ['Who will confirm the first pickup and serve as the pantry’s point of contact?', 'What produce can the garden reliably supply each week?'],
};