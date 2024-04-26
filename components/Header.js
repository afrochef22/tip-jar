"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

import {
	Navbar,
	NavbarBrand,
	NavItem,
	Nav,
	Collapse,
	NavbarToggler,
} from "reactstrap";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";

library.add(faCalculator);

const Header = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session } = useSession();

	const handleToggle = () => {
		setIsOpen(!isOpen);
		const navbarToggler = document.querySelector(".navbar-toggler");
		navbarToggler.classList.toggle("active");
	};

	const [isMobile, setIsMobile] = useState(false);
	const updateScreenSize = () => {
		setIsMobile(window.innerWidth < 760);
	};

	const router = useRouter();

	const handleSignOut = async () => {
		await signOut(); // Trigger the sign-in process
		router.push("/");
	};

	// Use useEffect to update screen size on mount and window resize
	useEffect(() => {
		updateScreenSize();
		window.addEventListener("resize", updateScreenSize);
		return () => {
			window.removeEventListener("resize", updateScreenSize);
		};
	}, []);

	return (
		<Navbar className="navbar" sticky="top" expand="md">
			<Link className="logo" href="/">
				TipJar
			</Link>
			{isMobile ? (
				<div>
					<Link className="navbar-link" href="/SelectWorkingEmployee">
						Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
					</Link>
					<Link className="navbar-link" href="/CashTipCalculator">
						Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
					</Link>
					<Link className="navbar-link" href="/CCTipsTotals">
						CC Tip Totals
					</Link>
					{/* <Link className="navbar-link" href="/getAllTipBreakDowns">
						Tip Breakdown
					</Link> */}
				</div>
			) : (
				<></>
			)}

			{isMobile ? (
				<></>
			) : (
				// <Nav>
				// 	<div className="navbar-toggler" onClick={handleToggle}>
				// 		<div className="bar"></div>
				// 		<div className="bar"></div>
				// 		<div className="bar"></div>
				// 		<div className="collapse-menue">
				// 			<Collapse isOpen={isOpen} navbar>
				// 				<NavItem className="navbar-link-mobile">
				// 					<Link className="navbar-link" href="/SelectWorkingEmployee">
				// 						Credit <FontAwesomeIcon icon=" fa-calculator" />
				// 					</Link>
				// 				</NavItem>

				// 				<NavItem className="navbar-link-mobile ">
				// 					<Link className="navbar-link" href="/CashTipCalculator">
				// 						Cash <FontAwesomeIcon icon=" fa-calculator" />
				// 					</Link>
				// 				</NavItem>
				// 			</Collapse>
				// 		</div>
				// 	</div>
				// </Nav>
				<Nav>
					<NavItem className=" ">
						<Link className="navbar-link" href="/SelectWorkingEmployee">
							Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
						</Link>
					</NavItem>
					<NavItem className=" ">
						<Link className="navbar-link" href="/CashTipCalculator">
							Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
						</Link>
					</NavItem>
					<NavItem>
						<Link className="navbar-link" href="/CCTipsTotals">
							CC Tip Totals
						</Link>
					</NavItem>
					{session ? (
						<NavItem>
							<button onClick={handleSignOut}>Sign out</button>
						</NavItem>
					) : (
						<></>
					)}

					{/* <NavItem>
						<Link className="navbar-link" href="/getAllTipBreakDowns">
							Tip Breakdown
						</Link>
					</NavItem> */}
				</Nav>
			)}
		</Navbar>
	);
};

export default Header;
