const express = require('express');
require('dotenv').config();
const { succeedResponse } = require('./response');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { getData } = require('./fetch');
const cors = require('cors'); 

//App init
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
//console.log(db);


const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.use(cors())


app.use(express.static(__dirname))

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}....`)
        });
    } catch (error) {
        console.log(error);
    }
}


// Creating Post Route for Submit Form
app.post('/add', (req, res) => {
    // Retrive form data from request object
    const data = req.body
    // Check is the request is empty
    if (Object.keys(data).length === 0 && data.constructor === Object) {
        console.log("Request is empty!");
        return
    }
    //Write data to db
    try {
        db.collection("colClientsTest").add({data, createdAt: admin.firestore.FieldValue.serverTimestamp()});
        console.log("Data added!");
    } catch (error) {
        console.log(error);
    }
    res.send(succeedResponse('ok'));
});

//Get client api
app.get('/get-clients', (req, res) => {
    const clients = db.collection("colClientsTest").orderBy('createdAt', "desc");
    
    clients.get().then((querySnapshot) => { 
        const result = [];
        querySnapshot.forEach(document => {
                const client = document.data();
                result.push({
                    clntTimestamp: client.createdAt,
                    clntFname: client.data.clntFname,
                    clntLname: client.data.clntLname,
                    clntBirthday: client.data.clntBirthday,
                    clntDomicl: client.data.clntDomicl,
                    clntNation : client.data.clntNation,
                    emailPerson: client.data.clntEmails?.emailPerson,
                    emailPersonSecond: client.data.clntEmails?.emailPersonSecond,
                    emailWork: client.data.clntEmails?.emailWork,
                    emailWorkSecond: client.data.clntEmails?.emailWorkSecond,
                    mobilePerson: client.data.clntPhones?.mobilePerson,
                    mobilePersonSecond: client.data.clntPhones?.mobilePersonSecond,
                    mobileWork: client.data.clntPhones?.mobileWork,
                    phoneWork: client.data.clntPhones?.phoneWork
                });
            });
        res.send(succeedResponse(
            'ok',
            result
        ));
    });  
});

//Get client contacts api
app.get('/get-contacts', (req, res) => {
    const contacts = db.collection("colClients").doc("B6x8UCSmxw3JfIji4e8W").collection("colContacts");
    contacts.get().then((querySnapshot) => {
    const result = [];
    querySnapshot.forEach(doc => {
            const contacts = doc.data();
            result.push({
                contType:contacts.contType,
                contCountry:contacts.contCountry,
                contMinutes:contacts.contMinutes,
                contDate:contacts.contDate
           })
        })
        res.send(succeedResponse(
            'ok',
            result
        ));
    })
})

//Get client portfolios api
app.get('/get-portfolios', (req, res) => {
    const portfolios = db.collection("colClients").doc("B6x8UCSmxw3JfIji4e8W").collection("colPortfs");
    
    portfolios.get().then((querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            const portfolios = doc.data();
            result.push({
                cstdCode:portfolios.cstdCode,
                cstdDepart:portfolios.cstdDepart,
                cstdAccountNo:portfolios.cstdAccountNo,
                cstdType:portfolios.cstdType
            })
        })
        res.send(succeedResponse(
            'ok',
            result
        ));
    }) 
})

//Get portfolio snapshot api
app.get('/get-portfolio-snaps', (req,res) => {
    const portfolioSnap = db.collection("colClients").doc("B6x8UCSmxw3JfIji4e8W").collection("colPortfs").doc("AhmTBNaGSLzKn9Zyuqnm").collection("colPortflSnaps");
    portfolioSnap.get().then((querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
            //console.log(doc.id, '=>', doc.data());
            const portfolioSnap = doc.data();
            result.push({
                securts:portfolioSnap.securts.map(item => {
                    return {
                        costPrice: item.costPrice,
                        quantity: item.quantity,
                    }
                })
            })
        })
        res.send(succeedResponse(
            'ok',
            result
        ));
    })
})

//Get securities api
app.get('/get-securities', (req,res) => {
    const securities = db.collection("colSecurts");

    securities.get().then((querySnapshot) => {
        const result = [];
        querySnapshot.forEach(doc => {
            //console.log(doc.id, '=>', doc.data());
            const securities = doc.data();
            result.push({
                assetType:securities.assetType,
                secrtyCode:securities.secrtyCode
            })
        })
        res.send(succeedResponse(
            'ok',
            result
        ));
    })
})

//Get parsed CSV data
app.get('/get-parsed-csv-data', async (req, res) => {
    res.send(succeedResponse('ok',await getData()));
 });

// Write to firestore
app.post('/write-to-db', async (req, res) => {
    //console.log(await getData());
    const data = await getData()
    db.collection("colClients").doc("B6x8UCSmxw3JfIji4e8W").collection("colPortfs").doc("AhmTBNaGSLzKn9Zyuqnm").collection("colPortflSnaps").add({
        data
    })
    res.send(succeedResponse('ok',await getData(), console.log('Data added sucsessfully!')));
})

//App start
start();