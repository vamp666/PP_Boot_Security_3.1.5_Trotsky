async function getRoles() {
    try {
        const response = await fetch("api/role/all")
        return await response.json()
    } catch (error) {
        console.log(error.message())
    }
}

async function getFormData(form) {
    let val = {}
    const roles = await getRoles()
    for (const field of form) {
        if (field.name) {
            if (field.type === "select-multiple") {
                val[field.name] = []
                for (const option of field.options) {
                    if (option.selected) {
                        roles.forEach(function (role) {
                            if (role.roleName.substr(5) === (option.value)) {
                                val[field.name].push(
                                    {
                                        id: role.id,
                                        roleName: role.roleName
                                    }
                                )
                            }
                        })
                    }
                }
            } else {
                if (field.value) {
                    val[field.name] = field.value
                }
            }
        }
    }
    return val
}

async function saveNewUser() {
    const newUserForm = document.getElementById('newUserForm')
    const newUser = await getFormData(newUserForm)
    try {
        await fetch("/api/user", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        })
    } catch (error) {
        console.log(error.message)
    }
    newUserForm.reset()
    await fillUsersTable()
    switchToUsersTab()
}

async function updateUser() {
    const elem = document.getElementById('editFormBody')
    const user = await getFormData(elem)
    console.log(JSON.stringify(user))
    try {
        await fetch("api/user", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
    } catch (error) {
        console.log(error.message)
    }
}

async function fillPrincipalTable() {
    let user
    try {
        const res = await fetch(`api/user/${userId}`)
        user = await res.json()
    } catch (error) {
        console.log(error.message)
    }
    let elem = document.getElementById("user-id")
    elem.innerText = user.id
    elem = elem.nextElementSibling
    elem.innerHTML = user.firstName
    elem = elem.nextElementSibling
    elem.innerHTML = user.lastName
    elem = elem.nextElementSibling
    elem.innerHTML = user.age
    elem = elem.nextElementSibling
    elem.innerHTML = user.email
    elem.nextElementSibling.innerHTML = user.roles.map(role => role.roleName.substr(5)).join(" ")
}

async function fillUsersTable() {
    let users
    try {
        const res = await fetch("api/user/all")
        users = await res.json()
    } catch (error) {
        console.log(error.message)
    }
    let elem = document.getElementById("users-table")
    elem.innerHTML = ""
    for (const user of users) {
        let tr = document.createElement('tr')
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(role => role.roleName.substr(5)).join(" ")}</td>
            <td>
                <button type="button" class="btn btn-info" data-bs-toggle="modal"
                        data-bs-target="#edit-modal" data-bs-updateUserId='${user.id}'>
                    Edit
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-danger" data-bs-toggle="modal"  id = "delete-button"
                        data-bs-target="#delete-modal" data-bs-deleteUserId='${user.id}'>
                    Delete
                </button>
            </td>`
        elem.appendChild(tr)
    }
}

function switchToUsersTab() {
    const someTabTriggerEl = document.querySelector('#nav-tab button[data-bs-target="#nav-users"]');
    const tab = new bootstrap.Tab(someTabTriggerEl);
    tab.show()
}

async function listenDeleteModal() {
    const deleteModal = document.getElementById('delete-modal')
    deleteModal.addEventListener('show.bs.modal', await function (event) {
        const button = event.relatedTarget         // Button that triggered the modal
        const id = button.getAttribute('data-bs-deleteUserId'); //Extract info from data-bs-* attributes
        fillDeleteModal(id)
    })
}

async function fillDeleteModal(id) {
    let user
    try {
        const res = await fetch(`api/user/${id}`)
        user = await res.json()
    } catch (error) {
        console.log(error.message)
    }
    document.getElementById('idDelete').setAttribute("value", user.id)
    document.getElementById('firstNameDelete').setAttribute("value", user.firstName)
    document.getElementById('lastNameDelete').setAttribute("value", user.lastName)
    document.getElementById('ageDelete').setAttribute("value", user.age)
    document.getElementById('emailDelete').setAttribute("value", user.email)
    const elem = document.getElementById('rolesDelete')
    elem.innerHTML = user.roles.map(role => "<option>" + role.roleName.substr(5) + "</option>").join(" ")
}

async function deleteUser() {
    const id = document.getElementById('idDelete').value
    try {
        await fetch(`api/user/${id}`, {
            method: "DELETE", headers: {
                "Content-Type": "application/json"
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

async function listenUpdateModal() {
    const updateModal = document.getElementById('edit-modal')
    updateModal.addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget         // Button that triggered the modal
        const id = button.getAttribute('data-bs-updateUserId'); //Extract info from data-bs-* attributes
        await fillUpdateModal(id)
    })
}

async function fillUpdateModal(id) {
    let user
    try {
        const res = await fetch(`api/user/${id}`)
        user = await res.json()
    } catch (error) {
       console.log(error.message)
    }
    document.getElementById('idEdit').setAttribute("value", user.id)
    document.getElementById('firstNameEdit').setAttribute("value", user.firstName)
    document.getElementById('lastNameEdit').setAttribute("value", user.lastName)
    document.getElementById('ageEdit').setAttribute("value", user.age)
    document.getElementById('emailEdit').setAttribute("value", user.email)
    document.getElementById('passwordEdit').setAttribute("value", user.password)
    const elem = document.getElementById("rolesEdit")
    elem.innerHTML = ""
    const optionUser = document.createElement("option")
    optionUser.innerText = "USER"
    optionUser.setAttribute("selected", "true")
    elem.appendChild(optionUser)
    const optionAdmin = document.createElement("option")
    optionAdmin.innerText = "ADMIN"
    user.roles.map(role => {
        if (role.roleName.substr(5) === "ADMIN") {
            optionAdmin.setAttribute("selected", "true")
        }
    })
    elem.appendChild(optionAdmin)
}





