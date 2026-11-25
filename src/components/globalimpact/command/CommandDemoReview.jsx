export default function CommandDemoReview({ stage, onStageChange }) {
  return <details className="mc-review">
    <summary>Review &amp; Create Draft</summary>
    <div className="space-y-3 pt-3 text-sm">
      <p>Review the proposed steps above, then try each approval to see the pipeline advance.</p>
      <dl className="space-y-1"><div><dt className="inline font-semibold">Proposed owner: </dt><dd className="inline">Volunteer coordinator (unassigned)</dd></div><div><dt className="inline font-semibold">Milestone: </dt><dd className="inline">Four weekly deliveries logged and reviewed</dd></div></dl>
      {stage === 1 && <button type="button" className="mc-small-button" onClick={() => onStageChange(2)}>Approve sample plan</button>}
      {stage === 2 && <button type="button" className="mc-small-button" onClick={() => onStageChange(3)}>Create sample Mission draft</button>}
      {stage === 3 && <p role="status">Sample draft complete. Nothing was saved or published.</p>}
    </div>
  </details>;
}