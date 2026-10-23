// Next.js calls this for any server error nothing else caught, so those reach
// the alert email too. Errors that routes catch themselves go through
// reportError directly.
export async function onRequestError(error, request) {
	if (process.env.NEXT_RUNTIME !== "nodejs") return;
	const { reportError } = await import("./lib/alert");
	await reportError(`Uncaught error on ${request.method} ${request.path?.split("?")[0]}`, error);
}
