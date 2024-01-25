import Link from "next/link";
import { navigate } from "next/navigation";
import DeleteBartenderButton from "./DeleteBartenderButton";

const Bartenders = ({ bartenders }) => {
	return (
		<div>
			<h1>Bartenders</h1>
			{bartenders.map((bartender) => (
				<div key={bartender._id}>
					<p>
						<Link href={`/getBartender/${bartender._id}`}>
							{`${bartender.firstName} ${bartender.lastName}`}
						</Link>
					</p>

					<div>
						<DeleteBartenderButton id={bartender._id} />
					</div>
				</div>
			))}
			<button>
				<Link href={"/addBartender"}>Add Bartender</Link>
			</button>
		</div>
	);
};

export default Bartenders;
