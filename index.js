const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const serviceAccount = {
    type : "service_account",
    project_id : "hiddengemtech-test",
    private_key_id : "2b3ecb27e8a8e6bca96922cde4bcfb6cca4e1266",
    private_key : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFNfBo93Oamcqx\nTzO9crVGvgRvFeJcR9G8xONA13VMrBD7eUNnj4AHepyxtWas6tTzVNbubp1KRoSC\nHelKSRnFr7bETsgfKC826dhaXJPrUnx0sJ91o2uwQeoqXUz0If6uIajJio31xVbX\nsECPtPBWA3edoJ03KcXl536SG3QaFDksIxyTiW55gcmtHSIvxSXVi6Z/Xo+IvHAc\n0o0Mw3GU1NLAPSKO97Z3vYHkNad+9tsI9GqULMajH4wELvdwylhXboUSKN9v3bqA\nP7WW28h8APF3s1SVwBqy4bT1ZSCtZrIRUVYe68asDsHLTn7VRxkdrMR9hB2dACoc\n3rMRQlElAgMBAAECggEAF3Ays3b9cVln4qzkHFb+vnqk8kLqlUcf4UyRKcqxsTwe\nBJVD8pH2iG0FJIXHvzNlvcnOhaX14bcB1qkRaffILVuV4Dzwwes3uVIPmaW5GtXB\n3uiC+ytCCD+9Qe220KkdqLptYg6qkpQynw3ejnXVvpNI6x4EsWKwl4Ns4paKtPKO\nnXgUPEhprgsFem2AJDjBFt6diF1a0PiG69G8mUa5UQGtsWI+22PPrs//hylQxalz\nhSTlrs2bv1K5G00abJ8sDwN+v59zSTtBDeoS32BRAtO8ZyywqNe92EnA/eg+o1Vk\nMnxK2vquVR2uZMNnvKHgzNbAPgtwlmEhY0BewRNFoQKBgQD7dcIbYVRSNe+cqkZy\nQicwblZSI5LdoiyWqBsjEMql9GQ5v60Yj3P/R0fS9ZEqkwF0cHo0X72DUiTF4z6T\n962dXTSpa3kGY7ks/bxvBD/IfZ91kdRX71f7IdEQSH1zHmY7FyFa+haUepE3q9GG\nosO72SYQSaSy8i2MGVx+mlCabQKBgQDIxXEm6lbVQayup/ZikZfeNiXWBN3U3Dr9\noYZ2JQMQMiOI5TgtknC3VUf0TxQ8zJik/X8U66hmfHJtlaRxOHGJkou0TjxS5TXu\nES8DFQ0/F+TP+Wx79XA4BMUB5aAb36f4PyisYs1UpPvtwr6WlN0LNVtAUh7lCVtq\nsivMOqpemQKBgQDf9ADsYcK3dVHyNbSIDmLYv2whu40R113ez9lbYZkaNI8O36dK\nOHkW4mUVfZ/MSyEAkyxDeQFP89jMZZdWMUBu5pQAT7d5+VbyuwkX1rD33uoly7tS\nldfF0lhgKC+SV4C1H+SVIib6Fi8/Zcc2IcAxjTRZTT1iIk5ueCfomYcwAQKBgBO/\nR8faGLxU/1UWdCdxxow2qzYHuIHtP2ge8QjBzzFSnSgj04i39JozqyYeeREZ1pGz\n1UILg77A0shwhYIVWSV84nzTjR9iKBHIYuVctrbT9M936vGuTGFWJsJvAXZ8YxsJ\nq0h5V1TR/W1/UBujfLJThywmZ5+DchhmeeRWiNdRAoGAX7ZR1hvC/+uBgUtfwBiL\nE7EvJPg2SRj3qtvlGWQn/Fle1DEmdwY12KHTNDvoJn0LL1OOvB3dcuDbAv1uiK/r\nP8UF0LsJeo+K91fY0k4dcmB0kfnI8H4WZTlggvz3v38elLvbhw6MdzO2Eurp4/Th\n/cQCOH19UAuUxvt81s2Eo7E=\n-----END PRIVATE KEY-----\n",
    client_email : "firebase-adminsdk-gfn3m@hiddengemtech-test.iam.gserviceaccount.com",
    client_id : "114471992577929896644",
    auth_uri : "https://accounts.google.com/o/oauth2/auth",
    token_uri : "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url : "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url : "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gfn3m%40hiddengemtech-test.iam.gserviceaccount.com",
    universe_domain : "googleapis.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hiddengemtech-test.firebaseio.com'
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get('/getAllNotes', async (req, res) => {
    try {
      const allNote = await db.collection('Notes').get();
      const notes = allNote.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

    if (notes.length === 0) {
        return res.status(404).send('Not have notes');
    }

    res.status(200).json(notes);
      
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.post('/register', async (req, res) => {
  const { username, password, name } = req.body;

  try{
    const user = await db.collection('Users').doc(username).get();
    if (user.exists) {
      return res.status(400).send({message: 'Username already exists'});
    }
    else{
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.collection('Users').doc(username).set({
        password: hashedPassword,
        name,
      });

      res.status(201).send({message: 'Registered successfully'});
    }
  } catch ( error ) {
    res.status(500).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try{
    const user = await db.collection('Users').doc(username).get();
    if (!user.exists) {
      return res.status(400).send({message: 'Username not found'});
    }
    else{
      const data = user.data();
      
      const isPasswordValid = await bcrypt.compare(password, data.password);
      if (!isPasswordValid) {
        return res.status(401).send({message: 'Invalid password'});
      }
      else{
        const token = jwt.sign({ username: username, name: data.name }, 'authToken', { expiresIn: '1h' });
        res.status(201).send({message: 'Login successfully', token});
      }

    }
  } catch ( error ) {
    res.status(500).send(error.message);
  }
});

app.post('/addNote', async (req, res) => {
  const { id, content, dateofmade, madeby } = req.body;

  try{
    const note = await db.collection('Notes').doc(id).get();
    if (note.exists) {
      return res.status(400).send({message: 'Note already exists'});
    }
    else{
      const timestamp = admin.firestore.Timestamp.fromDate(new Date(dateofmade));

      await db.collection('Notes').doc(id).set({
        content,
        Dateofmade: timestamp,
        madeby
      });

      res.status(201).send({message: 'Add Note successfully'});
    }
  } catch ( error ) {
    res.status(500).send(error.message);
  }
});

app.post('/getNoteInfo', async (req, res) => {
  const { id } = req.body;
  try {
    const note = await db.collection('Notes').doc(id).get();

  if (!note.exists) {
    return res.status(404).send({ message: 'Note not found' });
  }

  const noteData = note.data();
  res.status(200).json(noteData);
    
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/updateNote', async (req, res) => {
  const { id, oldcontent, newcontent, dateofedit } = req.body;

  try {
    const note = db.collection('Notes').doc(id);
    const noteData = await note.get();

  if (!noteData.exists) {
    return res.status(404).send({ message: 'Note not found' });
  }

  const timestamp = admin.firestore.Timestamp.fromDate(new Date(dateofedit));

  if( oldcontent !== newcontent && newcontent !== '' ){
    await note.update({
      content: newcontent
    });

    await db.collection('Histories').add({
      NoteId: id,
      oldContent: oldcontent,
      Dateofedit: timestamp
    });

    res.status(200).json({ message: 'Note updated successfully' });
  }
  else{
    res.status(200).json({ message: 'Note content not have change.' });
  }
    
  } catch (error) {
    res.status(500).send(error.message);
  } 

});
  
app.delete('/deleteNote/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('Notes').doc(id).delete();
    res.status(200).send({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message});
  }
});

app.post('/getAllHistories', async (req, res) => {
  const { name } = req.body;

  try {
    const noteDoc = await db.collection('Notes').where('madeby','==',name).get();

    if (noteDoc.empty) {
      return res.status(404).send('Note not found');
    }

    const notes = noteDoc.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const noteIds = notes.map(note => note.id);
    
    const allLog = await db.collection('Histories').where('NoteId', 'in', noteIds.slice(0, noteIds.length)).get();
    const logs = allLog.docs.map(item => {
      const data = item.data();
      return {
        id: item.id,
        ...data,
        Dateofedit: data.Dateofedit ? data.Dateofedit.toDate().toISOString() : null
      };
    });

    res.status(200).json(logs);
    
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app