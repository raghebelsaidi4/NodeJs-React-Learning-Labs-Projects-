// utility function to generate a random UUID
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// console.log(uuidv4());

// store 10 students information (name, email, id)
const students = [
    {id: uuidv4(), name: 'Ahmed Amr', email: 'ragheb@gmail.com'},
    {id: uuidv4(), name: 'Mohamed Ali', email: 'mohamed@gmail.com'},
    {id: uuidv4(), name: 'Ali Ahmed', email: 'ali@gmail.com'},
    {id: uuidv4(), name: 'Amr Mohamed', email: 'amr@gmail.com'},
]

//console.log(students)

/**
 * ----(Tasks)---
 * Traverse (O(n)) (Get anything if you have the key: O(1))
 * filter
 * delete [splice -> O(n), filter -> O(n)]
 * update [findIndex -> O(n)]
 * create a new one [push -> O(1), unshift -> O(n)]
 * */

// create a new student
students.push({
    id: uuidv4(),
    name: 'Mai Essa',
    email: 'mai@gmail.com',
})
// console.log(students)

// update a student
const idToUpdate = '70858c81-c3ea-44e4-8a2e-3f263b2d75f0';
const updatedData = {
    name: 'Sajda Ali',
    email: 'sajda@gmail.com',
};
//let updatedIndex = students.findIndex((item) => item.id === idToUpdate);
students[idToUpdate] = {
    ...students[idToUpdate],
    ...updatedData
}
//console.log(students)

// delete a student
//students.splice(updatedIndex, 1);
//delete students[idToUpdate];
//console.log('Deleted',students)

// filter students (you can use Object)
// for (let i = 0; i < students.length; i++) {
//     console.log(students[i].name);
// }
//
// for (const student of students) {
//     console.log(student.name);
// }
//
// for (let i in students){
//     console.log(students[i].name);
// }
// using Object
// Object.keys(students).forEach(key => {
//     console.log(key.name, key.email);
// })
Object.values(students).forEach((student) => {
    console.log(student.name, student.email);
})

