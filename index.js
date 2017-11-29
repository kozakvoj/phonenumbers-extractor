'use strict';

const R = require("ramda");
const validator = require('validator');

const SINGLE_DELIMITERS = ["-", ".", " "];
const PAIR_DELIMITERS = [{first: "(", second: ")"}];


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
                    originalFormat: cleanNumberForOriginalFormat(rawNumber),
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

function cleanNumberForOriginalFormat(numberBlock) {
    const filteredNumberBlock = (R.contains(numberBlock[numberBlock.length - 1], SINGLE_DELIMITERS))
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
    let firstPairDelimiters = [];

    const charIsNumber = char => !isNaN(parseInt(char));
    const charIsSingleDelimiter = char => charIsNumber(char) || R.contains(char, SINGLE_DELIMITERS);
    const charIsFirstPairDelimiter = char => R.contains(char, R.map(R.head, PAIR_DELIMITERS));
    const findFirstDelimiter = char => R.find(R.propEq('second', char))(PAIR_DELIMITERS).first;
    const charIsSecondPairDelimiter = (char, firstPairDelimiters) =>
        R.contains(char, R.map(R.last, PAIR_DELIMITERS)) && R.contains(findFirstDelimiter(char), firstPairDelimiters);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // start block
        if ((charIsNumber(char)
                || charIsFirstPairDelimiter(char)
                || char === "+") && !inCurrentNumberBlock) {
            if (charIsFirstPairDelimiter(char)) firstPairDelimiters.push(char);
            startBlock = i;
            inCurrentNumberBlock = true;
        }

        // end block
        else if ((!charIsNumber(char)
                || !charIsSingleDelimiter(char)
                || !charIsSecondPairDelimiter(char, firstPairDelimiters)) && inCurrentNumberBlock) {
            console.log(!charIsSecondPairDelimiter(char, firstPairDelimiters));
            blocks.push([startBlock, i]);
            inCurrentNumberBlock = false;
        }
    }

    if (inCurrentNumberBlock) blocks.push([startBlock, text.length]);

    return blocks
}

function cleanNumber(text) {
    let replacedText = text;

    const replaceStrings = R.pipe(
        R.concat(SINGLE_DELIMITERS),
        R.concat(R.pipe(
            R.map(R.values),
            R.flatten
        )(PAIR_DELIMITERS)),
        R.concat(["+"])
    )([]);

    replaceStrings.forEach(replaceString => {
        replacedText = replacedText.replace(new RegExp(RegExp.quote(replaceString), "g"), "");
    });

    return replacedText;
}

RegExp.quote = str =>
    (str === ")" || str === "(" || str === "." || str === "+")
        ? str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        : str;