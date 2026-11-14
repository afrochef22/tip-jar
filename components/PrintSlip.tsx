import { useState } from "react";
import Link from "next/link";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faSpinner } from "@fortawesome/free-solid-svg-icons";
import style from "./TipBreakDown.module.css";
import { printSlip } from "../lib/printer";
import type { PrintResult } from "../lib/printer";
import type { SlipLine } from "../lib/receipt";

// Sends a slip to the printer and keeps the outcome. The button and the
// message are separate so a page can put them in different places.
export function usePrintSlip() {
	const [printing, setPrinting] = useState(false);
	const [result, setResult] = useState<PrintResult | null>(null);

	// `address` is only passed by the settings page, to test before saving.
	const print = async (lines: SlipLine[], address?: string) => {
		if (printing) return;
		setPrinting(true);
		setResult(null);
		setResult(await printSlip(lines, address));
		setPrinting(false);
	};

	return { printing, result, print };
}

export function PrintButton({
	label,
	printing,
	onClick,
	className,
}: {
	label: string;
	printing: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<Button onClick={onClick} disabled={printing} className={className}>
			{printing ? (
				<>
					<FontAwesomeIcon icon={faSpinner} spin /> Printing...
				</>
			) : (
				<>
					<FontAwesomeIcon icon={faPrint} /> {label}
				</>
			)}
		</Button>
	);
}

export function PrintMessage({ result }: { result: PrintResult | null }) {
	if (!result) return null;
	return (
		<div
			className={`${style.notice} ${result.ok ? style.noticeWarning : style.noticeDanger}`}
			role={result.ok ? "status" : "alert"}
		>
			{result.message}
			{result.needsSetup && (
				<>
					{" "}
					<Link href="/PrinterSettings">Open printer settings</Link>
				</>
			)}
			{result.trustUrl && (
				<>
					{" "}
					<a href={result.trustUrl} target="_blank" rel="noreferrer">
						Open the printer&apos;s page ({result.trustUrl})
					</a>
				</>
			)}
		</div>
	);
}
