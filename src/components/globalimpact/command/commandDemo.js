export const commandDemo = {
  objective: 'Launch a four-week community garden pilot that can supply a neighborhood food pantry.',
  recommendation: 'Start with one garden and one pantry. Confirm their capacity before scheduling volunteers.',
  steps: ['Confirm a host garden and agree on a weekly pickup window with the pantry.', 'Recruit four volunteers and assign one person to log each delivery.', 'Complete four weekly deliveries and review the logs with the pantry.'],
  sources: [
    { kind: 'demo', id: 'garden', type: 'Inventory', title: 'Sample garden inventory', date: '2026-11-16T12:00:00Z', matched: ['raised beds', 'harvest'], excerpt: 'Two raised beds are available. Current crops are kale and chard. No weekly harvest weights have been recorded.' },
    { kind: 'demo', id: 'pantry', type: 'Intake notes', title: 'Sample pantry intake notes', date: '2026-11-18T12:00:00Z', matched: ['Thursday', 'produce intake'], excerpt: 'The pantry accepts fresh produce Thursdays, 3–5 p.m. Deliveries must include the date, crop, and weight. Call ahead for the first pickup.' },
    { kind: 'demo', id: 'volunteers', type: 'Survey', title: 'Sample volunteer availability survey', date: '2026-11-19T12:00:00Z', matched: ['Thursday', 'volunteers'], excerpt: 'Four respondents checked Thursday afternoon. The form measured availability only and did not ask for a shift commitment.' },
    { kind: 'demo', id: 'transport', type: 'Operations log', title: 'Sample transport and equipment log', date: '2026-11-20T12:00:00Z', matched: ['crates', 'pickup'], excerpt: 'Two reusable crates and a scale are available at the garden. No driver is assigned for Thursdays.' },
    { kind: 'demo', id: 'deliveries', type: 'Delivery log', title: 'Sample delivery log template', date: '2026-11-21T12:00:00Z', matched: ['weight', 'weekly deliveries'], excerpt: 'The template tracks delivery date, crop, weight, and pantry receipt. It is blank and does not document completed deliveries.' },
    { kind: 'demo', id: 'funding', type: 'Funding notice', title: 'Sample neighborhood microgrant notice', date: '2026-11-22T12:00:00Z', matched: ['community gardens'], excerpt: 'The notice lists a possible grant for community gardens. Eligibility and availability have not been confirmed for this pilot.' },
  ],
  evidence: [
    { finding: 'The garden has two beds available, and the pantry can receive produce on Thursdays.', citations: [1, 2] },
    { finding: 'Four volunteers indicated Thursday availability, but none has committed to a shift.', citations: [3] },
    { finding: 'Crates and a scale are available, but a Thursday driver is still needed.', citations: [4] },
    { finding: 'The delivery template captures what the pantry needs, but no deliveries have been logged.', citations: [2, 5] },
    { finding: 'The inventory has no recorded harvest weights, and the blank delivery log provides no baseline for a weekly supply target.', citations: [1, 5] },
  ],
  questions: ['Who will drive on Thursdays and confirm the first pickup with the pantry?', 'How much produce can the garden reliably supply each week?'],
};

export const commandDemoPlan = {
  direction: 'prepare_mission',
  first_action: commandDemo.steps[0],
  collaboration: 'Volunteer coordinator (unassigned)',
  milestone: 'Four weekly deliveries logged and reviewed',
};