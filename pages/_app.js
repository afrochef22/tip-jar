import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import { SessionProvider } from "next-auth/react";
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
			<SessionProvider session={session}>
				{header}
				<Component {...pageProps} />
				{footer}
			</SessionProvider>
		</div>
	);
}

export default MyApp;
