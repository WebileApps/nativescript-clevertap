var Clevertap = require("nativescript-clevertap").Clevertap;
var clevertap = new Clevertap();

describe("greet function", function() {
    it("exists", function() {
        expect(clevertap.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(clevertap.greet()).toEqual("Hello, NS");
    });
});