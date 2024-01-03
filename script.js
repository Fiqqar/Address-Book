const form = document.querySelector ('form');
const trhead = document.querySelector ('#head');
const data = document.querySelector ('#data');
const nameinput = document.querySelector ('#name');
const addinput = document.querySelector ('#add');
const telinput = document.querySelector ('#tel');
const emailinput = document.querySelector ('#email');
const urlinput = document.querySelector ('#url');
const button = document.querySelector ('button');

let db;
window.onload = () => {
    let request = window.indexedDB.open('contacts', 1);
    request.onerror = () => {
        console.log('error');
    }
    request.onsuccess = () => {
        console.log('success');
        db = request.result;
        displaydata();
    }
    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectstore = db.createObjectStore('contacts', {keyPath: 'id', autoIncrement: true});
        objectstore.createIndex('name', 'name', {unique: false});
        objectstore.createIndex('add', 'add', {unique: false});
        objectstore.createIndex('tel', 'tel', {unique: false});
        objectstore.createIndex('email', 'email', {unique: false});
        objectstore.createIndex('url', 'url', {unique: false});
        console.log('database setup complete')
    }
    form.onsubmit = (e) => {
        e.preventDefault();
        let newitem = {
            name: nameinput.value,
            add: addinput.value,
            tel: telinput.value,
            email: emailinput.value,
            url: urlinput.value
        };
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectstore = transaction.objectStore('contacts');
        var request = objectstore.add(newitem);

        request.onsuccess = (e) => {
            nameinput.value = '';
            addinput.value = '';
            telinput.value = '';
            emailinput.value = '';
            urlinput.value = '';
        };
        transaction.oncomplete = () => {
            console.log('database update complete');
            displaydata();
        };
        transaction.onerror = () => {
            console.log('transaction error')
        };
    }
    function displaydata() {
        let objectstore = db.transaction('contacts').objectStore('contacts');
        
        objectstore.openCursor().onsuccess = (e) => {
            let cursor = e.target.result;
            if(cursor) {
                let tr = document.createElement('tr');
                let tdname = document.createElement('td');
                let tdadd = document.createElement('td');
                let tdtel = document.createElement('td');
                let tdemail = document.createElement('td');
                let tdurl = document.createElement('td');

                tr.appendChild(tdname);
                tr.appendChild(tdadd);
                tr.appendChild(tdtel);
                tr.appendChild(tdemail);
                tr.appendChild(tdurl);

                data.appendChild(tr);
                tdname.textContent = cursor.value.name;
                tdadd.textContent = cursor.value.add;
                tdtel.textContent = cursor.value.tel;
                tdemail.textContent = cursor.value.email;
                tdurl.textContent = cursor.value.url;
                tr.setAttribute('data-contact-id', cursor.value.id);

                let deletebtn = document.createElement('button');
                tr.appendChild(deletebtn);
                deletebtn.textContent = 'Delete';
                deletebtn.onclick = deleteitem;
                cursor.continue();
            }
            else {
                if(!data.firstChild) {
                    let p = document.createElement('p');
                    p.textContent = 'empty contact';
                    data.appendChild(p);
                }
            }
        };
    }
    function deleteitem(item) {
        let contactid = Number(item.target.parentNode.getAttribute('data-contact-id'));
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectStore = transaction.objectStore('contacts');
        var request = objectStore.delete(contactid);
        
        transaction.oncomplete = () => {
            item.target.parentNode.parentNode.removeChild(item.target.parentNode);
            console.log("Delete Success!");
            if (!data.firstChild) {
                let p = document.createElement('p');
                    p.textContent = 'empty contact';
                    data.appendChild(p);
            }
        };
    }
}