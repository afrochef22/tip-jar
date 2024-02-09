import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/globals.css";

function MyApp({ Component, pageProps, router }) {
	const isNotIndexPage = router.pathname !== "/";

	const header = isNotIndexPage ? <Header /> : null;
	const footer = isNotIndexPage ? <Footer /> : null;
	return (
		<div className="background-color">
			{header}
			<Component {...pageProps} />
			{footer}
		</div>
	);
}

export default MyApp;
