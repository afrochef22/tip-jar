import React from "react";

const ClickSound = ({ children }) => {
	useEffect(() => {
		const sound = new Audio("/sounds/click-low.wav");
		sound.preload = "auto";
	}, []);
	const playSound = () => {
		const sound = new Audio("/sounds/click-low.wav"); // Replace 'my-sound.mp3' with your sound file path
		sound.play();
	};

	return <div onClick={playSound}>{children}</div>;
};

export default ClickSound;
