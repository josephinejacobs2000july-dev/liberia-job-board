// Shown until a database is connected, so the owner knows the one remaining step.
export function SetupNotice() {
  return (
    <div className="notice warn">
      <p>
        <b>Preview mode.</b> These are example jobs. To let employers post real vacancies and job seekers apply, connect a free
        database:
      </p>
      <ol>
        <li>In Vercel, open this project and go to the <b>Storage</b> tab.</li>
        <li>Click <b>Create Database</b>, choose <b>Neon</b> (free plan) and follow the steps to connect it to this project.</li>
        <li>Go to <b>Deployments</b>, open the menu (⋯) on the latest one and click <b>Redeploy</b>.</li>
      </ol>
      <p>The board sets up everything else by itself.</p>
    </div>
  );
}
