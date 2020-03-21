//Promise is always called with the resolve and reject arguments
const url = "https://jsonplaceholder.typicode.com/posts/";

fetch(url)
    .then((response) => {
        response.json();
    })
    .then((data) => {
        console.log(data);
    });

const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, 3000);
});

promise
    .then(() => {
        console.log("Finished!");
    })
    .then(() => {
        console.log("I finished, too!");
    })
    .catch(() => {
        console.log("Something went wrong...");
    });