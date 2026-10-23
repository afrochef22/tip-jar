import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import AuthProvider from "./Providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps }, router }) {
	// Full-screen pages with no header or footer.
	const showChrome = ![
		"/",
		"/TokenExpired",
		"/signin",
		"/forgot-password",
		"/reset-password/[id]",
		"/RegisterPage/[id]",
	].includes(router.pathname);

	const header = showChrome ? <Header /> : null;
	const footer = showChrome ? <Footer /> : null;
	return (
		<div className="background-color">
			<AuthProvider>
				{header}
				<Component {...pageProps} />
				{footer}
			</AuthProvider>
		</div>
	);
}

export default MyApp;
