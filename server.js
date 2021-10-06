let  mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();

const { PORT, DB } = require("./config");

function connectDB(params) {
  mongoose.connect(DB)
  .then(()=>{
    console.log('successfully connected to database')
  })
  .catch(()=>{
    console.log('error connecting to database')
    connectDB()
  })
}

connectDB()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/v1',require('./routes/auth'))
app.use('/api/v1/admin',require('./routes/admin'))
app.use('/api/v1/manager',require('./routes/manager'))
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
});
