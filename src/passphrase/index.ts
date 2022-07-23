import wordlist from './wordlist'

const DEFAULT_WORDCOUNT = 2;
const WORDLIST_SIZE = 7776; // 6^5

const generate = (wordCount?: number) => {
  wordCount = wordCount || DEFAULT_WORDCOUNT;

  let phrase = "";

  for (let i = 0; i < wordCount; i++) {
    const rand = Math.floor(Math.random() * WORDLIST_SIZE);
    let word = wordlist[rand]
    word = word[0].toUpperCase() + word.slice(1)
    phrase += word;
  }

  return phrase;
}

export default generate;
