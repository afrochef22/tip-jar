import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import Header from "../components/Header";

import "../styles/globals.css";

function MyApp({ Component, pageProps, router }) {
	const isNotIndexPage = router.pathname !== "/";

	const additionalFeatures = isNotIndexPage ? <Header /> : null;
	return (
		<div className="background-color">
			{additionalFeatures}
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
