import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import AuthProvider from "./Providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/globals.css";
import { session } from "passport";

function MyApp({ Component, pageProps: { session, ...pageProps }, router }) {
	const isNotIndexPage = router.pathname !== "/";

	const header = isNotIndexPage ? <Header /> : null;
	const footer = isNotIndexPage ? <Footer /> : null;
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
