"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, Col, Container, Row } from "reactstrap";

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
	};

	const handleSignIn = async () => {
		await signIn(); // Trigger the sign-in process
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
			<Link className="navbar-link" href="/SelectWorkingEmployee">
				Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
			</Link>
			<Link className="navbar-link" href="/CashTipCalculator">
				Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
			</Link>

			{isMobile ? (
				<div>
					<div className="navbar-toggler" onClick={handleToggle}>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="collapse-menue">
							<Collapse isOpen={isOpen} navbar>
								<Link className="navbar-link " href="/CCTipsTotals">
									CC Tip Totals
								</Link>
								{session ? (
									<div className="navbar-link mt-1" onClick={handleSignOut}>
										Sign out
									</div>
								) : (
									<div className="navbar-link mt-1" onClick={handleSignIn}>
										Sign In
									</div>
								)}
							</Collapse>
						</div>
					</div>
				</div>
			) : (
				<></>
			)}

			{isMobile ? (
				<></>
			) : (
				<>
					<Link className="navbar-link " href="/CCTipsTotals">
						CC Tip Totals
					</Link>
					<Nav>
						{session ? (
							<div className="navbar-link" onClick={handleSignOut}>
								Sign out
							</div>
						) : (
							<NavItem>
								<div className="navbar-link" onClick={handleSignIn}>
									Sign In
								</div>
							</NavItem>
						)}
					</Nav>
				</>
			)}
		</Navbar>
	);
};

export default Header;
