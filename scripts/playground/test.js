//Classes
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    introduce() {
        return `Hello, my name is ${this.name}`;
    }
}

const person = new Person('Peter', 25);

console.log(person.introduce());

//Callbacks
const fetchData = (userId, callback) => {
    setTimeout(() => {
        const fakeData = {
            id: userId,
            name: 'George',
        };
        callback(fakeData);
    }, 300);
};

const cb = data => {
    console.log("Here's your data:", data);
  };
  
fetchData(5, cb);