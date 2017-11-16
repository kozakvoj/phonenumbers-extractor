'use strict';

const R = require("ramda");
const url = require("url");
const validator = require('validator');

const DELIMITERS = ["-", ".", "(", ")", " "];

module.exports = {
    extractNumbers: (text, minNumberLength) => {
        if (!text) return [];
        if (minNumberLength <= 0) return [];

        const numberBlocks = getNumberBlocks(text);
        const numberBlocksFiltered = R.reject(R.curry(isInUri)(text), numberBlocks);
        const rawNumbers = getNumbersByNumberBlocks(text, numberBlocksFiltered);

        return R.pipe(
            R.uniq,
            R.filter(number => cleanNumber(number).length >= minNumberLength),
            R.map(rawNumber => {
                return {
                    originalFormat: getOriginalFormat(text, rawNumber),
                    filteredFormat: cleanNumber(rawNumber)
                }
            })
        )(rawNumbers);
    },

    cleanNumber
};

function isInUri(text, numberBlock) {
    const startBlock = R.head(numberBlock);
    const endBlock = R.last(numberBlock);

    let startExtendedString = 0;
    let endExtendedString = text.length;

    for (let i = startBlock - 1; i >= 0; i--) {
        if (text[i] === " ") {
            startExtendedString = i + 1;
            break;
        }
    }

    for (let i = endBlock - 1; i <= text.length; i++) {
        if (text[i] === " ") {
            endExtendedString = i;
            break;
        }
    }

    const possibleUrl = text.substring(startExtendedString, endExtendedString);

    return (validator.isURL(possibleUrl))
}

function getOriginalFormat(text, numberBlock) {
    const cleanNumberBlock = cleanNumberForOriginalFormat(numberBlock);
    const indexOfNumberBlockInText = text.indexOf(cleanNumberBlock);

    if (cleanNumberBlock.indexOf(")") > -1 && text[indexOfNumberBlockInText - 1] === "(") {
        return `(${cleanNumberBlock}`
    } else if (text[indexOfNumberBlockInText - 1] === "+") {
        return `+${cleanNumberBlock}`
    }

    return cleanNumberBlock;
}

function cleanNumberForOriginalFormat(numberBlock) {
    const filteredNumberBlock = (R.contains(numberBlock[numberBlock.length - 1], DELIMITERS))
        ? numberBlock.substring(0, numberBlock.length - 1)
        : numberBlock;

    return R.trim(filteredNumberBlock);
}

function getNumbersByNumberBlocks(text, numberBlocks) {
    return R.map(block => text.substring(R.head(block), R.last(block)))(numberBlocks);
}

function getNumberBlocks(text) {
    let inCurrentNumberBlock = false;
    let blocks = [];
    let startBlock = 0;

    for (let i = 0; i < text.length; i++) {
        if (charIsNumber(text[i]) && !inCurrentNumberBlock) {
            startBlock = i;
            inCurrentNumberBlock = true;
        } else if (!charIsNumberOrDelimiter(text[i]) && inCurrentNumberBlock) {
            blocks.push([startBlock, i]);
            inCurrentNumberBlock = false;
        }
    }

    if (inCurrentNumberBlock) blocks.push([startBlock, text.length]);

    return blocks
}

function charIsNumber(char) {
    return !isNaN(parseInt(char))
}

function charIsNumberOrDelimiter(char) {
    return charIsNumber(char) || R.contains(char, DELIMITERS);
}

function cleanNumber(text) {
    let replacedText = text;

    const replaceStrings = R.concat(DELIMITERS, ["+"]);

    replaceStrings.forEach(replaceString => {
        replacedText = replacedText.replace(new RegExp(RegExp.quote(replaceString), "g"), "");
    });

    return replacedText;
}

RegExp.quote = str =>
    (str === ")" || str === "(" || str === "." || str === "+")
        ? str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        : str;