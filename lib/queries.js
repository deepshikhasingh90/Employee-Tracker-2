const cTable = require('console.table');
const inquirer = require('inquirer');


const addDepartment = (connection, start) => {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Please provide name of department you would like to add.'
    }).then(function (answer) {
        connection.query('Insert into department SET ?', { name: answer.name }, function (err) {
            if (err) throw err;
            console.log('New Department was created successfully!');
            start();
        })
    })
};

const AddRole = (connection, start) => {
    connection.query("Select * From department", function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Please type what title you would like to add.'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Please provide salary for the new title you would like to add.',
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                type: 'rawlist',
                name: 'choice',
                message: 'Please choose id of the department.',
                choices: () => {
                    const choiceArr = [];
                    for (let i = 0; i < results.length; i++) {
                        choiceArr.push(results[i].name);
                    }
                    return choiceArr;
                }
            }
        ]).then(function (answer) {
            let chosenId;
            for (let i = 0; i < results.length; i++) {
                if (answer.choice === results[i].name) {
                    chosenId = results[i].id;
                }
            };
            connection.query('Insert into role SET ?',
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: chosenId
                },
                function (err) {
                    if (err) throw err;
                    console.log('New Role was created successfully!');
                    console.log('------------------------------------');
                    start();
                })
        })
    })
};

const addEmployee = (connection, start) => {
    connection.query('Select * From role', function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is the employee's last name?"
            },
            {
                type: 'rawlist',
                name: 'role',
                message: "What is the employee's role?",
                choices: () => {
                    const roleArr = [];
                    for (let i = 0; i < results.length; i++) {
                        roleArr.push(results[i].title);
                    }
                    return roleArr;
                }
            }

        ]).then(function (answer) {
            let roleID;
            for (let i = 0; i < results.length; i++) {
                if (answer.role === results[i].title) {
                    roleID = results[i].id;
                }
            }
            connection.query('Select * from employee', function (err, results) {
                if (err) throw err;
                console.log(cTable.getTable(results));
                inquirer.prompt({
                    type: 'rawlist',
                    name: 'isManager',
                    message: "Who is the employee's manager? Choose id if any.",
                    choices: () => {
                        const managerIDArr = [];
                        for (let i = 0; i < results.length; i++) {
                            managerIDArr.push(results[i].id)
                        }
                        managerIDArr.push("None");
                        return managerIDArr;
                    }
                }).then(function (response) {
                    if (response.isManager === "None") {
                        connection.query('Insert into employee SET ?',
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleID
                            },
                            function (err) {
                                if (err) throw err;
                                console.log('New Employee was created successfully!');
                                console.log('---------------------------------------');
                                start();
                            })
                    } else {
                        connection.query('Insert into employee SET ?',
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleID,
                                manager_id: answer.isManager
                            },
                            function (err) {
                                if (err) throw err;
                                console.log('New Employee was created successfully!');
                                console.log('--------------------------------------');
                                start();
                            })
                    }
                })
            })
        })
    })
};

const viewQuery = (table, connection, start) => {
    connection.query(`Select * From ${table}`, function (err, results) {
        if (err) throw err;
        console.log(cTable.getTable(results));
        start();
    })
};

const updateEmployeeRole = (connection, start) => {
    connection.query('Select * from employee', function (err, results) {
        if (err) throw err;
        console.log(cTable.getTable(results));
        inquirer.prompt({
            type: 'list',
            name: 'targetEmplId',
            message: "Which employee's role do you want to update? Select an id.",
            choices: () => {
                const emplArr = [];
                for (let i = 0; i < results.length; i++) {
                    emplArr.push(results[i].id)
                }
                return emplArr;
            }
        }).then(function (response) {
            connection.query('Select * from role', function (err, results) {
                if (err) throw err;
                inquirer.prompt({
                    type: 'rawlist',
                    name: 'newRole',
                    message: "What's the new role of that employee?",
                    choices: () => {
                        const roleArr = [];
                        for (let i = 0; i < results.length; i++) {
                            roleArr.push(results[i].title)
                        }
                        return roleArr;
                    }
                }).then(function (answer) {
                    console.log(answer.newRole);
                    let chosenRoleId;
                    for (let i = 0; i < results.length; i++) {
                        if (answer.newRole === results[i].title) {
                            chosenRoleId = results[i].id;
                        }
                    }
                    connection.query("UPDATE employee SET ? WHERE ?", [{ role_id: chosenRoleId }, { id: response.targetEmplId }], function (err) {
                        if (err) throw err;
                        console.log('Role of Employee was changed successfully!');
                        console.log('-------------------------------------------');
                        start();
                    })
                })
            })
        })
    })
};

const updateEmployeeManager = (connection, start) => {
    connection.query('Select * from employee', function (err, results) {
        if (err) throw err;
        console.log(cTable.getTable(results));
        inquirer.prompt({
            type: 'list',
            name: 'targetEmplId',
            message: "Which employee's manager do you want to update? Select an id.",
            choices: () => {
                const emplArr = [];
                for (let i = 0; i < results.length; i++) {
                    emplArr.push(results[i].id)
                }
                return emplArr;
            }
        }).then(function (answer) {
            inquirer.prompt({
                type: 'list',
                name: 'isManager',
                message: "Who is the employee's new manager? Choose id if any.",
                choices: () => {
                    const managerIDArr = [];
                    for (let i = 0; i < results.length; i++) {
                        managerIDArr.push(results[i].id)
                    }
                    managerIDArr.push("None");
                    return managerIDArr;
                }
            }).then(function (response) {
                if (response.isManager === "None") {
                    connection.query('Update employee SET manager_id = NULL Where ?', { id: answer.targetEmplId }, function (err) {
                        if (err) throw err;
                        console.log("Employee's manager was updated successfully!");
                        console.log('---------------------------------------');
                        start();
                    })
                } else {
                    connection.query('Update employee SET ? Where ?', [{ manager_id: response.isManager }, { id: answer.targetEmplId }],
                        function (err) {
                            if (err) throw err;
                            console.log("Employee's manager was updated successfully!");
                            console.log('---------------------------------------');
                            start();
                        })
                }
            })
        })
    })
};

const deleteQuery = (name, connection, start) => {
    connection.query(`Select * From ${name}`, function (err, results) {
        if (err) throw err;
        console.log(cTable.getTable(results));
        inquirer.prompt({
            type: 'list',
            name: 'target',
            message: `Please choose id of the ${name} which you are going to delete.`,
            choices: () => {
                const choiceIDArr = [];
                for (let i = 0; i < results.length; i++) {
                    choiceIDArr.push(results[i].id)
                }
                return choiceIDArr;
            }
        }).then(function (answer) {
            connection.query(`Delete from ${name} Where ?`, { id: answer.target }, function (err) {
                if (err) throw err;
                console.log(`${name} was deleted successfully!`);
                console.log('---------------------------------------');
                start();
            })
        })
    })
};


const viewAll = (connection, start) => {
    const query = 'SELECT e.id, e.first_name, e.last_name, d.name AS department, r.title, r.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY e.id ASC';
    connection.query(query, function (err, res) {
        if (err) throw err;
        let table = [];
        for (let i = 0; i < res.length; i++) {
            table.push({ id: res[i].id, name: res[i].first_name + " " + res[i].last_name, title: res[i].title, salary: res[i].salary, department: res[i].department, manager: res[i].manager });
        };
        console.log(cTable.getTable(table));
        start();
    });
};

const viewAllByDepartment = (connection, start) => {
    connection.query('Select * From department', function (err, results) {
        if (err) throw err;
        inquirer.prompt(
            {
                type: "list",
                name: "department",
                message: "Which department would you like to view the employees from?",
                choices: () => {
                    const depArr = [];
                    for (let i = 0; i < results.length; i++) {
                        depArr.push(results[i].name)
                    }
                    return depArr;
                }
            }
        ).then((answer) => {
            var query = "SELECT e.first_name, e.last_name, r.title, d.name FROM employee e INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id WHERE d.name = ?";
            connection.query(query, [answer.department], function (err, res) {
                if(err) throw err;
                let table = [];
                for (var i = 0; i < res.length; i++) {
                    table.push({ name: res[i].first_name + " " + res[i].last_name, title: res[i].title, department: res[i].name });
                };
                console.log(cTable.getTable(table));
                start();
            });
        });
    })
};

module.exports = {
    addDepartment,
    AddRole,
    addEmployee,
    viewQuery,
    viewAll,
    viewAllByDepartment,
    updateEmployeeRole,
    updateEmployeeManager,
    deleteQuery
};