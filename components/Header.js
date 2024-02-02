"use client";

import { useState, useEffect } from "react";
import {
	Navbar,
	NavbarBrand,
	NavItem,
	Nav,
	Collapse,
	NavbarToggler,
} from "reactstrap";
import Link from "next/link";

const Header = () => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = () => {
		setIsOpen(!isOpen);
		const navbarToggler = document.querySelector(".navbar-toggler");
		navbarToggler.classList.toggle("active");
	};

	const [isMobile, setIsMobile] = useState(false);
	const updateScreenSize = () => {
		setIsMobile(window.innerWidth < 760);
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
				<Nav>
					<div className="navbar-toggler" onClick={handleToggle}>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="collapse-menue">
							<Collapse isOpen={isOpen} navbar>
								<NavItem>
									<Link className="navbar-link" href="/employees">
										Employees
									</Link>
								</NavItem>
								<NavItem className=" ">
									<Link className="navbar-link" href="/SelectWorkingEmployee">
										Select Employees
									</Link>
								</NavItem>

								<NavItem className=" ">
									<Link className="navbar-link" href="/cashTipCalculator">
										Cash Tip Calculator
									</Link>
								</NavItem>
							</Collapse>
						</div>
					</div>
				</Nav>
			) : (
				<Nav>
					<NavItem>
						<Link className="navbar-link" href="/employees">
							Employees
						</Link>
					</NavItem>
					<NavItem className=" ">
						<Link className="navbar-link" href="/SelectWorkingEmployee">
							Credit Card Tip Form
						</Link>
					</NavItem>
					<NavItem className=" ">
						<Link className="navbar-link" href="/CreditCardTipsCollected">
							Credit Card Tips Collected
						</Link>
					</NavItem>
				</Nav>
			)}
		</Navbar>
	);
};

export default Header;
