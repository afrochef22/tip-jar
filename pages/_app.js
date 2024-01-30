import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import Header from "../components/Header";

import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps, router }) {
	const isNotIndexPage = router.pathname !== "/";

	const additionalFeatures = isNotIndexPage ? <Header /> : null;
	return (
		<div className="background-color">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Italiana&display=swap"
					rel="stylesheet"
				/>
			</Head>
			{additionalFeatures}
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
