'use strict';

const describe = require("mocha").describe;
const it = require("mocha").it;
const extractor = require("./index");
const assert = require("assert");

describe("extractNumbers", () => {
    it("should extract 123456789 and 0254 123 123", async () => {
        const text = "This is a 123456789 text with number 0254 123 123 that should be extracted.";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, [
            {
                originalFormat: "123456789",
                filteredFormat: "123456789"
            },
            {
                originalFormat: "0254 123 123",
                filteredFormat: "0254123123"
            }
        ]);
    });

    it("should extract (123) 456-789-123", async () => {
        const text = "This is a (123) 456-789-123 text.";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, [
            {
                originalFormat: "(123) 456-789-123",
                filteredFormat: "123456789123",
            }
        ]);
    });

    it("should extract +420254123123", async () => {
        const text = "Air Conditioned, Power Steering, SUPER DOOPER LOW KLM's @ 78,238, SET AND FORGET REGO Until June 2016!!, Power Mirrors, Tinted Windows, Central Locking, CD Mp3/AUX/USB AM/FM Stereo, Bluetooth Connectivity, Partial Leather Interior, Dual SRS Air Bags, In Cabin Roll Bar, Rear Tow Bar Accessory, EFS Lift Kit Upgrade, Side Steps,  Added Essential Upgrades: - Shovel - Farm Jack - Sand Ladder - CB Radio (Oricom) - Brand New Mud Tyres with Sunraysia Rims - Dual Front ARB LED Spot Lights (2 x 185W) - Front Bull Bar - Full Length Top Luggage Rack - Fire Extinguisher - Rear Cabin Cage - Genuine Snorkel - Fuel Cans A STEAL at This Price! What a GEM! This Is a Must See!!! Immaculate Condition Inside & Out, Nothing To Spend!!!  Enquire Today!! DO NOT MISS OUT! We offer: *5 Year Unlimited Klms Warranty Plus 24/7 Roadside Service Australia Wide (terms & conditions apply) *100% clear title includes -No Accident History (no written off) -No Encumbrance Owing (no money owing) *Trades-Ins & Test Drive Available *Extended Trading Hours: Open 7 Days A Week: -Mon-Fri 9am - 5:30 pm -Sat 9am- 5pm -Sun 10am - 4pm (after hour appointments available) *Contact Us For On +420 254 123 123 + click to reveal *Website: http://www.stevesautoworld.com.au *Find Us On Facebook & Like Our Page, https://www.facebook.com/steves.autoworld";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, [
            {
                originalFormat: "+420 254 123 123",
                filteredFormat: "420254123123"
            }
        ]);
    });

    it("should extract multiline numbers", async () => {
        const text = `
        800123456
        800123456
        800123457
        `;
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, [
            {
                originalFormat: "800123456",
                filteredFormat: "800123456"
            },
            {
                originalFormat: "800123457",
                filteredFormat: "800123457"
            }
        ]);
    });

    it("shouldn't find numbers inside URI", async () => {
        const text = "click to reveal *Website: http://www.stevesautoworld.com.au/123456789 *Find Us On Facebook";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, []);
    });

    it("empty string should return empty array", async () => {
        const text = "";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, []);
    });

    it("string without number should return empty array", async () => {
        const text = "string without number should return empty array";
        const numbers = extractor.extractNumbers(text, 5);
        assert.deepEqual(numbers, []);
    });
});

describe("cleanNumber", () => {
    it("should clean from +420 123 456 789 to 420123456789", async () => {
        const cleanNumber = extractor.cleanNumber("+420 123 456 789");
        assert.equal(cleanNumber, "420123456789");
    });

    it("should clean from (420) 123-456-789 to 420123456789", async () => {
        const cleanNumber = extractor.cleanNumber("(420) 123-456-789");
        assert.equal(cleanNumber, "420123456789");
    });
});