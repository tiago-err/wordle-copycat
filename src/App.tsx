import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import languages from "./assets/languages.json";
import {Wordle} from "./components/Wordle";

const useMountEffect = (func: () => void) => useEffect(func, [func]);

function App() {
	const [isGamePlaying, setIsGamePlaying] = useState(false);
	const [isGamePlayingTransition, setIsGamePlayingTransition] = useState(false);
	const [isGameWon, setIsGameWon] = useState(false);
	const [isGameWonTransition, setIsGameWonTransition] = useState(false);
	const [isGameLost, setIsGameLost] = useState(false);
	const [isGameLostTransition, setIssGameLostTransition] = useState(false);
	const [words, setWords] = useState<{chosenWord: string; words: string[]}>({chosenWord: "", words: []});

	function gameWon() {
		setIsGameWonTransition(true);
		setTimeout(() => {
			setIsGameWon(true);
		}, 2000);
	}

	function gameLost() {
		setIssGameLostTransition(true);
		setTimeout(() => {
			setIsGameLost(true);
		}, 2000);
	}

	function chooseWord(languageFile: string) {
		const possibleAnswers: string[] = require(`./assets/words/${languageFile}`).answers;
		setWords({
			chosenWord: possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)],
			words: require(`./assets/words/${languageFile}`)
				.words.concat(require(`./assets/words/${languageFile}`).answers)
				.map((word: string) => word.toUpperCase()) as string[],
		});
	}

	useMountEffect(() => {
		document.addEventListener("gameWon", gameWon);
		document.addEventListener("gameLost", gameLost);

		return () => {
			document.removeEventListener("gameWon", gameWon);
			document.removeEventListener("gameLost", gameLost);
		};
	});

	useEffect(() => {
		setTimeout(() => setIsGamePlaying(isGamePlayingTransition), 500 * languages.length);
	}, [isGamePlayingTransition]);

	return (
		<div className="bg-slate-800 h-screen w-full flex flex-col justify-center items-center relative">
			<motion.span
				initial={{opacity: 0}}
				animate={{opacity: 1, position: "absolute", top: isGamePlayingTransition ? "5%" : "42%"}}
				transition={{duration: isGamePlayingTransition ? 1.5 : 0.5, delay: isGamePlayingTransition ? 0.5 : 0}}
				className="text-gray-50 flex flex-col items-center">
				<h1 className=" font-extrabold">wordle</h1>
				<motion.span initial={{opacity: 0}} animate={{opacity: 0.5}} transition={{duration: 2, delay: 0.5}}>
					(copycat)
				</motion.span>
			</motion.span>
			{!isGamePlaying && (
				<motion.div className="flex items-center">
					{languages.map((language, index) => (
						<motion.button
							key={language.label}
							initial={{opacity: 0}}
							animate={{opacity: isGamePlayingTransition ? 0 : 1}}
							transition={{duration: 0.3, delay: 0.3 * (index + 1)}}
							disabled={language.disabled}
							onClick={() => {
								chooseWord(language.file);
								setIsGamePlayingTransition(true);
							}}
							className={`bg-gray-50 bg-opacity-20 w-full py-1.5 px-3 mx-2 text-center rounded-xl filter ${
								language.disabled ? "grayscale" : ""
							}`}>
							{language.flag}
						</motion.button>
					))}
				</motion.div>
			)}
			{isGamePlaying && !(isGameWon || isGameLost) && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: isGameWonTransition || isGameLostTransition ? 0 : 1}}
					transition={{duration: 0.3, delay: isGameWonTransition || isGameLostTransition ? 1.5 : 0}}>
					<Wordle chosenWord={words.chosenWord} possibleWorlds={words.words} />
				</motion.div>
			)}
			{isGamePlaying && (isGameWon || isGameLost) && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: isGameWonTransition || isGameLostTransition ? 1 : 0}}
					transition={{duration: 0.3}}
					className="flex flex-col text-white font-bold text-xl items-center">
					{isGameWon ? "Congratulations, you have guessed the correct word!" : `That's a shame! The word was: ${words.chosenWord.toUpperCase()}`}
					<motion.button
						className="bg-gray-50 mt-5 bg-opacity-20 w-1/3 py-1.5 px-3 mx-2 text-center rounded-xl"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						transition={{duration: 0.3, delay: 1}}
						onClick={() => {
							setIssGameLostTransition(false);
							setIsGameWonTransition(false);
							setIsGamePlayingTransition(false);
							setTimeout(() => {
								setIsGameWon(false);
								setIsGameLost(false);
							}, 1500);
						}}>
						Restart
					</motion.button>
				</motion.div>
			)}
		</div>
	);
}

export default App;
