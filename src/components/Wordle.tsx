import {useEffect, useState} from "react";
import {motion} from "framer-motion";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./keyboards.css";

const useMountEffect = (func: () => void) => useEffect(func, [func]);
const useFadeEffect = (func: () => void, params: any[]) => useEffect(func, [func, ...params]);

export function Wordle(props: {chosenWord: string; possibleWorlds: string[]}) {
	const [tries, setTries] = useState<string[]>([]);
	const [currentTry, setCurrentTry] = useState("");
	const [greenButtons, setGreenButtons] = useState<string[]>([]);
	const [yellowButtons, setYellowButtons] = useState<string[]>([]);
	const [grayButtons, setGrayButtons] = useState<string[]>([]);
	const [invalidWordTransition, setInvalidWordTransition] = useState(false);

	const keyboardLayout = {
		default: ["Q W E R T Y U I O P", "A S D F G H J K L", "{enter} Z X C V B N M {bksp}"],
	};

	function keyPress(event: KeyboardEvent) {
		const key = event.key.toUpperCase();

		if (currentTry.length < 5) {
			if (key.length === 1 && /[A-Z]{1}/.test(key)) {
				setCurrentTry((previous) => previous + key);
			}
		}

		if (key === "BACKSPACE" || key === "DELETE") {
			setCurrentTry((previous) => previous.slice(0, previous.length - 1));
		}

		if (key === "ENTER" && currentTry.length === 5) {
			if (props.possibleWorlds.includes(currentTry)) {
				setTries((previous) => previous.concat([currentTry]));
				setCurrentTry("");
			} else {
				setInvalidWordTransition(true);
			}
		}
	}

	function getButtonThemes() {
		const themes = [];
		if (greenButtons.length > 0) themes.push({class: "hg-green", buttons: greenButtons.join(" ")});
		if (yellowButtons.length > 0) themes.push({class: "hg-yellow", buttons: yellowButtons.join(" ")});
		if (grayButtons.length > 0) themes.push({class: "hg-gray", buttons: grayButtons.join(" ")});

		return themes;
	}

	useFadeEffect(() => {
		setTimeout(() => {
			setInvalidWordTransition(false);
		}, 3000);
	}, [invalidWordTransition]);

	useMountEffect(() => {
		document.addEventListener("keypress", keyPress);

		return () => {
			document.removeEventListener("keypress", keyPress);
		};
	});

	useEffect(() => {
		if (tries.length > 0 && tries[tries.length - 1].toUpperCase() === props.chosenWord.toUpperCase()) {
			document.dispatchEvent(new Event("gameWon"));
		} else if (tries.length === 6) {
			document.dispatchEvent(new Event("gameLost"));
		}
	}, [tries, props.chosenWord]);

	function getLetterBackground(index: number, word: string, wordIndex: number) {
		if (index >= word.length || word[index] === "0") return "rgba(44, 44, 46, 0)";
		if (wordIndex === tries.length) return "rgba(44, 44, 46, 0)";

		if (!props.chosenWord.toUpperCase().includes(word[index])) {
			if (!greenButtons.includes(word[index]) && !yellowButtons.includes(word[index]) && !grayButtons.includes(word[index]))
				setGrayButtons([...grayButtons, word[index]]);
			return "rgb(45, 44, 46)";
		}

		if (props.chosenWord[index].toUpperCase() === word[index]) {
			if (!greenButtons.includes(word[index])) setGreenButtons([...greenButtons, word[index]]);
			return "rgb(71, 124, 58)";
		}

		const letterWordAmount = Array.from(word).filter((item) => word[index] === item).length;
		const letterChosenAmount = Array.from(props.chosenWord.toUpperCase()).filter((item) => word[index] === item).length;
		if (letterWordAmount > 1) {
			const amountBefore = Array.from(word)
				.slice(0, index)
				.filter((item) => word[index] === item).length;
			if (amountBefore >= letterChosenAmount) {
				if (!greenButtons.includes(word[index]) && !yellowButtons.includes(word[index]) && !grayButtons.includes(word[index]))
					setGrayButtons([...grayButtons, word[index]]);
				return "rgb(45, 44, 46)";
			} else {
				const nextIndex = word.slice(index + 1, word.length).indexOf(word[index]) + (index + 1);
				if (props.chosenWord[nextIndex].toUpperCase() === word[nextIndex]) {
					if (!greenButtons.includes(word[index]) && !yellowButtons.includes(word[index]) && !grayButtons.includes(word[index]))
						setGrayButtons([...grayButtons, word[index]]);
					return "rgb(45, 44, 46)";
				}
			}
		}

		if (!greenButtons.includes(word[index]) && !yellowButtons.includes(word[index])) setYellowButtons([...yellowButtons, word[index]]);
		return "rgb(165, 142, 39)";
	}

	return (
		<div className="flex flex-col items-center">
			<motion.div
				initial={{opacity: 0}}
				variants={{
					showing: {opacity: 1, top: "10%"},
					hidden: {opacity: 0, top: "0"},
				}}
				animate={invalidWordTransition ? "showing" : "hidden"}
				transition={{duration: 0.5}}
				className="p-4 px-6 absolute text-white font-semibold rounded-xl"
				style={{backgroundColor: "rgba(111, 112, 113, 0.6)"}}>
				Not in word list
			</motion.div>
			{[0, 1, 2, 3, 4, 5].map((index) => {
				const lineTry = tries.length > index ? tries[index] : currentTry !== "" && index === tries.length ? currentTry : "00000";

				return (
					<motion.div key={`line_${index}`} className="flex my-4">
						{[0, 1, 2, 3, 4].map((letter) => (
							<motion.div
								key={`line_${index}-letter_${letter}`}
								initial={{backgroundColor: "rgba(44, 44, 46, 0)"}}
								animate={{backgroundColor: getLetterBackground(letter, lineTry.toUpperCase(), index)}}
								transition={{duration: 0.3, delay: 0.2 * letter}}
								className={`
                                    border-2 
                                    border-gray-400 
                                    w-20 h-20 mx-2 
                                    text-center 
                                    flex items-center 
                                    justify-center 
                                    font-bold text-white 
                                    text-3xl`}>
								{letter >= lineTry.length || lineTry[letter] === "0" ? "" : lineTry[letter].toUpperCase()}
							</motion.div>
						))}
					</motion.div>
				);
			})}
			<motion.div className="absolute bottom-2">
				<Keyboard
					onKeyPress={(e: string) => {
						switch (e) {
							case "{enter}":
								keyPress(new KeyboardEvent("ENTER", {key: "ENTER"}));
								break;
							case "{bksp}":
								keyPress(new KeyboardEvent("BACKSPACE", {key: "BACKSPACE"}));
								break;
							default:
								keyPress(new KeyboardEvent(e, {key: e}));
						}
					}}
					layout={keyboardLayout}
					buttonTheme={getButtonThemes()}
					theme="hg-theme-default myTheme1"
					display={{
						"{bksp}": "DEL",
						"{enter}": "ENTER",
					}}
				/>
			</motion.div>
		</div>
	);
}
