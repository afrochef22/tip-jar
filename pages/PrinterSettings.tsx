import React, { useEffect, useState } from "react";
import { Button, FormGroup, Input, Label } from "reactstrap";
import form from "../components/CreditTipForm.module.css";
import { PrintButton, PrintMessage, usePrintSlip } from "../components/PrintSlip";
import { cleanAddress, printedAtNow, savedPrinterAddress, savePrinterAddress } from "../lib/printer";
import { testSlip } from "../lib/receipt";

// The receipt printer's address, saved on this device only: the printer has a
// different address on each network (home, the venue).
export default function PrinterSettings() {
	const [address, setAddress] = useState("");
	const [saved, setSaved] = useState("");
	const [note, setNote] = useState("");
	const { printing, result, print } = usePrintSlip();

	// localStorage only exists in the browser, so read it after the first render.
	useEffect(() => {
		const current = savedPrinterAddress();
		setAddress(current);
		setSaved(current);
	}, []);

	const save = (): string | null => {
		const cleaned = cleanAddress(address);
		if (!cleaned) {
			setNote("That doesn't look like a printer address. It should look like 192.168.1.171.");
			return null;
		}
		if (!savePrinterAddress(cleaned)) {
			setNote("This browser wouldn't save the address (private browsing blocks it).");
			return null;
		}
		setAddress(cleaned);
		setSaved(cleaned);
		setNote(`Saved. This device will print to ${cleaned}.`);
		return cleaned;
	};

	// Test what is in the box, saving it first, so the test and the saved
	// address can't differ.
	const testPrint = () => {
		const cleaned = save();
		if (cleaned) print(testSlip(cleaned, printedAtNow()), cleaned);
	};

	return (
		<div className={form.page}>
			<h1 className={form.pageTitle}>Printer</h1>
			<section className={form.card}>
				<FormGroup className={form.field}>
					<Label for="PrinterAddress" className={form.label}>
						Printer IP address
					</Label>
					<Input
						id="PrinterAddress"
						type="text"
						inputMode="decimal"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						placeholder="192.168.1.171"
						value={address}
						onChange={(event) => {
							setAddress(event.target.value);
							setNote("");
						}}
					/>
				</FormGroup>
				<p>
					{saved
						? `This device prints to ${saved}.`
						: "No printer is set up on this device yet."}{" "}
					The address is saved on this device only and changes with the
					network, so set it again at each location.
				</p>
				{note && <p role="status">{note}</p>}
				<div className={form.actions}>
					<Button onClick={save} disabled={printing} className={form.primaryButton}>
						Save
					</Button>
					<PrintButton
						label="Test print"
						printing={printing}
						onClick={testPrint}
						className={form.backButton}
					/>
				</div>
			</section>
			<PrintMessage result={result} />
			<section className={form.card}>
				<h2 className={form.cardTitle}>First time on a new network</h2>
				<p>
					The printer and this device must be on the same network. Open{" "}
					{saved ? (
						<a href={`https://${saved}`} target="_blank" rel="noreferrer">
							https://{saved}
						</a>
					) : (
						"https://<printer address>"
					)}{" "}
					in this browser once and choose to visit the website despite the
					certificate warning. After that, Test print should work.
				</p>
			</section>
		</div>
	);
}
