// fontawesome.js

import { config, library } from "@fortawesome/fontawesome-svg-core";
import {
	faSackDollar,
	faMoneyBill1,
	faCalculator,
	faClock,
	faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

// Required alongside the manual "@fortawesome/fontawesome-svg-core/styles.css"
// import in _app.js: without this, Font Awesome injects its own <style> tag
// and recalculates icon sizing on the client, causing the SSR'd <svg> markup
// to mismatch what React hydrates with.
config.autoAddCss = false;

library.add(faSackDollar, faDollarSign, faMoneyBill1, faCalculator, faClock);
