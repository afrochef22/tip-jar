// MongoDB projections for employee documents sent to the browser through
// getServerSideProps. Everything returned there ends up in the page source.

// Public (logged-out) pages. Only what the shift flow needs to show names and
// roles. Never add password, token, email or username here.
export const PUBLIC_EMPLOYEE_FIELDS = {
	firstName: 1,
	lastName: 1,
	position: 1,
	active: 1,
};

// Public spreadsheet pages also need each employee's tip history.
export const PUBLIC_EMPLOYEE_TIP_FIELDS = {
	...PUBLIC_EMPLOYEE_FIELDS,
	tipsCollected: 1,
};

// Manager pages: everything except secrets.
export const MANAGER_EMPLOYEE_FIELDS = { password: 0, token: 0 };
