const myArray = ["Item 1", "Item 2", "Item 3"];

const myObj = {
    "Welcome #1": {
        blasts: 100,
        sends: 2
    },
    "Welcome #2": {
        blasts: 0,
        sends: 200
    },
    "Welcome #3": {
        blasts: 1000,
        sends: 200
    }
}

const myArrayOfObjs = [
    {
        firstName: "Steve",
        lastName: "Giordano",
        city: "NYC"
    },
    {
        firstName: "Ping",
        lastName: "Mui",
        city: "NYC"
    },
    {
        firstName: "Alex",
        lastName: "Belyus",
        city: "Philadelphia"
    }
]

//Simple for loop
console.log("Running for loop:");
for (let i = 0; i < myArray.length; i++) {
    console.log(i);
}

//For-of loop; used with arrays. NOTE: For-of doesn't natively give access to the index
console.log("Running for-of loop:");
for (const item of myArray) {
    console.log(item);
}

//For-in loop; used with objects
console.log("Running for-in loop:");
for (const key in myObj) {
    console.log("Key: " + key);
    console.log("Blasts Value: " + myObj[key].blasts);
    console.log("Sends Value: " + myObj[key].sends);
}

//While loop
console.log("Running while loop:");
while (myArray.length > 0) {
    console.log(myArray);
    myArray.pop();
}

//Do-while loop
console.log("Running do-while loop:");
const newArray = ["New Item 1", "New Item 2", "New Item 3"];
do {
    console.log(newArray.length);
    newArray.pop();
} while (newArray.length > 0);