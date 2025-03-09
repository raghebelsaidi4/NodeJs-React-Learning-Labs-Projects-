// Prove -> Function is a value
function testValue() {
    console.log("I am a test value");
}

const fn = testValue;
console.log(fn.toString());
fn();

const ar = [fn, testValue];
const o = {
    fn: testValue
};

function returnFn() {
    return testValue;
}
