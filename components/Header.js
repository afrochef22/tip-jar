"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, Col, Container, Row } from "reactstrap";
import UserName from "./UserName";
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

const Header = ({ user }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session } = useSession();
	const User = () => {
		if (session) {
			return <div>{session.user.name || session.user.email}</div>;
		} else {
			return <></>;
		}
	};

	const handleToggle = () => {
		setIsOpen(!isOpen);
		const navbarToggler = document.querySelector(".navbar-toggler");
		navbarToggler.classList.toggle("active");
	};

	const [isMobile, setIsMobile] = useState(false);
	const [isSmall, setIsSmall] = useState(false);
	const updateScreenSize = () => {
		setIsMobile(window.innerWidth < 760);
		setIsSmall(window.innerWidth < 500);
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
			<Col>
				<Link className="logo" href="/">
					TipJar
				</Link>
				<UserName />
			</Col>
			{session ? (
				<Link className="navbar-link " href="/Dashboard">
					Dashboard
				</Link>
			) : (
				<>
					<Link className="navbar-link" href="/SelectWorkingEmployee">
						Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
					</Link>
					<Link className="navbar-link" href="/CashTipCalculator">
						Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
					</Link>
				</>
			)}
			{isMobile ? (
				<div>
					<div className="navbar-toggler" onClick={handleToggle}>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="collapse-menue">
							<Collapse isOpen={isOpen} navbar>
								<Link className="navbar-link  " href="/CCTipsTotals">
									CC Tip Totals
								</Link>
								{session ? (
									<>
										<Link
											className="navbar-link "
											href="/SelectWorkingEmployee"
										>
											Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
										</Link>
										<Link className="navbar-link" href="/CashTipCalculator">
											Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
										</Link>
										{isSmall ? <div className="spacer"></div> : <></>}
										<Link className="navbar-link" href="/employees">
											Employees{" "}
										</Link>
									</>
								) : (
									<></>
								)}
								{session ? (
									<div>
										<Button
											className="navbar-link m-2 "
											onClick={handleSignOut}
										>
											Sign out
										</Button>
									</div>
								) : (
									<div>
										<Button className="navbar-link m-2" onClick={handleSignIn}>
											Sign In
										</Button>
									</div>
								)}
							</Collapse>
						</div>
					</div>
				</div>
			) : (
				<>
					<Link className="navbar-link " href="/CCTipsTotals">
						CC Tip Totals
					</Link>
					{session ? (
						<>
							<Link className="navbar-link" href="/SelectWorkingEmployee">
								Credit <FontAwesomeIcon icon={["fas", "calculator"]} />
							</Link>
							<Link className="navbar-link" href="/CashTipCalculator">
								Cash <FontAwesomeIcon icon={["fas", "calculator"]} />
							</Link>
							<Link className="navbar-link" href="/employees">
								Employees{" "}
							</Link>
						</>
					) : (
						<></>
					)}
					<Nav>
						{session ? (
							<Button className="navbar-link" onClick={handleSignOut}>
								Sign out
							</Button>
						) : (
							<NavItem>
								<Button className="navbar-link" onClick={handleSignIn}>
									Sign In
								</Button>
							</NavItem>
						)}
					</Nav>
				</>
			)}
		</Navbar>
	);
};

export default Header;
