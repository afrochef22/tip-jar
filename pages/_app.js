import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../components/fontawesom";
import Header from "../components/Header";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
	return (
		<div className="background-color">
			<Header />
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
