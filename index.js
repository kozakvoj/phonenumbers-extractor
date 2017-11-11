'use strict';

const R = require("ramda");

const MIN_NUMBER_LENGTH = 5;
const DELIMITERS = ["-", ".", "(", ")", " "];

module.exports = {
    extractNumbers: text => {
        const numberBlocks = getNumberBlocks(text);
        const rawNumbers = getNumbersByNumberBlocks(text, numberBlocks);

        return R.pipe(
            R.uniq,
            R.filter(number => cleanNumber(number).length >= MIN_NUMBER_LENGTH),
            R.map(rawNumber => {
                return {
                    originalFormat: getOriginalFormat(text, rawNumber),
                    filteredFormat: cleanNumber(rawNumber)
                }
            }),
        )(rawNumbers);
    }
};

function getOriginalFormat(text, numberBlock) {
    const trimmedNumberBlock = R.trim(numberBlock);
    const indexOfNumberBlockInText = text.indexOf(trimmedNumberBlock);

    if (trimmedNumberBlock.indexOf(")") > -1 && text[indexOfNumberBlockInText - 1] === "(") {
        return `(${trimmedNumberBlock}`
    } else if (text[indexOfNumberBlockInText - 1] === "+") {
        return `+${trimmedNumberBlock}`
    }

    return trimmedNumberBlock;
}

function getNumbersByNumberBlocks(text, numberBlocks) {
    let splitText = [];

    for (let i = 0; i < numberBlocks.startBlocks.length; i++) {
        splitText.push(text.substring(numberBlocks.startBlocks[i], numberBlocks.endBlocks[i]))
    }

    return splitText;
}

function getNumberBlocks(text) {
    let inCurrentNumberBlock = false;
    let startBlocks = [];
    let endBlocks = [];

    for (let i = 0; i < text.length; i++) {
        if (charIsNumber(text[i]) && !inCurrentNumberBlock) {
            startBlocks.push(i);
            inCurrentNumberBlock = true;
        } else if (!charIsNumberOrDelimiter(text[i]) && inCurrentNumberBlock) {
            endBlocks.push(i);
            inCurrentNumberBlock = false;
        }
    }

    return {startBlocks, endBlocks}
}

function charIsNumber(char) {
    return !isNaN(parseInt(char))
}

function charIsNumberOrDelimiter(char) {
    return charIsNumber(char) || R.contains(char, DELIMITERS);
}

function cleanNumber(text) {
    let replacedText = text;

    DELIMITERS.forEach(delimiter => {
        replacedText = replacedText.replace(new RegExp(RegExp.quote(delimiter), "g"), "");
    });

    return replacedText;
}

RegExp.quote = str =>
    (str === ")" || str === "(" || str === "." || str === "+")
        ? str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        : str;